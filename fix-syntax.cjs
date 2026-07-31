const fs = require('fs');
let content = fs.readFileSync('src/pages/MyProfile.tsx', 'utf8');

content = content.replace(
  /\) : \(\s*\{fullName\?\.charAt\(0\) \|\| 'M'\}\s*\)\}/g,
  ') : ( fullName?.charAt(0) || \'M\' )}'
);

fs.writeFileSync('src/pages/MyProfile.tsx', content, 'utf8');
