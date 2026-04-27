import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import { COOKIE_NAME } from "@shared/const";

export interface SessionUser {
  id: string;
  role: "admin" | "user";
}

export type TrpcContext = {
  req: CreateExpressContextOptions["req"];
  res: CreateExpressContextOptions["res"];
  user: SessionUser | null;
};

export async function createContext(
  opts: CreateExpressContextOptions
): Promise<TrpcContext> {
  let user: SessionUser | null = null;

  try {
    // Try to get user from session cookie
    const cookie = opts.req.cookies[COOKIE_NAME];
    if (cookie) {
      user = JSON.parse(cookie);
    }
  } catch (error) {
    // Session is optional for public procedures
    user = null;
  }

  return {
    req: opts.req,
    res: opts.res,
    user,
  };
}
