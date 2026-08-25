import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { UserModel } from '../models/User.js';
import { signAccessToken, signRefreshToken } from '../utils/jwt.js';

export const authRouter = Router();

authRouter.post('/register', async (req, res, next) => {
  try {
    const { name, email, password, phone, role, stateCode, state, district, city } = req.body as {
      name?: string;
      email?: string;
      password?: string;
      phone?: string;
      role?: 'Citizen' | 'Government Officer' | 'Department Head' | 'Admin';
      stateCode?: string;
      state?: string;
      district?: string;
      city?: string;
    };

    if (!name || !email) {
      return res.status(400).json({ message: 'Name and email are required' });
    }

    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: 'Email is already registered' });
    }

    const finalPassword = password || 'Password@123';
    const passwordHash = await bcrypt.hash(finalPassword, 12);
    const user = await UserModel.create({
      name,
      email,
      phone,
      stateCode,
      state,
      district,
      city,
      role: role || 'Citizen',
      passwordHash,
    });
    const payload = { userId: user._id.toString(), role: user.role };

    return res.status(201).json({
      message: 'Registration successful',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        stateCode: user.stateCode,
        state: user.state,
        district: user.district,
        city: user.city,
        role: user.role,
      },
      accessToken: signAccessToken(payload),
      refreshToken: signRefreshToken(payload),
    });
  } catch (error) {
    next(error);
  }
});

authRouter.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body as { email?: string; password?: string };

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await UserModel.findOne({ email }).select('+passwordHash');
    if (!user?.passwordHash) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const payload = { userId: user._id.toString(), role: user.role };
    return res.json({
      message: 'Login successful',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      accessToken: signAccessToken(payload),
      refreshToken: signRefreshToken(payload),
    });
  } catch (error) {
    next(error);
  }
});

authRouter.post('/demo-login', async (req, res, next) => {
  try {
    const { role } = req.body as { role?: string };
    const roleEmailMap: Record<string, string> = {
      citizen: 'citizen@smartcity.gov.in',
      officer: 'officer@smartcity.gov.in',
      'dept-head': 'depthead@smartcity.gov.in',
      admin: 'admin@smartcity.gov.in',
    };

    const targetEmail = roleEmailMap[role?.toLowerCase() || 'citizen'] || 'citizen@smartcity.gov.in';
    let user = await UserModel.findOne({ email: targetEmail });

    if (!user) {
      // Fallback create demo user if not found
      const roleName = role === 'admin' ? 'Admin' : role === 'dept-head' ? 'Department Head' : role === 'officer' ? 'Government Officer' : 'Citizen';
      const passwordHash = await bcrypt.hash('Password@123', 12);
      user = await UserModel.create({
        name: roleName === 'Citizen' ? 'Aarav Sharma' : roleName === 'Government Officer' ? 'D. Kulkarni' : roleName === 'Department Head' ? 'Rajesh Verma' : 'System Admin',
        email: targetEmail,
        role: roleName,
        passwordHash,
      });
    }

    const payload = { userId: user._id.toString(), role: user.role };
    return res.json({
      message: 'Demo login successful',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      accessToken: signAccessToken(payload),
      refreshToken: signRefreshToken(payload),
    });
  } catch (error) {
    next(error);
  }
});

authRouter.get('/me', async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'No authentication token provided' });
    }

    const token = authHeader.substring(7);
    const { verifyJwt } = await import('../utils/jwt.js');
    const { env } = await import('../config/env.js');
    const decoded = verifyJwt(token, env.JWT_ACCESS_SECRET);

    const user = await UserModel.findById(decoded.userId).lean();
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        language: user.language,
      },
    });
  } catch {
    return res.status(401).json({ message: 'Invalid or expired session' });
  }
});
