# 孩子作业管理系统实现计划

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 构建一个完整的孩子作业管理系统，支持任务管理、计时、积分奖励、森林成长可视化等功能

**Architecture:** 前后端分离的单体应用。前端使用 React + TypeScript + Vite，后端使用 Node.js + Express + SQLite。采用 TDD 开发模式，每个功能先写测试再实现。

**Tech Stack:** React 18, TypeScript, Vite, Tailwind CSS, shadcn/ui, Zustand, Node.js, Express, SQLite, JWT, bcrypt, Tesseract.js

---

## 阶段一：项目初始化与基础设施（Day 1-2）

### Task 1: 创建项目目录结构

**Files:**
- Create: `package.json`
- Create: `.gitignore`
- Create: `README.md`
- Create: `frontend/` directory
- Create: `backend/` directory

**Step 1: 初始化 Git 仓库**

```bash
git init
```

**Step 2: 创建 .gitignore 文件**

```bash
cat > .gitignore << 'EOF'
# Dependencies
node_modules/
*/node_modules/

# Build outputs
dist/
build/
*/dist/
*/build/

# Environment variables
.env
.env.local
.env.*.local

# Database
*.sqlite
*.db
data/

# IDE
.vscode/
.idea/
*.swp
*.swo
*~

# OS
.DS_Store
Thumbs.db

# Logs
logs/
*.log
npm-debug.log*

# Testing
coverage/
.nyc_output/

# Temporary files
tmp/
temp/
EOF
```

**Step 3: 创建根目录 package.json**

```bash
cat > package.json << 'EOF'
{
  "name": "homework-management-system",
  "version": "1.0.0",
  "description": "孩子作业管理系统 - 任务管理与激励系统",
  "private": true,
  "workspaces": [
    "frontend",
    "backend"
  ],
  "scripts": {
    "dev": "concurrently \"npm run dev:backend\" \"npm run dev:frontend\"",
    "dev:frontend": "npm run dev --workspace=frontend",
    "dev:backend": "npm run dev --workspace=backend",
    "build": "npm run build --workspace=frontend && npm run build --workspace=backend",
    "test": "npm run test --workspaces",
    "lint": "npm run lint --workspaces"
  },
  "devDependencies": {
    "concurrently": "^8.2.2"
  },
  "engines": {
    "node": ">=18.0.0"
  }
}
EOF
```

**Step 4: 创建 README.md**

```bash
cat > README.md << 'EOF'
# 孩子作业管理系统

一个帮助家长管理孩子作业的Web应用系统。

## 核心功能

- ✅ 任务管理（固定任务 + 动态任务）
- ✅ 时间规划与计时
- ✅ 积分奖励系统
- ✅ 森林成长可视化
- ✅ 统计分析

## 技术栈

- 前端：React 18 + TypeScript + Vite
- 后端：Node.js + Express
- 数据库：SQLite

## 快速开始

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

## 项目结构

```
.
├── frontend/          # React 前端应用
├── backend/           # Express 后端服务
├── docs/              # 文档
└── package.json       # 根配置文件
```
EOF
```

**Step 5: 创建基础目录结构**

```bash
mkdir -p frontend backend docs
```

**Step 6: 提交初始结构**

```bash
git add .
git commit -m "chore: initialize project structure"
```

---

### Task 2: 初始化后端项目

**Files:**
- Create: `backend/package.json`
- Create: `backend/tsconfig.json`
- Create: `backend/src/index.ts`
- Create: `backend/.env.example`

**Step 1: 创建后端 package.json**

```bash
cat > backend/package.json << 'EOF'
{
  "name": "backend",
  "version": "1.0.0",
  "description": "Homework Management System Backend",
  "main": "dist/index.js",
  "scripts": {
    "dev": "tsx watch src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js",
    "test": "jest",
    "test:watch": "jest --watch",
    "lint": "eslint src/**/*.ts"
  },
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "better-sqlite3": "^9.4.3",
    "bcrypt": "^5.1.1",
    "jsonwebtoken": "^9.0.2",
    "dotenv": "^16.4.1",
    "multer": "^1.4.5-lts.1",
    "sharp": "^0.33.2",
    "uuid": "^9.0.1"
  },
  "devDependencies": {
    "@types/express": "^4.17.21",
    "@types/cors": "^2.8.17",
    "@types/better-sqlite3": "^7.6.8",
    "@types/bcrypt": "^5.0.2",
    "@types/jsonwebtoken": "^9.0.5",
    "@types/multer": "^1.4.11",
    "@types/uuid": "^9.0.8",
    "@types/node": "^20.11.16",
    "typescript": "^5.3.3",
    "tsx": "^4.7.0",
    "jest": "^29.7.0",
    "@types/jest": "^29.5.12",
    "ts-jest": "^29.1.2",
    "supertest": "^6.3.4",
    "@types/supertest": "^6.0.2",
    "eslint": "^8.56.0",
    "@typescript-eslint/eslint-plugin": "^6.21.0",
    "@typescript-eslint/parser": "^6.21.0"
  }
}
EOF
```

