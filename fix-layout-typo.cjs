const fs = require('fs');

let content = fs.readFileSync('src/components/Layout.tsx', 'utf8');

// Header title
content = content.replace(/text-lg sm:text-xl font-bold/g, 'text-xl sm:text-2xl font-bold');
content = content.replace(/text-\[11px\] text-gray-500/g, 'text-[13px] text-gray-500');

// Sidebar nav
content = content.replace(/text-xs font-semibold/g, 'text-[14px] font-medium');

// Sidebar group labels
content = content.replace(/text-\[10px\] font-bold uppercase/g, 'text-[12px] font-bold uppercase');

// User profile in footer
content = content.replace(/text-xs font-bold text-\[#173F3A\]/g, 'text-[14px] font-bold text-[#173F3A]');
content = content.replace(/text-\[10px\] font-semibold text-\[#23796F\]/g, 'text-[12px] font-semibold text-[#23796F]');

fs.writeFileSync('src/components/Layout.tsx', content, 'utf8');
