import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Router } from 'express';
import { findUserById } from '../db.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const contentDir = path.join(__dirname, '..', 'protected-content');

// Cover letter and work log are personal documents: admin only.
const DOCS = {
  coverletter: 'coverletter.html',
  worklog: 'worklog.html',
};

function requireAdmin(req, res, next) {
  if (!req.session.userId) return res.status(401).json({ error: 'Login required.' });
  const user = findUserById(req.session.userId);
  if (!user || user.role !== 'admin') return res.status(403).json({ error: 'Admin only.' });
  next();
}

const router = Router();

router.get('/:doc', requireAdmin, (req, res) => {
  const file = DOCS[req.params.doc];
  if (!file) return res.status(404).json({ error: 'Unknown document.' });
  const html = fs.readFileSync(path.join(contentDir, file), 'utf8');
  res.json({ html });
});

export default router;