**Step 2: 创建 TypeScript 配置**

```bash
cat > backend/tsconfig.json << 'EOF'
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "moduleResolution": "node"
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "**/*.test.ts"]
}
EOF
```

**Step 3: 创建环境变量示例**

```bash
cat > backend/.env.example << 'EOF'
PORT=3000
NODE_ENV=development
JWT_SECRET=your-super-secret-jwt-key-change-in-production
DATABASE_PATH=./data/database.sqlite
EOF
```

**Step 4: 创建入口文件**

```bash
mkdir -p backend/src
cat > backend/src/index.ts << 'EOF'
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
EOF
```

**Step 5: 测试后端启动**

```bash
cd backend
npm install
npm run dev
```

Expected: Server should start without errors on http://localhost:3000

**Step 6: 在另一个终端测试健康检查**

```bash
curl http://localhost:3000/health
```

Expected output:
```json
{"status":"ok","timestamp":"2026-03-02T..."}
```

**Step 7: 提交**

```bash
git add backend/
git commit -m "feat(backend): initialize Express server with TypeScript"
```

---

### Task 3: 初始化前端项目

**Files:**
- Create: `frontend/package.json`
- Create: `frontend/vite.config.ts`
- Create: `frontend/tsconfig.json`
- Create: `frontend/index.html`
- Create: `frontend/src/main.tsx`
- Create: `frontend/src/App.tsx`

**Step 1: 使用 Vite 创建 React 项目**

```bash
cd frontend
npm create vite@latest . -- --template react-ts
```

**Step 2: 安装额外依赖**

```bash
npm install react-router-dom zustand axios
npm install -D @types/react-router-dom
```

**Step 3: 更新 vite.config.ts**

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
})
```

**Step 4: 创建基础 App 组件**

```typescript
// frontend/src/App.tsx
import { useState } from 'react'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          孩子作业管理系统
        </h1>
        <p className="text-gray-600 mb-8">
          系统正在开发中...
        </p>
        <button
          onClick={() => setCount(count + 1)}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Count: {count}
        </button>
      </div>
    </div>
  )
}

export default App
```

**Step 5: 测试前端启动**

```bash
npm run dev
```

Expected: Frontend should start on http://localhost:5173

**Step 6: 在浏览器访问**

Open http://localhost:5173 in browser
Expected: Should see "孩子作业管理系统" heading and working button

**Step 7: 提交**

```bash
git add frontend/
git commit -m "feat(frontend): initialize React app with Vite and TypeScript"
```

---

### Task 4: 配置 Tailwind CSS

**Files:**
- Modify: `frontend/package.json`
- Create: `frontend/tailwind.config.js`
- Create: `frontend/postcss.config.js`
- Modify: `frontend/src/index.css`

**Step 1: 安装 Tailwind CSS**

```bash
cd frontend
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

**Step 2: 配置 tailwind.config.js**

```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

**Step 3: 更新 index.css**

```css
/* frontend/src/index.css */
@tailwind base;
@tailwind components;
@tailwind utilities;
```

**Step 4: 验证 Tailwind 工作**

之前的 App.tsx 已经使用了 Tailwind 类，启动开发服务器验证样式是否生效。

```bash
npm run dev
```

Expected: Page should have styled elements (gray background, blue button, etc.)

**Step 5: 提交**

```bash
git add frontend/
git commit -m "feat(frontend): configure Tailwind CSS"
```

---

### Task 5: 设置数据库连接与表结构

**Files:**
- Create: `backend/src/database/connection.ts`
- Create: `backend/src/database/schema.ts`
- Create: `backend/src/database/init.ts`
- Create: `backend/src/__tests__/database.test.ts`

**Step 1: 创建数据库连接测试**

```typescript
// backend/src/__tests__/database.test.ts
import { Database } from 'better-sqlite3';
import { createConnection } from '../database/connection';

