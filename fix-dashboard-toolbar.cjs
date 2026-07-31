const fs = require('fs');

let content = fs.readFileSync('src/pages/Dashboard.tsx', 'utf8');

content = content.replace(
  /<header className="shrink-0 flex flex-col sm:flex-row sm:items-center justify-end px-4 sm:px-8 py-3 bg-white dark:bg-dark-surface border-b border-\[#E1E8E6\] dark:border-dark-border gap-4">/g,
  '<div className="shrink-0 flex flex-col sm:flex-row sm:items-center justify-end px-4 sm:px-8 py-4 bg-transparent border-b border-[#E1E8E6] dark:border-dark-border gap-4">'
);

fs.writeFileSync('src/pages/Dashboard.tsx', content, 'utf8');
