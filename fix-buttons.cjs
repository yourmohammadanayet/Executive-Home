const fs = require('fs');

// Members
let membersContent = fs.readFileSync('src/pages/Members.tsx', 'utf8');

// Details button
membersContent = membersContent.replace(
  /inline-flex items-center gap-1 text-\[#173F3A\] dark:text-dark-text-primary hover:text-white font-bold text-xs bg-\[#D5E2DF\] dark:bg-dark-raised hover:bg-\[#173F3A\] dark:hover:bg-dark-canvas dark:border dark:border-dark-border dark:hover:border-dark-border-strong px-2.5 py-1 rounded transition-colors/g,
  'inline-flex items-center gap-1.5 text-[#173F3A] dark:text-dark-text-primary hover:text-white dark:hover:text-white font-bold text-xs bg-[#D5E2DF] dark:bg-dark-raised hover:bg-[#173F3A] dark:hover:bg-dark-hover border border-transparent dark:border-dark-border dark:hover:border-dark-border-strong px-2.5 py-1.5 rounded-lg transition-colors shadow-sm'
);

// Edit button
membersContent = membersContent.replace(
  /inline-flex items-center gap-1 text-\[#23796F\] dark:text-dark-teal hover:text-\[#173F3A\] dark:hover:text-dark-text-primary dark:text-dark-text-primary font-bold text-xs bg-\[#F5F8F7\] dark:bg-transparent hover:bg-\[#D5E2DF\] dark:hover:bg-dark-raised dark:border dark:border-dark-border px-2.5 py-1 rounded transition-colors/g,
  'inline-flex items-center gap-1.5 text-gray-700 dark:text-dark-text-secondary hover:text-[#23796F] dark:hover:text-dark-teal font-bold text-xs bg-white dark:bg-transparent hover:bg-teal-50 dark:hover:bg-dark-teal/10 border border-gray-200 dark:border-dark-border px-2.5 py-1.5 rounded-lg transition-colors shadow-sm group-hover:border-teal-200 dark:group-hover:border-dark-teal/30'
);

fs.writeFileSync('src/pages/Members.tsx', membersContent, 'utf8');

