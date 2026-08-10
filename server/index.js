import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';
import helmet from 'helmet';
import session from 'express-session';
import SqliteStoreFactory from 'better-sqlite3-session-store';
import rateLimit from 'express-rate-limit';
import { db, seedAdmin } from './db.js';
import authRoutes from './routes/auth.js';
import protectedRoutes from './routes/protected.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const port = process.env.PORT || 3010;
const isProduction = process.env.NODE_ENV === 'production';
// Public sub-path the site is served under. Must match `base` in client/vite.config.js,
// which bakes it into the built asset URLs. Everything is mounted under it so `npm start`
// behaves exactly like production and nginx stays a plain pass-through proxy.
const basePath = (process.env.BASE_PATH || '/alienworld').replace(/\/$/, '');

if (isProduction && !process.env.SESSION_SECRET) {
  throw new Error('SESSION_SECRET must be set in production.');
}

seedAdmin();

app.use(helmet({ contentSecurityPolicy: false }));
app.use(express.json({ limit: '50kb' }));

// Behind the nginx reverse proxy in production.
if (isProduction) app.set('trust proxy', 1);

const SqliteStore = SqliteStoreFactory(session);
app.use(session({
  store: new SqliteStore({ client: db, expired: { clear: true, intervalMs: 15 * 60 * 1000 } }),
  name: 'alienworld.sid',
  secret: process.env.SESSION_SECRET || 'dev-only-secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    sameSite: 'lax',
    secure: isProduction,
    // scoped to the sub-path, so a sibling app on this host never receives the session
    path: basePath || '/',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  },
}));

// Everything the browser reaches hangs off basePath.
const site = express.Router();

const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 20, standardHeaders: true });
site.use(['/api/login', '/api/register'], authLimiter);

site.get('/api/health', (req, res) => res.json({ status: 'ok' }));
site.use('/api', authRoutes);
site.use('/api/protected', protectedRoutes);

// Serve the built client + SPA fallback (dev uses the Vite server instead).
const clientDist = path.join(__dirname, '..', 'client', 'dist');
if (fs.existsSync(clientDist)) {
  site.use(express.static(clientDist));
  site.use((req, res, next) => {
    if (req.path.startsWith('/api/')) return next();
    res.sendFile(path.join(clientDist, 'index.html'));
  });
}

app.use(basePath || '/', site);
if (basePath) app.get('/', (req, res) => res.redirect(`${basePath}/`));

app.use((req, res) => res.status(404).json({ error: 'Not found.' }));

app.listen(port, () => {
  console.log(`alienworld server listening on port ${port} (${isProduction ? 'production' : 'development'})`);
});
