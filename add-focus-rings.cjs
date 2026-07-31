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

let changedFiles = 0;
files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let original = content;

  // Add focus ring to buttons and links if they don't have it
  // This is a naive regex but it usually helps catch most things.
  // We look for classNames containing 'cursor-pointer' or 'hover:' that don't have 'focus:'
  
  // Actually, we'll just specifically target common buttons.
  content = content.replace(/className="([^"]*(?:hover:bg-|cursor-pointer)[^"]*)"/g, (match, classes) => {
    if (!classes.includes('focus-visible:ring')) {
      return `className="${classes} outline-none focus-visible:ring-2 focus-visible:ring-[#23796F] dark:focus-visible:ring-dark-teal focus-visible:ring-offset-1 dark:focus-visible:ring-offset-dark-canvas"`;
    }
    return match;
  });

  if (content !== original) {
    fs.writeFileSync(file, content, 'utf8');
    changedFiles++;
  }
});

console.log(`Added focus rings to ${changedFiles} files.`);
