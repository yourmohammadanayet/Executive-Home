const fs = require('fs');
const path = require('path');

function walkSync(dir, filelist = []) {
  const files = fs.readdirSync(dir);
  files.forEach(file => {
    const filepath = path.join(dir, file);
    if (fs.statSync(filepath).isDirectory()) {
      filelist = walkSync(filepath, filelist);
    } else if (file.endsWith('.tsx') || file.endsWith('.html')) {
      filelist.push(filepath);
    }
  });
  return filelist;
}

const files = walkSync('./src');
files.push('./index.html');

const replacements = [
  { regex: /dark:bg-gray-900/g, replacement: 'dark:bg-dark-canvas' },
  { regex: /dark:bg-gray-800/g, replacement: 'dark:bg-dark-surface' },
  { regex: /dark:bg-gray-700/g, replacement: 'dark:bg-dark-raised' },
  { regex: /dark:bg-gray-600/g, replacement: 'dark:bg-dark-hover' },
  
  { regex: /dark:hover:bg-gray-800/g, replacement: 'dark:hover:bg-dark-hover' },
  { regex: /dark:hover:bg-gray-700/g, replacement: 'dark:hover:bg-dark-hover' },
  { regex: /dark:hover:bg-gray-600/g, replacement: 'dark:hover:bg-dark-hover' },
  
  { regex: /dark:border-gray-800/g, replacement: 'dark:border-dark-divider' },
  { regex: /dark:border-gray-700/g, replacement: 'dark:border-dark-border' },
  { regex: /dark:border-gray-600/g, replacement: 'dark:border-dark-border-strong' },
  
  { regex: /dark:divide-gray-800/g, replacement: 'dark:divide-dark-divider' },
  { regex: /dark:divide-gray-700/g, replacement: 'dark:divide-dark-border' },
  
  { regex: /dark:text-gray-100/g, replacement: 'dark:text-dark-text-primary' },
  { regex: /dark:text-gray-200/g, replacement: 'dark:text-dark-text-primary' },
  { regex: /dark:text-gray-300/g, replacement: 'dark:text-dark-text-secondary' },
  { regex: /dark:text-gray-400/g, replacement: 'dark:text-dark-text-secondary' },
  { regex: /dark:text-gray-500/g, replacement: 'dark:text-dark-text-muted' },
  
  { regex: /dark:hover:text-gray-100/g, replacement: 'dark:hover:text-dark-text-primary' },
  { regex: /dark:hover:text-gray-200/g, replacement: 'dark:hover:text-dark-text-primary' },
  { regex: /dark:hover:text-gray-300/g, replacement: 'dark:hover:text-dark-text-secondary' },
  { regex: /dark:hover:text-gray-400/g, replacement: 'dark:hover:text-dark-text-secondary' },
  
  { regex: /dark:text-emerald-400/g, replacement: 'dark:text-dark-teal' },
  { regex: /dark:text-emerald-500/g, replacement: 'dark:text-dark-teal' },
  { regex: /dark:hover:text-emerald-400/g, replacement: 'dark:hover:text-dark-teal' },
  
  { regex: /dark:text-red-400/g, replacement: 'dark:text-dark-red' },
  { regex: /dark:text-red-500/g, replacement: 'dark:text-dark-red' },
  
  { regex: /dark:focus:ring-emerald-500/g, replacement: 'dark:focus:ring-dark-teal' },
  { regex: /dark:focus:ring-emerald-400/g, replacement: 'dark:focus:ring-dark-teal' },
  { regex: /dark:ring-gray-700/g, replacement: 'dark:ring-dark-border' },
  { regex: /dark:ring-gray-600/g, replacement: 'dark:ring-dark-border-strong' },
  
  // Specific badges / opacities
  { regex: /dark:bg-emerald-900\/20/g, replacement: 'dark:bg-dark-teal/10' },
  { regex: /dark:bg-emerald-900\/30/g, replacement: 'dark:bg-dark-teal/20' },
  { regex: /dark:bg-teal-900\/20/g, replacement: 'dark:bg-dark-teal/10' },
  { regex: /dark:bg-red-900\/20/g, replacement: 'dark:bg-dark-red/10' },
  { regex: /dark:bg-red-900\/30/g, replacement: 'dark:bg-dark-red/20' },
];

let changedFiles = 0;
files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let original = content;

  replacements.forEach(r => {
    content = content.replace(r.regex, r.replacement);
  });

  if (content !== original) {
    fs.writeFileSync(file, content, 'utf8');
    changedFiles++;
  }
});

console.log(`Applied advanced dark theme colors to ${changedFiles} files.`);
