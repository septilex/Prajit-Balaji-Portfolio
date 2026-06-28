const fs = require('fs');
const path = require('path');

const walkSync = (dir, filelist = []) => {
  fs.readdirSync(dir).forEach(file => {
    const dirFile = path.join(dir, file);
    if (fs.statSync(dirFile).isDirectory()) {
      if (file !== 'node_modules' && file !== '.next' && file !== '.git') {
        filelist = walkSync(dirFile, filelist);
      }
    } else if (dirFile.endsWith('.tsx')) {
      filelist.push(dirFile);
    }
  });
  return filelist;
};

const files = walkSync('.');
let changedCount = 0;

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  
  const classRegex = /(className=(?:\"|\{`))(.*?)(?:\"|`\})/g;
  let newContent = content.replace(classRegex, (match, prefix, cls) => {
    if (!cls) return match;
    if (cls.includes('font-researcher')) return match; 
    
    // Condition: contains 'uppercase' AND 'tracking-[0' AND ('text-[1' OR 'text-xs')
    if (cls.includes('uppercase') && cls.includes('tracking-[0') && (cls.includes('text-[1') || cls.includes('text-xs'))) {
        const suffix = match.endsWith('}') ? '`}' : '"';
        return `${prefix}${cls} font-researcher${suffix}`;
    }
    return match;
  });
  
  if (content !== newContent) {
    fs.writeFileSync(file, newContent);
    changedCount++;
    console.log('Updated', file);
  }
});

console.log('Total files changed:', changedCount);
