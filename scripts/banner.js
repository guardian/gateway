const chalkRainbow = require('chalk-rainbow');

const [, , messages] = process.argv;

const banner = `
             ┏━━━━━━━━━┅┅~~ ~
             ┃ $msg
             ┗━━━━━━━━━┅┅~~ ~
 /\\**/\\       │
( o_o  )_     │
 (u--u   \\_)  │                                         
  (||___   )==\\                                         
,dP"/b/=( /P"/b\\                                        
|8 || 8\\=== || 8                                        
\`b,  ,P  \`b,  ,P                                        
  """\`     """\`                                         
`.split('\n');

banner.forEach((row) => {
  console.log(chalkRainbow('    ' + row.replace('$msg', messages)));
});

//source -> http://www.asciiartfarts.com/
