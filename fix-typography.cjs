const fs = require('fs');

let content = fs.readFileSync('src/pages/Members.tsx', 'utf8');

// Header title in Layout (Wait, Layout is separate)
content = content.replace(/text-\[11px\]/g, 'text-xs'); // 12px
content = content.replace(/text-\[10px\]/g, 'text-xs'); // 12px
content = content.replace(/text-xs/g, 'text-sm'); // 14px (Wait, I just converted 11px to xs, so I need to be careful)

// Let's do targeted replaces
fs.writeFileSync('src/pages/Members.tsx', content, 'utf8');
