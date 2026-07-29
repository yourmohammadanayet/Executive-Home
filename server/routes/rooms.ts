import { Router } from "express";
import { createClient } from "@supabase/supabase-js";
import { requireAdmin, requireAuth, formatSuccess, formatError } from "../utils";

const router = Router();
const getValidUrl = (url: string | undefined) => (!url || !url.startsWith('http')) ? 'https://placeholder.supabase.co' : url;
const supabase = createClient(getValidUrl(process.env.VITE_SUPABASE_URL), process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || 'placeholder');

router.get("/", requireAdmin, async (req, res) => {
  const { data, error } = await supabase.from('rooms').select('*').is('archived_at', null);
  if (error) return res.status(500).json(formatError("INTERNAL_SERVER_ERROR", error.message, null, req));
  res.json(formatSuccess(data, req));
});

export default router;
