import jwt from "jsonwebtoken";

export interface TokenPayload {
  userId: string;
  name: string;
  email: string;
  role: "ADMIN" | "PROCUREMENT_OFFICER" | "REVIEWER";
  department: string;
}

export function signToken(payload: TokenPayload): string {
  const secret = process.env.JWT_SECRET || "dev_secret";
  const expiresIn = process.env.JWT_EXPIRES_IN || "8h";
  return jwt.sign(payload, secret, { expiresIn } as jwt.SignOptions);
}

export function verifyToken(token: string): TokenPayload {
  const secret = process.env.JWT_SECRET || "dev_secret";
  return jwt.verify(token, secret) as TokenPayload;
}
