const fs = require('fs');
const file = 'components/Expertise.tsx';
let content = fs.readFileSync(file, 'utf8');
content = content.replace(/transformOrigin="([^"]+)"/g, 'style={{ transformOrigin: "$1" }}');
fs.writeFileSync(file, content);
console.log('Done');
