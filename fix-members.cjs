const fs = require('fs');

let content = fs.readFileSync('src/pages/Members.tsx', 'utf8');

// Update row hover class
content = content.replace(
  /className="hover:bg-teal-50\/40 transition-colors cursor-pointer group"/g,
  'className="hover:bg-teal-50 dark:hover:bg-dark-hover transition-colors cursor-pointer group dark:hover:text-white"'
);

// We need to fix the row text color explicitly to use group-hover
content = content.replace(
  /text-gray-900 dark:text-dark-text-primary font-bold/g, 
  'text-gray-900 dark:text-dark-text-primary dark:group-hover:text-white font-bold'
);

content = content.replace(
  /text-gray-500 dark:text-dark-text-secondary mt-0\.5/g,
  'text-gray-500 dark:text-dark-text-secondary dark:group-hover:text-gray-300 mt-0.5'
);

// Room badge in dark mode
content = content.replace(
  /bg-gray-100 dark:bg-dark-raised text-gray-700 dark:text-dark-text-secondary/g,
  'bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-slate-300'
);

// Update status badges to match the prompt's request
// Paid
content = content.replace(
  /bg-green-100 text-green-800/g,
  'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 border border-transparent dark:border-green-800/50'
);
// Due
content = content.replace(
  /bg-red-100 text-red-800/g,
  'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400 border border-transparent dark:border-red-800/50'
);
// Pending
content = content.replace(
  /bg-yellow-100 text-yellow-800/g,
  'bg-yellow-100 dark:bg-amber-900/30 text-yellow-800 dark:text-amber-400 border border-transparent dark:border-amber-800/50'
);
// Active
content = content.replace(
  /bg-emerald-100 text-emerald-800/g,
  'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-400 border border-transparent dark:border-emerald-800/50'
);
// Deactivated
content = content.replace(
  /bg-gray-200 text-gray-700/g,
  'bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-400 border border-transparent dark:border-gray-700'
);

// Action Buttons
content = content.replace(
  /bg-\[#D5E2DF\] hover:bg-\[#173F3A\]/g,
  'bg-[#D5E2DF] dark:bg-dark-raised hover:bg-[#173F3A] dark:hover:bg-dark-canvas dark:border dark:border-dark-border dark:hover:border-dark-border-strong'
);
content = content.replace(
  /bg-\[#F5F8F7\] dark:bg-dark-canvas hover:bg-\[#D5E2DF\]/g,
  'bg-[#F5F8F7] dark:bg-transparent hover:bg-[#D5E2DF] dark:hover:bg-dark-raised dark:border dark:border-dark-border'
);

fs.writeFileSync('src/pages/Members.tsx', content, 'utf8');
