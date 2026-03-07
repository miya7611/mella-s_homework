import { Router } from 'express';
import { AuthService } from '../services/authService';
import { getDatabase, saveDatabase } from '../database/connection';

const router = Router();

// Helper to get authService (created lazily)
const getAuthService = () => new AuthService(getDatabase());

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

    if (role !== 'parent' && role !== 'child') {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_ROLE',
          message: 'Role must be either "parent" or "child"'
        }
      });
    }

    const authService = getAuthService();
    const result = await authService.register({ username, password, role, avatar });
    saveDatabase();

    res.status(201).json({
      success: true,
      data: result
    });
  } catch (error: any) {
    let code = 'REGISTRATION_FAILED';
    let message = 'Registration failed';
    let status = 400;

    if (error.message === 'USERNAME_EXISTS') {
      code = 'USERNAME_EXISTS';
      message = 'Username already exists';
    } else if (error.message === 'INVALID_PASSWORD') {
      code = 'INVALID_PASSWORD';
      message = 'Password does not meet requirements (parent: min 6 chars, child: min 4 chars)';
    }

    res.status(status).json({
      success: false,
      error: { code, message }
    });
  }
});

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

    const authService = getAuthService();
    const result = await authService.login({ username, password });

    res.json({
      success: true,
      data: result
    });
  } catch (error: any) {
    let code = 'LOGIN_FAILED';
    let message = 'Login failed';
    let status = 401;

    if (error.message === 'INVALID_CREDENTIALS') {
      code = 'INVALID_CREDENTIALS';
      message = 'Invalid username or password';
    }

    res.status(status).json({
      success: false,
      error: { code, message }
    });
  }
});

export default router;