describe('Database Connection', () => {
  let db: Database;

  beforeAll(() => {
    db = createConnection(':memory:');
  });

  afterAll(() => {
    db.close();
  });

  it('should create in-memory database connection', () => {
    expect(db).toBeDefined();
    expect(db.open).toBe(true);
  });

  it('should execute simple query', () => {
    const result = db.prepare('SELECT 1 as value').get() as { value: number };
    expect(result.value).toBe(1);
  });
});
```

**Step 2: 运行测试确认失败**

```bash
cd backend
npm test
```

Expected: Test should fail with "Cannot find module '../database/connection'"

**Step 3: 创建数据库连接模块**

```typescript
// backend/src/database/connection.ts
import Database from 'better-sqlite3';
import path from 'path';

export function createConnection(dbPath?: string): Database.Database {
  const databasePath = dbPath || process.env.DATABASE_PATH || path.join(__dirname, '../../data/database.sqlite');

  // Ensure data directory exists
  const fs = require('fs');
  const dir = path.dirname(databasePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  const db = new Database(databasePath);
  db.pragma('journal_mode = WAL');

  return db;
}
```

**Step 4: 运行测试确认通过**

```bash
npm test
```

Expected: All tests should pass

**Step 5: 创建数据库 schema**

```typescript
// backend/src/database/schema.ts
export const createTables = `
  -- Users table
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(10) NOT NULL CHECK(role IN ('parent', 'child')),
    avatar VARCHAR(255),
    level INTEGER DEFAULT 1,
    total_points INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );

  -- Tasks table
  CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    category VARCHAR(50) NOT NULL,
    assigned_to INTEGER NOT NULL,
    created_by INTEGER NOT NULL,
    suggested_duration INTEGER,
    scheduled_date DATE NOT NULL,
    scheduled_time TIME,
    status VARCHAR(20) DEFAULT 'pending' CHECK(status IN ('pending', 'planned', 'in_progress', 'completed', 'overtime')),
    points INTEGER DEFAULT 0,
    bonus_items TEXT,
    overtime_penalty TEXT,
    actual_start_time TIMESTAMP,
    actual_end_time TIMESTAMP,
    overtime_minutes INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (assigned_to) REFERENCES users(id),
    FOREIGN KEY (created_by) REFERENCES users(id)
  );

  -- Time logs table
  CREATE TABLE IF NOT EXISTS time_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    task_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP,
    duration INTEGER,
    is_overtime INTEGER DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (task_id) REFERENCES tasks(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
  );

  -- Rewards table
  CREATE TABLE IF NOT EXISTS rewards (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    task_id INTEGER,
    type VARCHAR(20) NOT NULL CHECK(type IN ('points', 'item', 'exchange')),
    amount INTEGER,
    item_name VARCHAR(100),
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (task_id) REFERENCES tasks(id)
  );

  -- User items table
  CREATE TABLE IF NOT EXISTS user_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    item_type VARCHAR(50) NOT NULL,
    item_name VARCHAR(100) NOT NULL,
    quantity INTEGER DEFAULT 0,
    icon_url VARCHAR(255),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    UNIQUE(user_id, item_type, item_name)
  );

  -- Exchangeable rewards table
  CREATE TABLE IF NOT EXISTS exchangeable_rewards (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    required_points INTEGER NOT NULL,
    required_items TEXT,
    created_by INTEGER NOT NULL,
    is_active INTEGER DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id)
  );

  -- Reward exchanges table
  CREATE TABLE IF NOT EXISTS reward_exchanges (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    reward_id INTEGER NOT NULL,
    points_spent INTEGER NOT NULL,
    items_spent TEXT,
    status VARCHAR(20) DEFAULT 'pending' CHECK(status IN ('pending', 'fulfilled')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fulfilled_at TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (reward_id) REFERENCES exchangeable_rewards(id)
  );

  -- Create indexes
  CREATE INDEX IF NOT EXISTS idx_tasks_assigned_to ON tasks(assigned_to);
  CREATE INDEX IF NOT EXISTS idx_tasks_scheduled_date ON tasks(scheduled_date);
  CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
  CREATE INDEX IF NOT EXISTS idx_time_logs_task_id ON time_logs(task_id);
  CREATE INDEX IF NOT EXISTS idx_rewards_user_id ON rewards(user_id);
`;
```

**Step 6: 创建数据库初始化函数**

```typescript
// backend/src/database/init.ts
import { Database } from 'better-sqlite3';
import { createTables } from './schema';

export function initializeDatabase(db: Database): void {
  db.exec(createTables);
  console.log('Database tables created successfully');
}
```

**Step 7: 创建 schema 初始化测试**

```typescript
// backend/src/__tests__/database-schema.test.ts
import { Database } from 'better-sqlite3';
import { createConnection } from '../database/connection';
import { initializeDatabase } from '../database/init';

describe('Database Schema', () => {
  let db: Database;

  beforeAll(() => {
    db = createConnection(':memory:');
    initializeDatabase(db);
  });

  afterAll(() => {
    db.close();
  });

  it('should create users table', () => {
    const result = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='users'").get();
    expect(result).toBeDefined();
  });

  it('should create tasks table', () => {
    const result = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='tasks'").get();
    expect(result).toBeDefined();
  });

  it('should create all required tables', () => {
    const tables = ['users', 'tasks', 'time_logs', 'rewards', 'user_items', 'exchangeable_rewards', 'reward_exchanges'];
    tables.forEach(table => {
      const result = db.prepare(`SELECT name FROM sqlite_master WHERE type='table' AND name='${table}'`).get();
      expect(result).toBeDefined();
    });
  });
});
```

**Step 8: 运行所有测试**

```bash
npm test
```

Expected: All tests should pass

**Step 9: 提交**

```bash
git add backend/
git commit -m "feat(backend): setup SQLite database with schema and connection"
```

---

## 阶段二：用户认证系统（Day 3-4）

### Task 6: 实现用户注册功能

**Files:**
- Create: `backend/src/models/User.ts`
- Create: `backend/src/services/authService.ts`
- Create: `backend/src/routes/auth.ts`
- Create: `backend/src/__tests__/auth.test.ts`

**Step 1: 创建用户注册测试**

```typescript
// backend/src/__tests__/auth.test.ts
import request from 'supertest';
import express from 'express';
import { createConnection } from '../database/connection';
import { initializeDatabase } from '../database/init';
import authRoutes from '../routes/auth';
import { Database } from 'better-sqlite3';

describe('Auth Endpoints', () => {
  let app: express.Application;
  let db: Database;

  beforeAll(() => {
    db = createConnection(':memory:');
    initializeDatabase(db);

    app = express();
    app.use(express.json());
    app.use('/api/auth', authRoutes(db));
  });

  afterAll(() => {
    db.close();
  });

  describe('POST /api/auth/register', () => {
    it('should register a new parent user', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'parent1',
          password: 'password123',
          role: 'parent'
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.user).toBeDefined();
      expect(response.body.data.user.username).toBe('parent1');
      expect(response.body.data.user.role).toBe('parent');
      expect(response.body.data.token).toBeDefined();
    });

    it('should not allow duplicate username', async () => {
      await request(app)
        .post('/api/auth/register')
        .send({
          username: 'parent2',
          password: 'password123',
          role: 'parent'
        });

      const response = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'parent2',
          password: 'password456',
          role: 'parent'
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should validate password strength for parent', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'parent3',
          password: '123',  // Too short
          role: 'parent'
        });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('INVALID_PASSWORD');
    });
  });
});
```

**Step 2: 运行测试确认失败**

```bash
npm test auth.test.ts
```

Expected: Test should fail

**Step 3: 创建用户模型**

```typescript
// backend/src/models/User.ts
export interface User {
  id: number;
  username: string;
  password: string;
  role: 'parent' | 'child';
  avatar?: string;
  level: number;
  total_points: number;
  created_at: string;
  updated_at: string;
}

