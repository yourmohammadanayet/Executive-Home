const fs = require('fs');

let content = fs.readFileSync('src/pages/Members.tsx', 'utf8');

// I need to change how the room badge is rendered in the table cell
const regex = /<span className="inline-flex items-center gap-1 bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-slate-300 px-2 py-0\.5 rounded text-\[10px\] font-bold uppercase tracking-wider">\s*<DoorClosed className="w-3 h-3" \/>\s*\{member\.room_id\}\s*<\/span>/g;

const replacement = `
                          {(() => {
                            let badgeClass = "bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-slate-300";
                            if (member.room_id.includes('A')) badgeClass = "bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-transparent dark:border-blue-800/50";
                            else if (member.room_id.includes('M')) badgeClass = "bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border border-transparent dark:border-purple-800/50";
                            else if (member.room_id.includes('S')) badgeClass = "bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 border border-transparent dark:border-teal-800/50";
                            else if (member.room_id.includes('W')) badgeClass = "bg-gray-100 dark:bg-gray-800/50 text-gray-700 dark:text-gray-400 border border-transparent dark:border-gray-700/50";

                            return (
                              <span className={\`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider \${badgeClass}\`}>
                                <DoorClosed className="w-3 h-3" />
                                {member.room_id}
                              </span>
                            );
                          })()}
`;

content = content.replace(regex, replacement);

fs.writeFileSync('src/pages/Members.tsx', content, 'utf8');
