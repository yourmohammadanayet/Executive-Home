const fs = require('fs');

// We need to add photo_url edit capability to EditMemberModal.tsx
let content = fs.readFileSync('src/components/EditMemberModal.tsx', 'utf8');

const importRegex = /import \{ \n  X,\n  User,/g;
content = content.replace(importRegex, `import { \n  Camera,\n  X,\n  User,`);

// state variables for photo_url
content = content.replace(
  /const \[fullName, setFullName\] = useState\(member\.full_name\);/,
  `const [fullName, setFullName] = useState(member.full_name);
  const [photoUrl, setPhotoUrl] = useState(member.photo_url || '');`
);

// Form submission
content = content.replace(
  /full_name: fullName,\n      phone,/g,
  `full_name: fullName,\n      photo_url: photoUrl,\n      phone,`
);

// Form UI
const profilePicHtml = `
            <div className="flex justify-center mb-6">
              <div className="relative group w-20 h-20 shrink-0">
                <div className="w-20 h-20 rounded-full bg-[#173F3A] text-white text-2xl font-bold flex items-center justify-center border-2 border-[#23796F] overflow-hidden shadow-sm">
                  {photoUrl ? (
                    <img src={photoUrl} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    fullName?.charAt(0) || 'M'
                  )}
                </div>
                
                <label className="absolute bottom-0 right-0 bg-[#23796F] text-white p-1.5 rounded-full cursor-pointer shadow-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-[#173F3A]">
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

fs.writeFileSync('src/components/EditMemberModal.tsx', content, 'utf8');

