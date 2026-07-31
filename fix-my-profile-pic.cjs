const fs = require('fs');
let content = fs.readFileSync('src/pages/MyProfile.tsx', 'utf8');

// Add photo input reference and change handler
const importsToAdd = `import { Camera } from 'lucide-react';
`;
content = content.replace(/import \{ \n  User,/g, `import { \n  Camera,\n  User,`);

// state variables for photo_url
content = content.replace(
  /const \[fullName, setFullName\] = useState\(userAccess\?\.full_name \|\| ''\);/,
  `const [fullName, setFullName] = useState(userAccess?.full_name || '');
  const [photoUrl, setPhotoUrl] = useState(userAccess?.photo_url || '');`
);

// update handleDirectSave
content = content.replace(
  /full_name: fullName,\n        email,\n        phone,/g,
  `full_name: fullName,\n        photo_url: photoUrl,\n        email,\n        phone,`
);

// Render picture
content = content.replace(
  /<div className="w-16 h-16 rounded-full bg-\[#173F3A\] text-white text-2xl font-bold flex items-center justify-center border-2 border-\[#23796F\] dark:border-emerald-500">([\s\S]*?)<\/div>/g,
  `<div className="relative group w-16 h-16 shrink-0">
              <div className="w-16 h-16 rounded-full bg-[#173F3A] text-white text-2xl font-bold flex items-center justify-center border-2 border-[#23796F] dark:border-emerald-500 overflow-hidden shadow-sm">
                {photoUrl || userAccess?.photo_url ? (
                  <img src={photoUrl || userAccess?.photo_url} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  $1
                )}
              </div>
              
              <label htmlFor="profile-upload" className="absolute bottom-0 right-0 bg-[#23796F] dark:bg-dark-teal text-white p-1 rounded-full cursor-pointer shadow-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-[#173F3A] dark:hover:bg-teal-600">
                <Camera className="w-3.5 h-3.5" />
                <input 
                  type="file" 
                  id="profile-upload" 
                  className="hidden" 
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        setPhotoUrl(reader.result as string);
                        // Save immediately if we are admin or we just allow direct save
                        updateDirectUserProfile(userAccess?.id || 'mem-1', { photo_url: reader.result as string });
                        refreshUserAccess();
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                />
              </label>
            </div>`
);

fs.writeFileSync('src/pages/MyProfile.tsx', content, 'utf8');
