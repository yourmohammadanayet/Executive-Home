const fs = require('fs');
const path = require('path');

function walkSync(dir, filelist = []) {
  const files = fs.readdirSync(dir);
  files.forEach(file => {
    const filepath = path.join(dir, file);
    if (fs.statSync(filepath).isDirectory()) {
      filelist = walkSync(filepath, filelist);
    } else if (file.endsWith('.tsx')) {
      filelist.push(filepath);
    }
  });
  return filelist;
}

const files = walkSync('./src');

const replacements = [
  // Backgrounds
  { regex: /(?<!dark:)bg-white/g, replacement: 'bg-white dark:bg-gray-800' },
  { regex: /(?<!dark:)bg-\[#F5F8F7\]/g, replacement: 'bg-[#F5F8F7] dark:bg-gray-900' },
  { regex: /(?<!dark:)bg-gray-50(?![\/\w])/g, replacement: 'bg-gray-50 dark:bg-gray-800/50' },
  { regex: /(?<!dark:)bg-gray-100(?![\/\w])/g, replacement: 'bg-gray-100 dark:bg-gray-700' },
  { regex: /(?<!dark:)hover:bg-gray-50(?![\/\w])/g, replacement: 'hover:bg-gray-50 dark:hover:bg-gray-700/50' },
  { regex: /(?<!dark:)hover:bg-gray-100(?![\/\w])/g, replacement: 'hover:bg-gray-100 dark:hover:bg-gray-700' },
  { regex: /(?<!dark:)hover:bg-gray-200(?![\/\w])/g, replacement: 'hover:bg-gray-200 dark:hover:bg-gray-600' },
  
  // Text Colors
  { regex: /(?<!dark:)text-\[#173F3A\]/g, replacement: 'text-[#173F3A] dark:text-gray-100' },
  { regex: /(?<!dark:)text-\[#23796F\]/g, replacement: 'text-[#23796F] dark:text-emerald-400' },
  { regex: /(?<!dark:)text-gray-900/g, replacement: 'text-gray-900 dark:text-gray-100' },
  { regex: /(?<!dark:)text-gray-800/g, replacement: 'text-gray-800 dark:text-gray-200' },
  { regex: /(?<!dark:)text-gray-700/g, replacement: 'text-gray-700 dark:text-gray-300' },
  { regex: /(?<!dark:)text-gray-600/g, replacement: 'text-gray-600 dark:text-gray-400' },
  { regex: /(?<!dark:)text-gray-500/g, replacement: 'text-gray-500 dark:text-gray-400' },
  { regex: /(?<!dark:)text-gray-400/g, replacement: 'text-gray-400 dark:text-gray-500' },

  // Borders
  { regex: /(?<!dark:)border-gray-200/g, replacement: 'border-gray-200 dark:border-gray-700' },
  { regex: /(?<!dark:)border-gray-100/g, replacement: 'border-gray-100 dark:border-gray-700' },
  { regex: /(?<!dark:)border-gray-300/g, replacement: 'border-gray-300 dark:border-gray-600' },
  { regex: /(?<!dark:)border-\[#D5E2DF\]/g, replacement: 'border-[#D5E2DF] dark:border-gray-700' },
  
  // Specific tweaks
  { regex: /(?<!dark:)divide-gray-100/g, replacement: 'divide-gray-100 dark:divide-gray-800' },
  { regex: /(?<!dark:)divide-gray-200/g, replacement: 'divide-gray-200 dark:divide-gray-700' },
];

let changedFiles = 0;

files.forEach(file => {
  // skip layout and splash since we manually updated them already
  if (file.includes('Layout.tsx') || file.includes('SplashScreen.tsx')) return;
  
  let content = fs.readFileSync(file, 'utf8');
  let original = content;

  replacements.forEach(r => {
    content = content.replace(r.regex, r.replacement);
  });

  // Deduplicate accidental doubles if script is run multiple times
  content = content.replace(/(dark:[\w-\/]+)\s+\1/g, '$1');

  if (content !== original) {
    fs.writeFileSync(file, content, 'utf8');
    changedFiles++;
  }
});

console.log(`Updated ${changedFiles} files with dark mode classes.`);
