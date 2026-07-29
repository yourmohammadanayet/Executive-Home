import { Request, Response, NextFunction } from "express";
import { createClient } from "@supabase/supabase-js";

export const formatSuccess = (data: any, req: Request) => ({
  success: true,
  data,
  meta: { requestId: req.headers['x-request-id'] || crypto.randomUUID() }
});

export const formatError = (code: string, message: string, fields?: any, req?: Request) => ({
  success: false,
  error: { code, message, fields },
  meta: { requestId: req?.headers['x-request-id'] || crypto.randomUUID() }
});

const getValidUrl = (url: string | undefined) => {
  if (!url || !url.startsWith('http')) return 'https://placeholder.supabase.co';
  return url;
};

const supabase = createClient(getValidUrl(process.env.VITE_SUPABASE_URL), process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || 'placeholder-key');

export const requireAuth = async (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    return res.status(401).json(formatError("UNAUTHORIZED", "No token provided", null, req));
  }
  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user) {
    return res.status(401).json(formatError("UNAUTHORIZED", "Invalid token", null, req));
  }
  (req as any).user = user;
  next();
};

export const requireAdmin = async (req: Request, res: Response, next: NextFunction) => {
  await requireAuth(req, res, async () => {
    const user = (req as any).user;
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
    if (profile?.role !== 'admin') {
      return res.status(403).json(formatError("FORBIDDEN", "Admin access required", null, req));
    }
    next();
  });
};
