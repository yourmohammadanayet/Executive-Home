import { Router } from "express";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import { requireAuth, requireAdmin, formatSuccess, formatError } from "./utils";
import roomsRouter from "./routes/rooms";

const router = Router();
const getValidUrl = (url: string | undefined) => (!url || !url.startsWith('http')) ? 'https://placeholder.supabase.co' : url; const supabase = createClient(getValidUrl(process.env.VITE_SUPABASE_URL), process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || '');

router.use("/rooms", roomsRouter);

// Members APIs
router.get("/members", requireAdmin, async (req, res) => {
  const { data, error } = await supabase.from('members').select('*').is('archived_at', null);
  if (error) return res.status(500).json(formatError("INTERNAL_SERVER_ERROR", error.message, null, req));
  res.json(formatSuccess(data, req));
});

router.post("/members", requireAdmin, async (req, res) => {
  try {
    const body = z.object({
      full_name: z.string(),
      email: z.string().email(),
      room_id: z.string().uuid(),
      base_monthly_rent: z.number().min(0),
      move_in_date: z.string(),
      suggested_amount: z.number().min(0).default(1500)
    }).parse(req.body);

    const { data, error } = await supabase.rpc('create_member_with_joining_charge', {
      ...body,
      member_code: `EH-${Math.floor(Math.random() * 10000)}`
    });

    if (error) throw error;
    res.json(formatSuccess(data, req));
  } catch (e: any) {
    res.status(400).json(formatError("VALIDATION_ERROR", e.message, null, req));
  }
});

// Bills APIs
router.post("/bills/generate", requireAdmin, async (req, res) => {
  try {
    const body = z.object({
      billing_month: z.string()
    }).parse(req.body);

    const { data, error } = await supabase.rpc('generate_monthly_bills', {
      p_billing_month: body.billing_month,
      p_generated_by: (req as any).user.id
    });

    if (error) throw error;
    res.json(formatSuccess(data, req));
  } catch (e: any) {
    res.status(400).json(formatError("VALIDATION_ERROR", e.message, null, req));
  }
});

// Payments APIs
router.post("/payments", requireAdmin, async (req, res) => {
  try {
    const body = z.object({
      member_id: z.string().uuid(),
      amount: z.number().min(1),
      payment_date: z.string(),
      payment_method: z.enum(['cash', 'bkash', 'nagad', 'rocket', 'bank_transfer', 'other']),
      transaction_id: z.string().optional(),
      notes: z.string().optional(),
      allocations: z.array(z.object({
        type: z.enum(['monthly_rent', 'joining_charge']),
        target_id: z.string().uuid(),
        amount: z.number().min(1)
      }))
    }).parse(req.body);

    const { data, error } = await supabase.rpc('record_payment', {
      p_payload: body,
      p_created_by: (req as any).user.id
    });

    if (error) throw error;
    res.json(formatSuccess(data, req));
  } catch (e: any) {
    res.status(400).json(formatError("VALIDATION_ERROR", e.message, null, req));
  }
});

// Settings API
router.get("/settings", requireAuth, async (req, res) => {
  const { data, error } = await supabase.from('settings').select('*').single();
  if (error) return res.status(500).json(formatError("INTERNAL_SERVER_ERROR", error.message, null, req));
  res.json(formatSuccess(data, req));
});

export default router;