export interface CreateUserData {
  username: string;
  password: string;
  role: 'parent' | 'child';
  avatar?: string;
}
```

**Step 4: 创建认证服务**

```typescript
// backend/src/services/authService.ts
import { Database } from 'better-sqlite3';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { User, CreateUserData } from '../models/User';

export class AuthService {
  constructor(private db: Database) {}

  async register(data: CreateUserData): Promise<{ user: Partial<User>; token: string }> {
    // Validate password
    this.validatePassword(data.password, data.role);

    // Check if username exists
    const existingUser = this.db.prepare('SELECT id FROM users WHERE username = ?').get(data.username);
    if (existingUser) {
      throw new Error('USERNAME_EXISTS');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(data.password, 10);

    // Insert user
    const result = this.db.prepare(`
      INSERT INTO users (username, password, role, avatar)
      VALUES (?, ?, ?, ?)
    `).run(data.username, hashedPassword, data.role, data.avatar || null);

    // Get created user
    const user = this.db.prepare('SELECT * FROM users WHERE id = ?').get(result.lastInsertRowid) as User;

    // Generate token
    const token = this.generateToken(user);

    return {
      user: this.sanitizeUser(user),
      token
    };
  }

  private validatePassword(password: string, role: string): void {
    if (role === 'parent') {
      // Parent password: at least 8 chars with letters and numbers
      if (password.length < 8 || !/[a-zA-Z]/.test(password) || !/[0-9]/.test(password)) {
        throw new Error('INVALID_PASSWORD');
      }
    } else {
      // Child password: at least 4 digits
      if (password.length < 4 || !/^\d+$/.test(password)) {
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
}
```

**Step 5: 创建认证路由**

```typescript
// backend/src/routes/auth.ts
import { Router } from 'express';
import { Database } from 'better-sqlite3';
import { AuthService } from '../services/authService';

export default function(db: Database): Router {
  const router = Router();
  const authService = new AuthService(db);

  router.post('/register', async (req, res) => {
    try {
      const { username, password, role, avatar } = req.body;

      if (!username || !password || !role) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'MISSING_FIELDS',
            message: 'Username, password, and role are required'
          }
        });
      }

      const result = await authService.register({ username, password, role, avatar });

      res.status(201).json({
        success: true,
        data: result
      });
    } catch (error: any) {
      let code = 'REGISTRATION_FAILED';
      let message = 'Registration failed';

      if (error.message === 'USERNAME_EXISTS') {
        code = 'USERNAME_EXISTS';
        message = 'Username already exists';
      } else if (error.message === 'INVALID_PASSWORD') {
        code = 'INVALID_PASSWORD';
        message = 'Password does not meet requirements';
      }

      res.status(400).json({
        success: false,
        error: { code, message }
      });
    }
  });

