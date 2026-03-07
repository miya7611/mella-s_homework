import initSqlJs, { Database, SqlJsStatic } from 'sql.js';
import * as fs from 'fs';
import * as path from 'path';

let db: Database | null = null;
let SQL: SqlJsStatic | null = null;

export async function initDatabase(dbPath?: string): Promise<Database> {
  if (db) return db;

  // Initialize SQL.js
  SQL = await initSqlJs();

  const databasePath = dbPath || process.env.DATABASE_PATH || path.join(__dirname, '../../../data/database.sqlite');

  // Ensure data directory exists
  const dir = path.dirname(databasePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  // Load existing database or create new one
  if (fs.existsSync(databasePath)) {
    const buffer = fs.readFileSync(databasePath);
    db = new SQL.Database(buffer);
  } else {
    db = new SQL.Database();
  }

  // Auto-save to file
  const saveDatabase = () => {
    if (db && databasePath) {
      const data = db.export();
      const buffer = Buffer.from(data);
      fs.writeFileSync(databasePath, buffer);
    }
  };

  // Save on process exit
  process.on('exit', saveDatabase);
  process.on('SIGINT', () => {
    saveDatabase();
    process.exit();
  });

  return db;
}

export function getDatabase(): Database {
  if (!db) {
    throw new Error('Database not initialized. Call initDatabase() first.');
  }
  return db;
}

export function closeDatabase(): void {
  if (db) {
    const databasePath = process.env.DATABASE_PATH || path.join(__dirname, '../../../data/database.sqlite');
    const data = db.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(databasePath, buffer);
    db.close();
    db = null;
  }
}

export function saveDatabase(): void {
  if (db) {
    const databasePath = process.env.DATABASE_PATH || path.join(__dirname, '../../../data/database.sqlite');
    const data = db.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(databasePath, buffer);
  }
}