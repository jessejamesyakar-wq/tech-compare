// Local, read-only fixture server. Serves the actual extension assets. No
// catalog writes, price API proxy, external requests or extension installation.
const http=require('node:http'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..');
const assets={
 '/content.js':['extension/content.js','application/javascript'],
 '/widget.css':['extension/widget.css','text/css'],
};
http.createServer((req,res)=>{
 const pathname=new URL(req.url,'http://127.0.0.1:4174').pathname;
 const item=assets[pathname] || ((pathname.startsWith('/urun/')||pathname==='/search')?['scripts/fixtures/extension-radar/index.html','text/html']:null);
 if(req.method!=='GET'||!item){res.writeHead(404);res.end();return;}
 res.writeHead(200,{'Content-Type':item[1]+'; charset=utf-8','Cache-Control':'no-store'});res.end(fs.readFileSync(path.join(root,item[0])));
}).listen(4174,'127.0.0.1',()=>console.log('Extension UI fixture: http://127.0.0.1:4174/urun/initial (simulated data)'));