  return router;
}
```

**Step 6: 更新主应用以使用路由**

```typescript
// backend/src/index.ts
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createConnection } from './database/connection';
import { initializeDatabase } from './database/init';
import authRoutes from './routes/auth';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const db = createConnection();

// Initialize database
initializeDatabase(db);

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes(db));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

export { db };
```

**Step 7: 运行测试确认通过**

```bash
npm test auth.test.ts
```

Expected: All tests should pass

**Step 8: 提交**

```bash
git add backend/
git commit -m "feat(backend): implement user registration with password validation"
```

---

### Task 7: 实现用户登录功能

**Files:**
- Modify: `backend/src/services/authService.ts`
- Modify: `backend/src/routes/auth.ts`
- Modify: `backend/src/__tests__/auth.test.ts`

**Step 1: 添加登录测试**

```typescript
// Add to backend/src/__tests__/auth.test.ts

describe('POST /api/auth/login', () => {
  beforeEach(async () => {
    // Create a test user
    await request(app)
      .post('/api/auth/register')
      .send({
        username: 'loginuser',
        password: 'password123',
        role: 'parent'
      });
  });

  it('should login with correct credentials', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        username: 'loginuser',
        password: 'password123'
      });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.token).toBeDefined();
    expect(response.body.data.user.username).toBe('loginuser');
  });

  it('should fail with wrong password', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        username: 'loginuser',
        password: 'wrongpassword'
      });

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
  });

  it('should fail with non-existent username', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        username: 'nonexistent',
        password: 'password123'
      });

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
  });
});
```

**Step 2: 运行测试确认失败**

```bash
npm test auth.test.ts
```

Expected: New login tests should fail

**Step 3: 在 AuthService 中添加 login 方法**

```typescript
// Add to backend/src/services/authService.ts

async login(username: string, password: string): Promise<{ user: Partial<User>; token: string }> {
  // Find user
  const user = this.db.prepare('SELECT * FROM users WHERE username = ?').get(username) as User;

  if (!user) {
    throw new Error('INVALID_CREDENTIALS');
  }

  // Verify password
  const isValidPassword = await bcrypt.compare(password, user.password);
  if (!isValidPassword) {
    throw new Error('INVALID_CREDENTIALS');
  }

  // Generate token
  const token = this.generateToken(user);

  return {
    user: this.sanitizeUser(user),
    token
  };
}
```

**Step 4: 在路由中添加登录端点**

```typescript
// Add to backend/src/routes/auth.ts

router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'MISSING_FIELDS',
          message: 'Username and password are required'
        }
      });
    }

    const result = await authService.login(username, password);

    res.json({
      success: true,
      data: result
    });
  } catch (error: any) {
    if (error.message === 'INVALID_CREDENTIALS') {
      return res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_CREDENTIALS',
          message: 'Invalid username or password'
        }
      });
    }

    res.status(500).json({
      success: false,
      error: {
        code: 'LOGIN_FAILED',
        message: 'Login failed'
      }
    });
  }
});
```

**Step 5: 运行测试确认通过**

```bash
npm test auth.test.ts
```

Expected: All tests should pass

**Step 6: 提交**

```bash
git add backend/
git commit -m "feat(backend): implement user login with JWT authentication"
```

---

### Task 8: 实现认证中间件

**Files:**
- Create: `backend/src/middleware/auth.ts`
- Create: `backend/src/__tests__/middleware.test.ts`

**Step 1: 创建中间件测试**

```typescript
// backend/src/__tests__/middleware.test.ts
import request from 'supertest';
import express from 'express';
import { createConnection } from '../database/connection';
import { initializeDatabase } from '../database/init';
import { authenticate, requireParent } from '../middleware/auth';
import { AuthService } from '../services/authService';
import { Database } from 'better-sqlite3';

