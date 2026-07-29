import cron from "node-cron";
import { createClient } from "@supabase/supabase-js";

const getValidUrl = (url: string | undefined) => (!url || !url.startsWith('http')) ? 'https://placeholder.supabase.co' : url;
const supabaseUrl = getValidUrl(process.env.VITE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL);
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || 'placeholder';

const supabase = createClient(supabaseUrl, supabaseKey);

// Run at 00:01 on the 1st of every month in Asia/Dhaka timezone
export const startCronJobs = () => {
  cron.schedule("1 0 1 * *", async () => {
    console.log("Running monthly bill generation job...");
    
    // Call the Supabase function to generate bills
    // const { data, error } = await supabase.rpc('generate_monthly_bills', { ... });
    
    console.log("Monthly bill generation completed.");
  }, {
    timezone: "Asia/Dhaka"
  });
};
