const path = require("path");
const fs = require("fs");
const http = require("http");

const webPage = path.join(__dirname, 'index.html');
const errorPage = path.join(__dirname, 'errorPage.html');


const PORT = 3000;



function reqHandler(req, res){
    if(req.url === '/'){
        getHomePage(req, res);
    }

    if(req.url.endsWith(".html") && req.method === "GET"){
        try{
            getRequestedPage(req,res);
        }
        catch{
            getErrorPage(req,res);
        }
    }
}

const server = http.createServer(reqHandler);

server.listen(PORT, ()=> {
    console.log(`Server running on http://localhost:${PORT}`);
})


function getHomePage(req, res){
    res.setHeader("content-type", "text/html");
    res.writeHead(200);
    res.end(fs.readFileSync(webPage));
}

function getRequestedPage(req, res){
    const file = req.url.split('/')[1];
    const mainPath = path.join(__dirname, file);
    const webPath = fs.readFileSync(mainPath);

    res.setHeader("content-type", "text/html");
    res.writeHead(200);
    res.end(webPath);
}

function getErrorPage(req, res){
    res.setHeader("content-type","text/html");
    res.writeHead(404);
    res.end(fs.readFileSync(errorPage));
}