describe('Auth Middleware', () => {
  let app: express.Application;
  let db: Database;
  let authService: AuthService;
  let parentToken: string;
  let childToken: string;

  beforeAll(async () => {
    db = createConnection(':memory:');
    initializeDatabase(db);
    authService = new AuthService(db);

    // Create test users
    const parent = await authService.register({
      username: 'parent',
      password: 'password123',
      role: 'parent'
    });
    parentToken = parent.token;

    const child = await authService.register({
      username: 'child',
      password: '1234',
      role: 'child'
    });
    childToken = child.token;

    app = express();
    app.use(express.json());

    // Protected route
    app.get('/protected', authenticate, (req, res) => {
      res.json({ success: true, user: req.user });
    });

    // Parent-only route
    app.get('/parent-only', authenticate, requireParent, (req, res) => {
      res.json({ success: true, message: 'Parent access granted' });
    });
  });

  afterAll(() => {
    db.close();
  });

  describe('authenticate middleware', () => {
    it('should allow access with valid token', async () => {
      const response = await request(app)
        .get('/protected')
        .set('Authorization', `Bearer ${parentToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.user).toBeDefined();
    });

    it('should deny access without token', async () => {
      const response = await request(app)
        .get('/protected');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it('should deny access with invalid token', async () => {
      const response = await request(app)
        .get('/protected')
        .set('Authorization', 'Bearer invalid-token');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });

  describe('requireParent middleware', () => {
    it('should allow parent access', async () => {
      const response = await request(app)
        .get('/parent-only')
        .set('Authorization', `Bearer ${parentToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('should deny child access', async () => {
      const response = await request(app)
        .get('/parent-only')
        .set('Authorization', `Bearer ${childToken}`);

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
    });
  });
});
```

**Step 2: 运行测试确认失败**

```bash
npm test middleware.test.ts
```

Expected: Tests should fail

**Step 3: 创建认证中间件**

```typescript
// backend/src/middleware/auth.ts
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
  user?: {
    userId: number;
    role: string;
  };
}

export function authenticate(req: AuthRequest, res: Response, next: NextFunction): void {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        success: false,
        error: {
          code: 'NO_TOKEN',
          message: 'No authentication token provided'
        }
      });
      return;
    }

    const token = authHeader.substring(7);
    const secret = process.env.JWT_SECRET || 'default-secret-change-in-production';

    const decoded = jwt.verify(token, secret) as { userId: number; role: string };
    req.user = decoded;

    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      error: {
        code: 'INVALID_TOKEN',
        message: 'Invalid or expired token'
      }
    });
  }
}

export function requireParent(req: AuthRequest, res: Response, next: NextFunction): void {
  if (!req.user || req.user.role !== 'parent') {
    res.status(403).json({
      success: false,
      error: {
        code: 'FORBIDDEN',
        message: 'This action requires parent privileges'
      }
    });
    return;
  }

  next();
}
```

**Step 4: 运行测试确认通过**

```bash
npm test middleware.test.ts
```

Expected: All tests should pass

**Step 5: 提交**

```bash
git add backend/
git commit -m "feat(backend): add authentication and authorization middleware"
```

---

## 阶段三：任务管理系统（Day 5-7）

### Task 9: 实现任务 CRUD 操作

**Files:**
- Create: `backend/src/models/Task.ts`
- Create: `backend/src/services/taskService.ts`
- Create: `backend/src/routes/tasks.ts`
- Create: `backend/src/__tests__/tasks.test.ts`

**Step 1: 创建任务模型**

```typescript
// backend/src/models/Task.ts
export type TaskStatus = 'pending' | 'planned' | 'in_progress' | 'completed' | 'overtime';
export type TaskCategory = 'school' | 'hobby' | 'family' | 'custom';

export interface Task {
  id: number;
  title: string;
  description?: string;
  category: TaskCategory;
  assigned_to: number;
  created_by: number;
  suggested_duration?: number;
  scheduled_date: string;
  scheduled_time?: string;
  status: TaskStatus;
  points: number;
  bonus_items?: string; // JSON string
  overtime_penalty?: string; // JSON string
  actual_start_time?: string;
  actual_end_time?: string;
  overtime_minutes: number;
  created_at: string;
  updated_at: string;
}

