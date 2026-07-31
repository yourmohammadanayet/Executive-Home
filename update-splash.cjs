const fs = require('fs');
let content = fs.readFileSync('src/components/SplashScreen.tsx', 'utf8');

content = content.replace(
  /\{userAccess\.full_name\?\.charAt\(0\) \|\| \(isAdmin \? 'A' : 'M'\)\}/g,
  `{userAccess.photo_url ? (
                    <img src={userAccess.photo_url} alt="Profile" className="w-full h-full object-cover rounded-full" />
                  ) : (
                    userAccess.full_name?.charAt(0) || (isAdmin ? 'A' : 'M')
                  )}`
);

fs.writeFileSync('src/components/SplashScreen.tsx', content, 'utf8');
