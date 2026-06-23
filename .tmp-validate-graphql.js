const fs = require('fs');
const { parse } = require('graphql');
const src = fs.readFileSync('script.js', 'utf8');
const re = /request\(\s*`([\s\S]*?)`\s*\)/g;
let m; let ok = 0, fail = 0;
while ((m = re.exec(src))) {
  const q = m[1];
  try {
    parse(q);
    console.log('ok:', q.trim().split(/\n/)[0]);
    ok++;
  } catch (e) {
    console.error('fail:', e.message);
    console.error(q);
    fail++;
  }
}
console.log('summary', ok, 'valid', fail, 'invalid');
process.exit(fail);
