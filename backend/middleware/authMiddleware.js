import jwt from 'jsonwebtoken';
import { UserModel } from '../models/User.js';

export const protect = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Not authorized, token missing.' });
  }

  try {
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await UserModel.findById(decoded.id);
    if (!user) return res.status(401).json({ message: 'User not found.' });
    if (user.status === 'blocked') {
      return res.status(403).json({ message: 'Your account has been suspended by an administrator.' });
    }

    const { password, ...safeUser } = user;
    req.user = safeUser;
    next();
  } catch {
    return res.status(401).json({ message: 'Invalid or expired token.' });
  }
};

export const adminOnly = (req, res, next) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied. Admins only.' });
  }
  next();
};