export interface CreateTaskData {
  title: string;
  description?: string;
  category: TaskCategory;
  assigned_to: number;
  suggested_duration?: number;
  scheduled_date: string;
  scheduled_time?: string;
  points: number;
  bonus_items?: any;
  overtime_penalty?: any;
}
```

**Step 2: 创建任务测试**

```typescript
// backend/src/__tests__/tasks.test.ts
import request from 'supertest';
import express from 'express';
import { createConnection } from '../database/connection';
import { initializeDatabase } from '../database/init';
import tasksRoutes from '../routes/tasks';
import authRoutes from '../routes/auth';
import { Database } from 'better-sqlite3';

describe('Tasks Endpoints', () => {
  let app: express.Application;
  let db: Database;
  let parentToken: string;
  let childId: number;

  beforeAll(async () => {
    db = createConnection(':memory:');
    initializeDatabase(db);

    app = express();
    app.use(express.json());
    app.use('/api/auth', authRoutes(db));
    app.use('/api/tasks', tasksRoutes(db));

    // Create parent
    const parentRes = await request(app)
      .post('/api/auth/register')
      .send({
        username: 'parent',
        password: 'password123',
        role: 'parent'
      });
    parentToken = parentRes.body.data.token;

    // Create child
    const childRes = await request(app)
      .post('/api/auth/register')
      .send({
        username: 'child',
        password: '1234',
        role: 'child'
      });
    childId = childRes.body.data.user.id;
  });

  afterAll(() => {
    db.close();
  });

  describe('POST /api/tasks', () => {
    it('should create a new task', async () => {
      const response = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${parentToken}`)
        .send({
          title: '语文作业',
          description: '完成练习册第10页',
          category: 'school',
          assigned_to: childId,
          suggested_duration: 30,
          scheduled_date: '2026-03-02',
          points: 30,
          bonus_items: JSON.stringify([{ type: 'star', quantity: 2 }])
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.title).toBe('语文作业');
      expect(response.body.data.status).toBe('pending');
    });

    it('should require authentication', async () => {
      const response = await request(app)
        .post('/api/tasks')
        .send({
          title: 'Test task',
          category: 'school',
          assigned_to: childId,
          scheduled_date: '2026-03-02',
          points: 10
        });

      expect(response.status).toBe(401);
    });
  });

  describe('GET /api/tasks', () => {
    beforeEach(async () => {
      // Create a task
      await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${parentToken}`)
        .send({
          title: '数学作业',
          category: 'school',
          assigned_to: childId,
          scheduled_date: '2026-03-02',
          points: 20
        });
    });

    it('should get tasks list', async () => {
      const response = await request(app)
        .get('/api/tasks')
        .set('Authorization', `Bearer ${parentToken}`)
        .query({ date: '2026-03-02' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.data.length).toBeGreaterThan(0);
    });
  });
});
```

**Step 3: 运行测试确认失败**

```bash
npm test tasks.test.ts
```

Expected: Tests should fail

**Step 4: 创建任务服务**

```typescript
// backend/src/services/taskService.ts
import { Database } from 'better-sqlite3';
import { Task, CreateTaskData } from '../models/Task';

export class TaskService {
  constructor(private db: Database) {}

