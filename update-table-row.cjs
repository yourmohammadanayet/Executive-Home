const fs = require('fs');

let content = fs.readFileSync('src/pages/Members.tsx', 'utf8');

// The tr class is currently: 
// className="hover:bg-teal-50 dark:hover:bg-dark-hover transition-colors cursor-pointer group dark:hover:text-white"
// I will change it to:
// className="hover:bg-teal-50 dark:hover:bg-dark-hover transition-colors cursor-pointer group relative"
content = content.replace(
  /className="hover:bg-teal-50 dark:hover:bg-dark-hover transition-colors cursor-pointer group dark:hover:text-white"/g,
  'className="hover:bg-teal-50 dark:hover:bg-dark-hover transition-colors cursor-pointer group relative"'
);

// Member Code column:
// <td className="px-4 py-3 font-bold text-[#23796F] dark:text-dark-teal whitespace-nowrap">
content = content.replace(
  /<td className="px-4 py-3 font-bold text-\[#23796F\] dark:text-dark-teal whitespace-nowrap">/g,
  '<td className="px-4 py-3 font-bold text-[#23796F] dark:text-dark-teal dark:group-hover:text-dark-teal whitespace-nowrap relative">\n                          <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-[#23796F] dark:bg-dark-teal opacity-0 group-hover:opacity-100 transition-opacity"></div>'
);

// Primary text (Member Name): 
// text-gray-900 dark:text-dark-text-primary dark:group-hover:text-white font-bold
// already applied.

// Secondary text:
// text-gray-500 dark:text-dark-text-secondary dark:group-hover:text-gray-300 mt-0.5
// already applied.

// Table Header background
// <tr className="bg-[#F5F8F7] dark:bg-dark-canvas text-[11px] uppercase text-gray-600 dark:text-dark-text-secondary border-b border-[#D5E2DF] dark:border-dark-border">
content = content.replace(
  /bg-\[#F5F8F7\] dark:bg-dark-canvas text-\[11px\] uppercase text-gray-600/g,
  'bg-white dark:bg-[#18253A] text-[11px] uppercase text-gray-600 dark:text-[#CBD5E1]'
);
content = content.replace(
  /border-[#D5E2DF] dark:border-dark-border/g,
  'border-[#D5E2DF] dark:border-dark-divider'
);

// Search input wrapper
// className="block w-full rounded-md border-0 py-2 pl-10 text-gray-900 dark:text-dark-text-primary shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-dark-border-strong placeholder:text-gray-400 dark:text-dark-text-muted focus:ring-2 focus:ring-inset focus:ring-[#23796F] dark:focus:ring-dark-teal sm:text-sm sm:leading-6 outline-none"
content = content.replace(
  /bg-white dark:bg-dark-surface p-4 rounded-xl border border-\[#D5E2DF\]/g,
  'bg-white dark:bg-dark-surface p-4 rounded-xl border border-[#D5E2DF]'
);
content = content.replace(
  /ring-gray-300 dark:ring-dark-border-strong/g,
  'ring-gray-300 dark:ring-dark-border bg-white dark:bg-[#18253A]'
);

fs.writeFileSync('src/pages/Members.tsx', content, 'utf8');
