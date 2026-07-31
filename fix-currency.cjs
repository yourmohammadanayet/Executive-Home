const fs = require('fs');

let dashboard = fs.readFileSync('src/pages/Dashboard.tsx', 'utf8');
dashboard = dashboard.replace(/BDT /g, '৳');
dashboard = dashboard.replace(/\(BDT\)/g, '(৳)');
fs.writeFileSync('src/pages/Dashboard.tsx', dashboard, 'utf8');

