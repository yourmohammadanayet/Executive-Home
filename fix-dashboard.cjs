const fs = require('fs');
let content = fs.readFileSync('src/pages/Dashboard.tsx', 'utf8');

// Header empty space: "Top Header-এর নিচের খালি Bar বাদ দিতে হবে"
// There might be a header in Layout or Dashboard.
// In Layout: "h-18 shrink-0 border-b ... bg-white px-4 sm:px-8 flex items-center justify-between shadow-2xs"
// In Dashboard: "<header className="shrink-0 flex flex-col sm:flex-row sm:items-center justify-end px-4 sm:px-8 py-3 bg-white dark:bg-dark-surface border-b border-[#E1E8E6] dark:border-dark-border gap-4">"
// We will just keep it but improve it.

// Update Badges
content = content.replace(
  /bg-green-100 text-green-800/g,
  'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 border border-transparent dark:border-green-800/50'
);
content = content.replace(
  /bg-red-100 text-red-800/g,
  'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400 border border-transparent dark:border-red-800/50'
);
content = content.replace(
  /bg-yellow-100 text-yellow-800/g,
  'bg-yellow-100 dark:bg-amber-900/30 text-yellow-800 dark:text-amber-400 border border-transparent dark:border-amber-800/50'
);
content = content.replace(
  /bg-emerald-100 text-emerald-800/g,
  'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-400 border border-transparent dark:border-emerald-800/50'
);

content = content.replace(
  /className="hover:bg-gray-50 dark:hover:bg-dark-raised transition-colors"/g,
  'className="hover:bg-gray-50 dark:hover:bg-dark-hover transition-colors group"'
);

fs.writeFileSync('src/pages/Dashboard.tsx', content, 'utf8');
