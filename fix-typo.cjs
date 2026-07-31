const fs = require('fs');

let content = fs.readFileSync('src/pages/Members.tsx', 'utf8');

// Table header typography
content = content.replace(/text-\[11px\] uppercase/g, 'text-xs font-semibold uppercase tracking-wider');

// Member code
content = content.replace(/text-\[#23796F\] dark:text-dark-teal dark:group-hover:text-dark-teal/g, 'text-[#23796F] dark:text-dark-teal dark:group-hover:text-dark-teal text-sm');

// Member name
content = content.replace(/text-gray-900 dark:text-dark-text-primary dark:group-hover:text-white font-bold/g, 'text-gray-900 dark:text-dark-text-primary dark:group-hover:text-white font-bold text-sm');

// Secondary text
content = content.replace(/text-gray-500 dark:text-dark-text-secondary dark:group-hover:text-gray-300 mt-0.5/g, 'text-gray-500 dark:text-dark-text-secondary dark:group-hover:text-gray-300 mt-0.5 text-xs');

// Badges
content = content.replace(/text-\[10px\]/g, 'text-xs');
content = content.replace(/text-\[11px\]/g, 'text-xs');

fs.writeFileSync('src/pages/Members.tsx', content, 'utf8');
