const fs = require('fs');

let content = fs.readFileSync('src/components/AddMemberModal.tsx', 'utf8');

const importRegex = /import \{ \n  X,\n  User,/g;
content = content.replace(importRegex, `import { \n  Camera,\n  X,\n  User,`);

content = content.replace(
  /const \[fullName, setFullName\] = useState\(''\);/,
  `const [fullName, setFullName] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');`
);

content = content.replace(
  /const newMember: Partial<Member> = \{/,
  `const newMember: Partial<Member> = {
      photo_url: photoUrl,`
);

const profilePicHtml = `
            <div className="flex justify-center mb-6">
              <div className="relative group w-20 h-20 shrink-0">
                <div className="w-20 h-20 rounded-full bg-gray-100 dark:bg-dark-raised text-gray-400 dark:text-dark-text-muted text-2xl font-bold flex items-center justify-center border-2 border-dashed border-gray-300 dark:border-dark-border overflow-hidden shadow-sm group-hover:border-[#23796F] dark:group-hover:border-dark-teal transition-colors">
                  {photoUrl ? (
                    <img src={photoUrl} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-8 h-8" />
                  )}
                </div>
                
                <label className="absolute bottom-0 right-0 bg-[#23796F] dark:bg-dark-teal text-white p-1.5 rounded-full cursor-pointer shadow-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-[#173F3A] dark:hover:bg-teal-600">
                  <Camera className="w-4 h-4" />
                  <input 
                    type="file" 
                    className="hidden" 
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          setPhotoUrl(reader.result as string);
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                  />
                </label>
              </div>
            </div>
`;

content = content.replace(
  /<form onSubmit=\{handleSubmit\} className="space-y-6">([\s\S]*?)<div className="space-y-4">/,
  `<form onSubmit={handleSubmit} className="space-y-6">
${profilePicHtml}
            <div className="space-y-4">`
);

fs.writeFileSync('src/components/AddMemberModal.tsx', content, 'utf8');

