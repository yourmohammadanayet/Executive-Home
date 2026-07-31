import { isSupabaseConfigured } from '../lib/supabase';
import { Database, AlertCircle } from 'lucide-react';

export default function SetupRequired() {
  return (
    <div className="min-h-screen bg-[#F5F8F7] dark:bg-dark-canvas flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-white dark:bg-dark-surface rounded-xl shadow-sm border border-[#D5E2DF] dark:border-dark-border p-8 text-center">
        <div className="mx-auto w-16 h-16 bg-[#23796F]/10 rounded-full flex items-center justify-center mb-6">
          <Database className="w-8 h-8 text-[#23796F] dark:text-dark-teal" />
        </div>
        
        <h1 className="text-2xl font-bold text-[#173F3A] dark:text-dark-text-primary mb-4">
          Supabase Connection Required
        </h1>
        
        <p className="text-gray-600 dark:text-dark-text-secondary mb-6">
          The Executive Home Management System requires a Supabase database to function.
        </p>
        
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-left mb-6">
          <div className="flex items-start">
            <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
            <div>
              <h3 className="font-medium text-blue-900">How to configure:</h3>
              <ol className="mt-2 text-sm text-blue-800 list-decimal list-inside space-y-1">
                <li>Create a Supabase project</li>
                <li>Run the SQL commands from <code>supabase-schema.sql</code> in the SQL editor</li>
                <li>Add your credentials to the Settings panel:
                  <ul className="list-disc list-inside ml-4 mt-1">
                    <li><code>VITE_SUPABASE_URL</code></li>
                    <li><code>VITE_SUPABASE_ANON_KEY</code></li>
                  </ul>
                </li>
              </ol>
            </div>
          </div>
        </div>
        
        <p className="text-sm text-gray-500 dark:text-dark-text-secondary">
          The application will automatically reload once the environment variables are configured.
        </p>
      </div>
    </div>
  );
}
