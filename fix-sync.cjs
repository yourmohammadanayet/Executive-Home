const fs = require('fs');

let content = fs.readFileSync('src/lib/accessControlService.ts', 'utf8');

content = content.replace(
  /email: updatedFields\.email !== undefined \? updatedFields\.email : members\[mIndex\]\.email,/g,
  `email: updatedFields.email !== undefined ? updatedFields.email : members[mIndex].email,
          photo_url: updatedFields.photo_url !== undefined ? updatedFields.photo_url : members[mIndex].photo_url,`
);

fs.writeFileSync('src/lib/accessControlService.ts', content, 'utf8');
