const fs = require('fs');
let content = fs.readFileSync('src/components/Layout.tsx', 'utf8');

// Sidebar background
content = content.replace(
  /bg-white dark:bg-dark-canvas border-r border-\[#D5E2DF\] dark:border-dark-border transition-all/g,
  'bg-white dark:bg-dark-sidebar border-r border-[#D5E2DF] dark:border-dark-border transition-all'
);
// In case the above didn't match:
content = content.replace(
  /bg-white dark:bg-dark-canvas border-r/g,
  'bg-white dark:bg-dark-sidebar border-r'
);

// Focus rings for accessibility
content = content.replace(
  /focus:outline-none/g,
  'focus:outline-none focus-visible:ring-2 focus-visible:ring-[#23796F] dark:focus-visible:ring-dark-teal focus-visible:ring-offset-2 dark:focus-visible:ring-offset-dark-canvas'
);

fs.writeFileSync('src/components/Layout.tsx', content, 'utf8');
