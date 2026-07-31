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
  { regex: /(?<!dark:)bg-\[#F7F9F8\]/g, replacement: 'bg-[#F7F9F8] dark:bg-gray-800' },
  { regex: /(?<!dark:)bg-gray-50(?![\/\w])/g, replacement: 'bg-gray-50 dark:bg-gray-900/50' },
  { regex: /(?<!dark:)bg-gray-100(?![\/\w])/g, replacement: 'bg-gray-100 dark:bg-gray-700' },
  { regex: /(?<!dark:)bg-emerald-50(?![\/\w])/g, replacement: 'bg-emerald-50 dark:bg-emerald-900/20' },
  { regex: /(?<!dark:)bg-teal-50(?![\/\w])/g, replacement: 'bg-teal-50 dark:bg-teal-900/20' },
  { regex: /(?<!dark:)bg-red-50(?![\/\w])/g, replacement: 'bg-red-50 dark:bg-red-900/20' },
  
  // Hovers
  { regex: /(?<!dark:)hover:bg-gray-50(?![\/\w])/g, replacement: 'hover:bg-gray-50 dark:hover:bg-gray-700' },
  { regex: /(?<!dark:)hover:bg-gray-100(?![\/\w])/g, replacement: 'hover:bg-gray-100 dark:hover:bg-gray-700' },
  { regex: /(?<!dark:)hover:bg-gray-200(?![\/\w])/g, replacement: 'hover:bg-gray-200 dark:hover:bg-gray-600' },
  { regex: /(?<!dark:)hover:bg-\[#F5F8F7\]/g, replacement: 'hover:bg-[#F5F8F7] dark:hover:bg-gray-700' },
  { regex: /(?<!dark:)hover:bg-\[#F7F9F8\]/g, replacement: 'hover:bg-[#F7F9F8] dark:hover:bg-gray-700' },
  { regex: /(?<!dark:)hover:bg-red-50(?![\/\w])/g, replacement: 'hover:bg-red-50 dark:hover:bg-red-900/30' },
  { regex: /(?<!dark:)hover:bg-emerald-50(?![\/\w])/g, replacement: 'hover:bg-emerald-50 dark:hover:bg-emerald-900/30' },
  
  // Text Colors
  { regex: /(?<!dark:)text-\[#173F3A\]/g, replacement: 'text-[#173F3A] dark:text-gray-100' },
  { regex: /(?<!dark:)text-\[#23796F\]/g, replacement: 'text-[#23796F] dark:text-emerald-400' },
  { regex: /(?<!dark:)text-gray-900(?![\/\w])/g, replacement: 'text-gray-900 dark:text-gray-100' },
  { regex: /(?<!dark:)text-gray-800(?![\/\w])/g, replacement: 'text-gray-800 dark:text-gray-200' },
  { regex: /(?<!dark:)text-gray-700(?![\/\w])/g, replacement: 'text-gray-700 dark:text-gray-300' },
  { regex: /(?<!dark:)text-gray-600(?![\/\w])/g, replacement: 'text-gray-600 dark:text-gray-400' },
  { regex: /(?<!dark:)text-gray-500(?![\/\w])/g, replacement: 'text-gray-500 dark:text-gray-400' },
  { regex: /(?<!dark:)text-gray-400(?![\/\w])/g, replacement: 'text-gray-400 dark:text-gray-500' },
  { regex: /(?<!dark:)text-red-600(?![\/\w])/g, replacement: 'text-red-600 dark:text-red-400' },
  
  // Hover Text
  { regex: /(?<!dark:)hover:text-\[#173F3A\]/g, replacement: 'hover:text-[#173F3A] dark:hover:text-gray-100' },
  { regex: /(?<!dark:)hover:text-\[#23796F\]/g, replacement: 'hover:text-[#23796F] dark:hover:text-emerald-400' },
  { regex: /(?<!dark:)hover:text-gray-900(?![\/\w])/g, replacement: 'hover:text-gray-900 dark:hover:text-gray-100' },
  { regex: /(?<!dark:)hover:text-gray-700(?![\/\w])/g, replacement: 'hover:text-gray-700 dark:hover:text-gray-300' },
  { regex: /(?<!dark:)hover:text-gray-600(?![\/\w])/g, replacement: 'hover:text-gray-600 dark:hover:text-gray-300' },

  // Borders
  { regex: /(?<!dark:)border-gray-200(?![\/\w])/g, replacement: 'border-gray-200 dark:border-gray-700' },
  { regex: /(?<!dark:)border-gray-100(?![\/\w])/g, replacement: 'border-gray-100 dark:border-gray-700' },
  { regex: /(?<!dark:)border-gray-300(?![\/\w])/g, replacement: 'border-gray-300 dark:border-gray-600' },
  { regex: /(?<!dark:)border-\[#D5E2DF\]/g, replacement: 'border-[#D5E2DF] dark:border-gray-700' },
  { regex: /(?<!dark:)border-\[#E1E8E6\]/g, replacement: 'border-[#E1E8E6] dark:border-gray-700' },
  { regex: /(?<!dark:)border-\[#23796F\]/g, replacement: 'border-[#23796F] dark:border-emerald-500' },
  { regex: /(?<!dark:)border-red-100(?![\/\w])/g, replacement: 'border-red-100 dark:border-red-900/30' },
  { regex: /(?<!dark:)border-red-200(?![\/\w])/g, replacement: 'border-red-200 dark:border-red-800' },
  
  // Specific tweaks
  { regex: /(?<!dark:)divide-gray-100(?![\/\w])/g, replacement: 'divide-gray-100 dark:divide-gray-800' },
  { regex: /(?<!dark:)divide-gray-200(?![\/\w])/g, replacement: 'divide-gray-200 dark:divide-gray-700' },
  { regex: /(?<!dark:)divide-\[#E1E8E6\]/g, replacement: 'divide-[#E1E8E6] dark:divide-gray-700' },
  { regex: /(?<!dark:)divide-\[#D5E2DF\]/g, replacement: 'divide-[#D5E2DF] dark:divide-gray-700' },
  
  // Ring / Focus
  { regex: /(?<!dark:)ring-gray-300(?![\/\w])/g, replacement: 'ring-gray-300 dark:ring-gray-600' },
  { regex: /(?<!dark:)focus:ring-\[#23796F\]/g, replacement: 'focus:ring-[#23796F] dark:focus:ring-emerald-500' },
  { regex: /(?<!dark:)ring-\[#D5E2DF\]/g, replacement: 'ring-[#D5E2DF] dark:ring-gray-700' },
];

let changedFiles = 0;

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let original = content;

  replacements.forEach(r => {
    content = content.replace(r.regex, r.replacement);
  });

  // Deduplicate accidental doubles 
  content = content.replace(/(dark:[a-zA-Z0-9-\/\[\]]+)\s+\1/g, '$1');
  
  // Fix nested dark mode classes that might have been duplicated (e.g. dark:bg-gray-800 dark:bg-gray-800)
  content = content.replace(/dark:bg-gray-800 dark:bg-gray-800/g, 'dark:bg-gray-800');
  content = content.replace(/dark:bg-gray-900 dark:bg-gray-900/g, 'dark:bg-gray-900');
  content = content.replace(/dark:text-gray-100 dark:text-gray-100/g, 'dark:text-gray-100');
  content = content.replace(/dark:text-emerald-400 dark:text-emerald-400/g, 'dark:text-emerald-400');
  content = content.replace(/dark:border-gray-700 dark:border-gray-700/g, 'dark:border-gray-700');

  if (content !== original) {
    fs.writeFileSync(file, content, 'utf8');
    changedFiles++;
  }
});

console.log(`Updated ${changedFiles} files with comprehensive dark mode classes.`);
