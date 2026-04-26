import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import type { Request, Response } from "express";

const DASHBOARD_PASSWORD = process.env.DASHBOARD_PASSWORD || "keepit123";

export interface SessionUser {
  id: string;
  role: "admin" | "user";
}

export function setSessionCookie(
  res: Response,
  req: Request,
  user: SessionUser
) {
  const cookieOptions = getSessionCookieOptions(req);
  res.cookie(COOKIE_NAME, JSON.stringify(user), cookieOptions);
}

export function clearSessionCookie(res: Response, req: Request) {
  const cookieOptions = getSessionCookieOptions(req);
  res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
}

export function validatePassword(password: string): boolean {
  return password === DASHBOARD_PASSWORD;
}
