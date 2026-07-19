import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { findUserByUsername, findUserById, createUser } from '../db.js';

const router = Router();

const USERNAME_RE = /^[a-zA-Z0-9_-]{3,30}$/;

router.post('/register', (req, res) => {
  const { username, password } = req.body ?? {};
  if (typeof username !== 'string' || !USERNAME_RE.test(username)) {
    return res.status(400).json({ error: 'Username must be 3-30 characters: letters, numbers, _ or -.' });
  }
  if (typeof password !== 'string' || password.length < 8 || password.length > 128) {
    return res.status(400).json({ error: 'Password must be 8-128 characters.' });
  }
  if (findUserByUsername(username)) {
    return res.status(409).json({ error: 'Username already taken.' });
  }
  const result = createUser(username, bcrypt.hashSync(password, 12));
  req.session.userId = result.lastInsertRowid;
  res.status(201).json({ user: findUserById(result.lastInsertRowid) });
});

router.post('/login', (req, res) => {
  const { username, password } = req.body ?? {};
  const user = typeof username === 'string' ? findUserByUsername(username) : null;
  if (!user || typeof password !== 'string' || !bcrypt.compareSync(password, user.password_hash)) {
    return res.status(401).json({ error: 'Invalid username or password.' });
  }
  req.session.regenerate((err) => {
    if (err) return res.status(500).json({ error: 'Session error.' });
    req.session.userId = user.id;
    res.json({ user: findUserById(user.id) });
  });
});

router.post('/logout', (req, res) => {
  req.session.destroy(() => {
    res.clearCookie('alienworld.sid');
    res.json({ ok: true });
  });
});

router.get('/me', (req, res) => {
  if (!req.session.userId) return res.json({ user: null });
  res.json({ user: findUserById(req.session.userId) ?? null });
});

export default router;
