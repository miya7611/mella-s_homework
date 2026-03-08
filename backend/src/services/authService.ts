import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { User, CreateUserData, LoginData } from '../models/User';
import { Database } from 'sql.js';

export class AuthService {
  constructor(private db: Database) {}

  async register(data: CreateUserData): Promise<{ user: Partial<User>; token: string }> {
    // Validate password
    this.validatePassword(data.password, data.role);

    // Check if username exists
    const existingUser = this.db.exec('SELECT id FROM users WHERE username = ?', [data.username]);
    if (existingUser.length > 0 && existingUser[0].values.length > 0) {
      throw new Error('USERNAME_EXISTS');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(data.password, 10);

    // Insert user
    this.db.run(
      'INSERT INTO users (username, password, role, parent_id, avatar) VALUES (?, ?, ?, ?, ?)',
      [data.username, hashedPassword, data.role, data.parent_id || null, data.avatar || null]
    );

    // Get created user
    const result = this.db.exec('SELECT * FROM users WHERE id = last_insert_rowid()');
    const user = this.rowToUser(result[0].values[0]);

    // Generate token
    const token = this.generateToken(user);

    return {
      user: this.sanitizeUser(user),
      token
    };
  }

  async login(data: LoginData): Promise<{ user: Partial<User>; token: string }> {
    // Find user
    const result = this.db.exec('SELECT * FROM users WHERE username = ?', [data.username]);

    if (result.length === 0 || result[0].values.length === 0) {
      throw new Error('INVALID_CREDENTIALS');
    }

    const user = this.rowToUser(result[0].values[0]);

    // Verify password
    const isValid = await bcrypt.compare(data.password, user.password);
    if (!isValid) {
      throw new Error('INVALID_CREDENTIALS');
    }

    // Generate token
    const token = this.generateToken(user);

    return {
      user: this.sanitizeUser(user),
      token
    };
  }

  getUserById(id: number): User | null {
    const result = this.db.exec('SELECT * FROM users WHERE id = ?', [id]);
    if (result.length === 0 || result[0].values.length === 0) {
      return null;
    }
    return this.rowToUser(result[0].values[0]);
  }

  async createChild(parentId: number, data: { username: string; password: string; avatar?: string }): Promise<Partial<User>> {
    // Validate password (child passwords need at least 4 chars)
    this.validatePassword(data.password, 'child');

    // Check if username exists
    const existingUser = this.db.exec('SELECT id FROM users WHERE username = ?', [data.username]);
    if (existingUser.length > 0 && existingUser[0].values.length > 0) {
      throw new Error('USERNAME_EXISTS');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(data.password, 10);

    // Insert child user with parent_id
    this.db.run(
      'INSERT INTO users (username, password, role, parent_id, avatar) VALUES (?, ?, ?, ?, ?)',
      [data.username, hashedPassword, 'child', parentId, data.avatar || null]
    );

    // Get created user
    const result = this.db.exec('SELECT * FROM users WHERE id = last_insert_rowid()');
    const user = this.rowToUser(result[0].values[0]);

    return this.sanitizeUser(user);
  }

  getChildrenByParentId(parentId: number): Partial<User>[] {
    const result = this.db.exec(
      'SELECT * FROM users WHERE parent_id = ? ORDER BY created_at ASC',
      [parentId]
    );

    if (result.length === 0 || result[0].values.length === 0) {
      return [];
    }

    return result[0].values.map((row) => this.sanitizeUser(this.rowToUser(row)));
  }

  private validatePassword(password: string, role: string): void {
    if (role === 'parent') {
      // Parent passwords must be at least 6 characters
      if (password.length < 6) {
        throw new Error('INVALID_PASSWORD');
      }
    } else {
      // Child passwords must be at least 4 characters
      if (password.length < 4) {
        throw new Error('INVALID_PASSWORD');
      }
    }
  }

  private generateToken(user: User): string {
    const secret = process.env.JWT_SECRET || 'default-secret-change-in-production';
    return jwt.sign(
      { userId: user.id, role: user.role },
      secret,
      { expiresIn: '7d' }
    );
  }

  private sanitizeUser(user: User): Partial<User> {
    const { password, ...sanitized } = user;
    return sanitized;
  }

  private rowToUser(row: any[]): User {
    return {
      id: row[0] as number,
      username: row[1] as string,
      password: row[2] as string,
      role: row[3] as 'parent' | 'child',
      parent_id: row[4] as number | undefined,
      avatar: row[5] as string | undefined,
      level: row[6] as number,
      total_points: row[7] as number,
      created_at: row[8] as string,
      updated_at: row[9] as string
    };
  }
}