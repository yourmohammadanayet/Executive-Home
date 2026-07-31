const fs = require('fs');

let content = fs.readFileSync('src/components/Layout.tsx', 'utf8');

// Replace imports
content = content.replace(
  /ChevronDown,\n  Moon,\n  Sun\n} from 'lucide-react';/,
  `ChevronDown,
  Moon,
  Sun,
  Monitor
} from 'lucide-react';`
);

content = content.replace(
  /const { theme, toggleTheme } = useTheme\(\);/g,
  `const { theme, setTheme, resolvedTheme } = useTheme();\n  const [themeMenuOpen, setThemeMenuOpen] = useState(false);`
);

const oldToggleRegex = /\{\/\* Theme Toggle \*\/\}[\s\S]*?(?=<!--|{\/\* User Avatar)/;

const newToggle = `{/* Theme Toggle Menu */}
              <div className="relative">
                <button
                  onClick={() => setThemeMenuOpen(!themeMenuOpen)}
                  className="p-2 text-gray-500 dark:text-dark-text-muted hover:text-[#23796F] dark:hover:text-dark-teal rounded-full hover:bg-gray-100 dark:hover:bg-dark-raised transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#23796F] dark:focus-visible:ring-dark-teal"
                  title="Theme preferences"
                >
                  {resolvedTheme === 'light' ? (
                    <Sun className="w-5 h-5" />
                  ) : (
                    <Moon className="w-5 h-5" />
                  )}
                </button>
                
                {themeMenuOpen && (
                  <div 
                    className="absolute right-0 mt-2 w-36 bg-white dark:bg-dark-surface rounded-xl shadow-xl border border-[#D5E2DF] dark:border-dark-border py-2 z-50 animate-in fade-in zoom-in duration-100"
                    onMouseLeave={() => setThemeMenuOpen(false)}
                  >
                    <button
                      onClick={() => { setTheme('light'); setThemeMenuOpen(false); }}
                      className={\`w-full text-left flex items-center gap-2 px-4 py-2 text-xs font-semibold hover:bg-[#F5F8F7] dark:hover:bg-dark-hover \${theme === 'light' ? 'text-[#23796F] dark:text-dark-teal' : 'text-gray-700 dark:text-dark-text-secondary'}\`}
                    >
                      <Sun className="w-4 h-4" /> Light
                    </button>
                    <button
                      onClick={() => { setTheme('dark'); setThemeMenuOpen(false); }}
                      className={\`w-full text-left flex items-center gap-2 px-4 py-2 text-xs font-semibold hover:bg-[#F5F8F7] dark:hover:bg-dark-hover \${theme === 'dark' ? 'text-[#23796F] dark:text-dark-teal' : 'text-gray-700 dark:text-dark-text-secondary'}\`}
                    >
                      <Moon className="w-4 h-4" /> Dark
                    </button>
                    <button
                      onClick={() => { setTheme('system'); setThemeMenuOpen(false); }}
                      className={\`w-full text-left flex items-center gap-2 px-4 py-2 text-xs font-semibold hover:bg-[#F5F8F7] dark:hover:bg-dark-hover \${theme === 'system' ? 'text-[#23796F] dark:text-dark-teal' : 'text-gray-700 dark:text-dark-text-secondary'}\`}
                    >
                      <Monitor className="w-4 h-4" /> System
                    </button>
                  </div>
                )}
              </div>

              `;

// The regex might be tricky. Let's do string split and replace
content = content.replace(/\{\/\* Theme Toggle \*\/\}[\s\S]*?\{\/\* User Avatar Menu Dropdown/g, newToggle + '{/* User Avatar Menu Dropdown');

fs.writeFileSync('src/components/Layout.tsx', content, 'utf8');
