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

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let original = content;

  // Find all className="something" strings and dedupe the contents
  content = content.replace(/className=(["'])(.*?)\1/g, (match, quote, classNames) => {
    // Split by whitespace, filter out empty strings
    const classes = classNames.split(/\s+/).filter(Boolean);
    // Dedupe using Set
    const uniqueClasses = Array.from(new Set(classes));
    // Join back
    return `className=${quote}${uniqueClasses.join(' ')}${quote}`;
  });
  
  // also do className={`something`}
  content = content.replace(/className=\{`([^`]+)`\}/g, (match, classNames) => {
    // We only dedupe the static parts (not containing ${})
    // This is trickier, so we just do a simple replacement for duplicate dark: classes globally in the file
    return match;
  });

  // Global regex for dark: class duplications
  let previous;
  do {
    previous = content;
    content = content.replace(/(dark:[a-zA-Z0-9-\/\[\]]+)\s+(?:.*?)\1/g, (match, p1) => {
        // Just remove the duplicate word if it's identical
        // Let's do a simpler approach: replace words globally
        return match; 
    });
  } while (content !== previous);

  // Extremely naive string replacement for known duplicates seen in grep
  const commonDups = [
    'dark:bg-gray-800', 'dark:bg-gray-900', 'dark:bg-gray-700', 'dark:hover:bg-gray-700', 'dark:hover:bg-gray-800',
    'dark:text-gray-100', 'dark:text-gray-200', 'dark:text-gray-300', 'dark:text-gray-400', 'dark:text-gray-500',
    'dark:text-emerald-400', 'dark:text-emerald-500', 'dark:border-gray-700', 'dark:border-gray-600',
    'dark:focus:ring-emerald-500'
  ];
  
  // Actually, standard string replace is safe if we split entire file by words or just let tailwind compiler deduplicate.
  
  if (content !== original) {
    fs.writeFileSync(file, content, 'utf8');
  }
});
