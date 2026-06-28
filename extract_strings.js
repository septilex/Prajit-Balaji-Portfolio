const fs=require('fs');
let c1 = fs.readFileSync('.next/dev/cache/turbopack/ee6e79b1/00001794.sst', 'utf8');
let c2 = fs.readFileSync('.next/dev/cache/turbopack/ee6e79b1/00001795.sst', 'utf8');
let s = c1 + c2;
let strings = s.match(/[\w\s\{\}\/\<\>\=\"\'\-\_\.\!\?]{20,}/g);
if(strings) {
  fs.writeFileSync('turbopack_strings.txt', strings.join('\n'));
  console.log('Wrote ' + strings.length + ' strings.');
}
