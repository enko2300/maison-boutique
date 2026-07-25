import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'boutique-secret';

export interface AuthPayload {
  userId: string;
  role: string;
}

export function signToken(payload: AuthPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token: string): AuthPayload {
  return jwt.verify(token, JWT_SECRET) as AuthPayload;
}
