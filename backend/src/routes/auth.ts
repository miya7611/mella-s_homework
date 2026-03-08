import { Router } from 'express';
import { AuthService } from '../services/authService';
import { getDatabase, saveDatabase } from '../database/connection';
import { authenticate, requireParent, AuthRequest } from '../middleware/auth';

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

// Create child account (parent only)
router.post('/children', authenticate, requireParent, async (req: AuthRequest, res) => {
  try {
    const { username, password, avatar } = req.body;

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
    const child = await authService.createChild(req.user!.userId, { username, password, avatar });
    saveDatabase();

    res.status(201).json({
      success: true,
      data: child
    });
  } catch (error: any) {
    let code = 'CREATE_CHILD_FAILED';
    let message = 'Failed to create child account';
    let status = 400;

    if (error.message === 'USERNAME_EXISTS') {
      code = 'USERNAME_EXISTS';
      message = 'Username already exists';
    } else if (error.message === 'INVALID_PASSWORD') {
      code = 'INVALID_PASSWORD';
      message = 'Password must be at least 4 characters';
    }

    res.status(status).json({
      success: false,
      error: { code, message }
    });
  }
});

// Get children list (parent only)
router.get('/children', authenticate, requireParent, async (req: AuthRequest, res) => {
  try {
    const authService = getAuthService();
    const children = authService.getChildrenByParentId(req.user!.userId);

    res.json({
      success: true,
      data: children
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: { code: 'FETCH_FAILED', message: error.message }
    });
  }
});

// Update profile
router.put('/profile', authenticate, async (req: AuthRequest, res) => {
  try {
    const { avatar } = req.body;
    const authService = getAuthService();
    const user = await authService.updateProfile(req.user!.userId, { avatar });
    saveDatabase();

    res.json({
      success: true,
      data: user
    });
  } catch (error: any) {
    let code = 'UPDATE_FAILED';
    let message = 'Failed to update profile';
    let status = 400;

    if (error.message === 'USER_NOT_FOUND') {
      code = 'USER_NOT_FOUND';
      message = 'User not found';
      status = 404;
    }

    res.status(status).json({
      success: false,
      error: { code, message }
    });
  }
});

// Change password
router.put('/password', authenticate, async (req: AuthRequest, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'MISSING_FIELDS',
          message: 'Current password and new password are required'
        }
      });
    }

    const authService = getAuthService();
    await authService.changePassword(req.user!.userId, { currentPassword, newPassword });
    saveDatabase();

    res.json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error: any) {
    let code = 'CHANGE_PASSWORD_FAILED';
    let message = 'Failed to change password';
    let status = 400;

    if (error.message === 'INVALID_CURRENT_PASSWORD') {
      code = 'INVALID_CURRENT_PASSWORD';
      message = 'Current password is incorrect';
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

export default router;