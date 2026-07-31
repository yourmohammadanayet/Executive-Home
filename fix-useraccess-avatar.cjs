const fs = require('fs');

let content = fs.readFileSync('src/pages/UserAccess.tsx', 'utf8');

content = content.replace(
  /<div className="w-8 h-8 rounded-full bg-\[#173F3A\] text-white font-bold flex items-center justify-center shrink-0 text-xs">\s*\{rec\.full_name\.charAt\(0\)\}\s*<\/div>/g,
  `<div className="w-8 h-8 rounded-full bg-[#173F3A] text-white font-bold flex items-center justify-center shrink-0 text-xs overflow-hidden">
                            {rec.photo_url ? (
                              <img src={rec.photo_url} alt="" className="w-full h-full object-cover" />
                            ) : (
                              rec.full_name.charAt(0)
                            )}
                          </div>`
);

fs.writeFileSync('src/pages/UserAccess.tsx', content, 'utf8');
