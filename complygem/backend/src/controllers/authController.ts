import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import User from "../models/User";
import { signToken } from "../utils/jwt";
import { logAudit } from "../services/auditLogger";

export async function login(req: Request, res: Response) {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ message: "Email and password are required." });

  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user || !user.isActive) {
    return res.status(401).json({ message: "Invalid credentials." });
  }
  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    return res.status(401).json({ message: "Invalid credentials." });
  }

  const token = signToken({
    userId: String(user._id),
    name: user.name,
    email: user.email,
    role: user.role,
    department: user.department,
  });

  await logAudit(
    { userId: String(user._id), name: user.name, email: user.email, role: user.role, department: user.department },
    "LOGIN",
    "User",
    String(user._id)
  );

  res.json({
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department,
    },
  });
}

export async function me(req: Request, res: Response) {
  const user = await User.findById(req.user!.userId).select("-passwordHash");
  res.json(user);
}

export async function forgotPassword(req: Request, res: Response) {
  // Demo stub — in production this dispatches a reset email via Nodemailer/SMTP.
  res.json({ message: "If this official email exists in our system, a reset link has been sent." });
}
