const fs = require('fs');

function updateLayout() {
  let content = fs.readFileSync('src/components/Layout.tsx', 'utf8');
  
  // Footer avatar (desktop)
  content = content.replace(
    /\{userAccess\?\.full_name\?\.charAt\(0\) \|\| \(isAdmin \? 'A' : 'M'\)\}/g,
    `{userAccess?.photo_url ? (
                    <img src={userAccess.photo_url} alt="Profile" className="w-full h-full object-cover rounded-full" />
                  ) : (
                    userAccess?.full_name?.charAt(0) || (isAdmin ? 'A' : 'M')
                  )}`
  );
  
  // Header Avatar (mobile top right)
  content = content.replace(
    /\{userAccess\?\.full_name\?\.charAt\(0\) \|\| 'U'\}/g,
    `{userAccess?.photo_url ? (
                    <img src={userAccess.photo_url} alt="Profile" className="w-full h-full object-cover rounded-full" />
                  ) : (
                    userAccess?.full_name?.charAt(0) || 'U'
                  )}`
  );

  fs.writeFileSync('src/components/Layout.tsx', content, 'utf8');
}

updateLayout();
