import { Request, Response, NextFunction } from "express";

interface AttemptEntry {
  count: number;
  firstAttemptAt: number;
  blockedUntil?: number;
}

const WINDOW_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = 5;
const BLOCK_MS = 30 * 60 * 1000;

const attempts = new Map<string, AttemptEntry>();

const getClientKey = (req: Request) => {
  const forwardedFor = req.headers["x-forwarded-for"];
  const forwardedIp = Array.isArray(forwardedFor)
    ? forwardedFor[0]
    : forwardedFor?.split(",")[0];

  return (forwardedIp || req.ip || "unknown").trim();
};

const clearExpiredAttempts = (entry: AttemptEntry, now: number) => {
  if (entry.blockedUntil && entry.blockedUntil <= now) {
    entry.count = 0;
    entry.firstAttemptAt = now;
    delete entry.blockedUntil;
  }

  if (now - entry.firstAttemptAt > WINDOW_MS) {
    entry.count = 0;
    entry.firstAttemptAt = now;
  }
};

export const loginRateLimiter = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const now = Date.now();
  const key = getClientKey(req);
  const entry = attempts.get(key) ?? { count: 0, firstAttemptAt: now };

  clearExpiredAttempts(entry, now);

  if (entry.blockedUntil && entry.blockedUntil > now) {
    const retryAfterSeconds = Math.ceil((entry.blockedUntil - now) / 1000);
    res.setHeader("Retry-After", retryAfterSeconds.toString());
    attempts.set(key, entry);

    return res.status(429).json({
      error:
        "Muitas tentativas de login falharam. Aguarde antes de tentar novamente.",
    });
  }

  res.locals.loginRateLimitKey = key;
  attempts.set(key, entry);
  next();
};

export const registerFailedLoginAttempt = (key?: string) => {
  if (!key) return;

  const now = Date.now();
  const entry = attempts.get(key) ?? { count: 0, firstAttemptAt: now };
  clearExpiredAttempts(entry, now);

  entry.count += 1;
  if (entry.count >= MAX_ATTEMPTS) {
    entry.blockedUntil = now + BLOCK_MS;
  }

  attempts.set(key, entry);
};

export const clearFailedLoginAttempts = (key?: string) => {
  if (!key) return;
  attempts.delete(key);
};