  createTask(data: CreateTaskData, createdBy: number): Task {
    const result = this.db.prepare(`
      INSERT INTO tasks (
        title, description, category, assigned_to, created_by,
        suggested_duration, scheduled_date, scheduled_time,
        points, bonus_items, overtime_penalty
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      data.title,
      data.description || null,
      data.category,
      data.assigned_to,
      createdBy,
      data.suggested_duration || null,
      data.scheduled_date,
      data.scheduled_time || null,
      data.points,
      data.bonus_items ? JSON.stringify(data.bonus_items) : null,
      data.overtime_penalty ? JSON.stringify(data.overtime_penalty) : null
    );

    return this.getTaskById(result.lastInsertRowid as number)!;
  }

  getTaskById(id: number): Task | undefined {
    return this.db.prepare('SELECT * FROM tasks WHERE id = ?').get(id) as Task | undefined;
  }

  getTasks(filters: { date?: string; assigned_to?: number; status?: string }): Task[] {
    let query = 'SELECT * FROM tasks WHERE 1=1';
    const params: any[] = [];

    if (filters.date) {
      query += ' AND scheduled_date = ?';
      params.push(filters.date);
    }

    if (filters.assigned_to) {
      query += ' AND assigned_to = ?';
      params.push(filters.assigned_to);
    }

    if (filters.status) {
      query += ' AND status = ?';
      params.push(filters.status);
    }

    query += ' ORDER BY scheduled_date, scheduled_time';

    return this.db.prepare(query).all(...params) as Task[];
  }

  updateTask(id: number, data: Partial<CreateTaskData>): Task | undefined {
    const fields: string[] = [];
    const values: any[] = [];

    if (data.title !== undefined) {
      fields.push('title = ?');
      values.push(data.title);
    }
    if (data.description !== undefined) {
      fields.push('description = ?');
      values.push(data.description);
    }
    if (data.status !== undefined) {
      fields.push('status = ?');
      values.push(data.status);
    }

    if (fields.length === 0) {
      return this.getTaskById(id);
    }

    fields.push('updated_at = CURRENT_TIMESTAMP');
    values.push(id);

    this.db.prepare(`UPDATE tasks SET ${fields.join(', ')} WHERE id = ?`).run(...values);

    return this.getTaskById(id);
  }

  deleteTask(id: number): boolean {
    const result = this.db.prepare('DELETE FROM tasks WHERE id = ?').run(id);
    return result.changes > 0;
  }
}
```

**Step 5: 创建任务路由**

```typescript
// backend/src/routes/tasks.ts
import { Router } from 'express';
import { Database } from 'better-sqlite3';
import { TaskService } from '../services/taskService';
import { authenticate, requireParent, AuthRequest } from '../middleware/auth';

export default function(db: Database): Router {
  const router = Router();
  const taskService = new TaskService(db);

  // All routes require authentication
  router.use(authenticate);

  router.post('/', requireParent, (req: AuthRequest, res) => {
    try {
      const task = taskService.createTask(req.body, req.user!.userId);

      res.status(201).json({
        success: true,
        data: task
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: {
          code: 'TASK_CREATION_FAILED',
          message: error.message
        }
      });
    }
  });

  router.get('/', (req: AuthRequest, res) => {
    try {
      const filters = {
        date: req.query.date as string,
        assigned_to: req.query.assigned_to ? parseInt(req.query.assigned_to as string) : undefined,
        status: req.query.status as string
      };

      const tasks = taskService.getTasks(filters);

      res.json({
        success: true,
        data: tasks
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: {
          code: 'TASKS_FETCH_FAILED',
          message: error.message
        }
      });
    }
  });

  router.get('/:id', (req: AuthRequest, res) => {
    try {
      const task = taskService.getTaskById(parseInt(req.params.id));

      if (!task) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'TASK_NOT_FOUND',
            message: 'Task not found'
          }
        });
      }

      res.json({
        success: true,
        data: task
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: {
          code: 'TASK_FETCH_FAILED',
          message: error.message
        }
      });
    }
  });

  router.put('/:id', requireParent, (req: AuthRequest, res) => {
    try {
      const task = taskService.updateTask(parseInt(req.params.id), req.body);

      if (!task) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'TASK_NOT_FOUND',
            message: 'Task not found'
          }
        });
      }

      res.json({
        success: true,
        data: task
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: {
          code: 'TASK_UPDATE_FAILED',
          message: error.message
        }
      });
    }
  });

  router.delete('/:id', requireParent, (req: AuthRequest, res) => {
    try {
      const deleted = taskService.deleteTask(parseInt(req.params.id));

      if (!deleted) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'TASK_NOT_FOUND',
            message: 'Task not found'
          }
        });
      }

      res.json({
        success: true,
        message: 'Task deleted successfully'
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: {
          code: 'TASK_DELETE_FAILED',
          message: error.message
        }
      });
    }
  });

  return router;
}
```

**Step 6: 更新主应用以使用任务路由**

```typescript
// Add to backend/src/index.ts
import tasksRoutes from './routes/tasks';

// ... existing code ...

app.use('/api/tasks', tasksRoutes(db));
```

**Step 7: 运行测试确认通过**

```bash
npm test tasks.test.ts
```

Expected: All tests should pass

**Step 8: 提交**

```bash
git add backend/
git commit -m "feat(backend): implement task CRUD operations with authentication"
```

---

## 继续任务...

由于篇幅限制，完整的实现计划包含约50个详细的任务，覆盖：

- 阶段四：计时系统与超时处理（Day 8-10）
- 阶段五：积分与奖励系统（Day 11-13）
- 阶段六：森林成长与可视化（Day 14-16）
- 阶段七：统计与报表（Day 17-18）
- 阶段八：OCR识别功能（Day 19-20）
- 阶段九：前端开发（Day 21-30）
- 阶段十：测试与优化（Day 31-35）

每个任务都遵循相同的TDD模式：写测试 → 运行测试（失败）→ 实现功能 → 运行测试（通过）→ 提交代码。

**是否继续生成剩余任务的详细计划？**
