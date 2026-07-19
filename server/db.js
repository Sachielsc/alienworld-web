import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import Database from 'better-sqlite3';
import bcrypt from 'bcryptjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.join(__dirname, 'data');
fs.mkdirSync(dataDir, { recursive: true });

export const db = new Database(path.join(dataDir, 'alienworld.db'));
db.pragma('journal_mode = WAL');

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    username      TEXT NOT NULL UNIQUE COLLATE NOCASE,
    password_hash TEXT NOT NULL,
    role          TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('admin', 'member')),
    created_at    TEXT NOT NULL DEFAULT (datetime('now'))
  );
`);

// The admin account comes from env, never from the register endpoint.
export function seedAdmin() {
  const username = process.env.ADMIN_USERNAME;
  const password = process.env.ADMIN_PASSWORD;
  if (!username || !password) {
    console.warn('ADMIN_USERNAME / ADMIN_PASSWORD not set - no admin account seeded.');
    return;
  }
  const hash = bcrypt.hashSync(password, 12);
  const existing = db.prepare('SELECT id FROM users WHERE username = ?').get(username);
  if (existing) {
    db.prepare("UPDATE users SET password_hash = ?, role = 'admin' WHERE id = ?").run(hash, existing.id);
  } else {
    db.prepare("INSERT INTO users (username, password_hash, role) VALUES (?, ?, 'admin')").run(username, hash);
  }
  console.log(`Admin account "${username}" ready.`);
}

export const findUserByUsername = (username) =>
  db.prepare('SELECT * FROM users WHERE username = ?').get(username);

export const findUserById = (id) =>
  db.prepare('SELECT id, username, role, created_at FROM users WHERE id = ?').get(id);

export const createUser = (username, passwordHash) =>
  db.prepare("INSERT INTO users (username, password_hash, role) VALUES (?, ?, 'member')").run(username, passwordHash);
