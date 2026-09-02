// خادم بسيط بدون مكتبات خارجية — واجهة + قاعدة بيانات ملف
const http=require("http");
const fs=require("fs");
const path=require("path");

const PORT=process.env.PORT||8090;
const DB=path.join(__dirname,"data","schedule.json");
const PUBLIC=path.join(__dirname,"public");

function readDB(){try{return JSON.parse(fs.readFileSync(DB,"utf8"));}catch(e){return [];}}
function writeDB(d){fs.mkdirSync(path.dirname(DB),{recursive:true});fs.writeFileSync(DB,JSON.stringify(d,null,2));}

const MIME={".html":"text/html; charset=utf-8",".js":"text/javascript",".css":"text/css",
  ".json":"application/json",".png":"image/png",".svg":"image/svg+xml",".ico":"image/x-icon"};

const server=http.createServer((req,res)=>{
  const url=req.url.split("?")[0];
  // API
  if(url==="/api/schedule"){
    if(req.method==="GET"){
      res.writeHead(200,{"Content-Type":"application/json; charset=utf-8"});
      return res.end(JSON.stringify(readDB()));
    }
    if(req.method==="POST"){
      let body="";
      req.on("data",c=>{body+=c;if(body.length>2e6)req.destroy();});
      req.on("end",()=>{
        try{const d=JSON.parse(body);if(!Array.isArray(d))throw 0;
          writeDB(d);
          res.writeHead(200,{"Content-Type":"application/json; charset=utf-8"});
          res.end(JSON.stringify({ok:true,count:d.length}));
        }catch(e){res.writeHead(400);res.end(JSON.stringify({ok:false}));}
      });
      return;
    }
    if(req.method==="PUT"){ // إعادة تعيين للبذرة الافتراضية
      let seed="";
      try{seed=fs.readFileSync(path.join(PUBLIC,"seed.json"),"utf8");
        writeDB(JSON.parse(seed));}catch(e){}
      res.writeHead(200,{"Content-Type":"application/json; charset=utf-8"});
      return res.end(JSON.stringify({ok:true}));
    }
  }
  // ملفات ثابتة
  let file=path.join(PUBLIC, url==="/"?"index.html":url);
  if(!file.startsWith(PUBLIC)){res.writeHead(403);return res.end("forbidden");}
  fs.readFile(file,(err,data)=>{
    if(err){res.writeHead(404);return res.end("not found");}
    res.writeHead(200,{"Content-Type":(MIME[path.extname(file)]||"application/octet-stream")});
    res.end(data);
  });
});
server.listen(PORT,"0.0.0.0",()=>console.log("server on http://0.0.0.0:"+PORT));
