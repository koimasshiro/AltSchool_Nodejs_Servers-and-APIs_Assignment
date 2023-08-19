const path = require("path");
const fs = require("fs");
const http = require("http");

const itemsPath = path.join(__dirname, "items.json");

const PORT = 4000;


//--------Request Handlers------------------------

function reqHandlers(req, res) {
    if (req.url === "/items" && req.method === "POST") {
        postItems(req, res);
    }

    if (req.url === "/items" && req.method === "GET") {
        getAllItems(req, res);
    }

    if (req.url.startsWith("/items/") && req.method === "GET") {
        getOneItem(req, res);
    }

    if (req.url.startsWith("/items/") && req.method === "PATCH") {
        updateItem(req, res);
    }

    if (req.url.startsWith("/items/") && req.method === "DELETE") {
        deleteItem(req, res);
    }
}

const server = http.createServer(reqHandlers);

server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});


//Create an Item

function postItems(req, res, next) {
    const itemsDB = fs.readFileSync("./items.json")
    const items = JSON.parse(itemsDB)

      const body = [];

      req.on("data", (chunk) => {
        body.push(chunk);
      });

      req.on("end", ()=>{
        const parsedBody = Buffer.concat(body).toString();
        const itemsToPost = JSON.parse(body);

        items.push({
            ...itemsToPost, id: Math.floor(Math.random() * 500).toString(),
        });

        fs.writeFile(itemsPath, JSON.stringify(items), (err)=>{
            if (err){
                 serverError();
            }

            res.end(JSON.stringify(itemsToPost))
        })
      })
}


//Get all Items

function getAllItems(req, res) {
    fs.readFile(itemsPath, "utf-8", (err, data) => {
        if (err) {
            serverError();
        }
        res.end(data);
    });
}


//Get one item

function getOneItem(req, res) {
    const id = req.url.split("/")[2];
    const items = fs.readFileSync(itemsPath);
    const arrayOfObj = JSON.parse(items);

    const itemIndex = arrayOfObj.findIndex((item) => {
        return item.id === id;
    });

    if (itemIndex == -1) {
        res.writeHead(404);
        res.end("Item not found");
    }
    res.end(JSON.stringify(arrayOfObj[itemIndex]));
}



//Update an Item

function updateItem(req, res) {
    const id = req.url.split("/")[2];

    const items = fs.readFileSync(itemsPath);
    const arrayOfObj = JSON.parse(items);

    const body = [];
    req.on("data", (chunk)=>{
        body.push(chunk);
    })

    req.on("end", ()=>{
        const parsedBody = Buffer.concat(body).toString();
        const update = JSON.parse(parsedBody);

        const indexItem = arrayOfObj.findIndex((item)=> {
            return item.id === id;
        });

        if(indexItem == -1){
            res.writeHead(404);
            res.end("Item not found");
        }

        arrayOfObj[indexItem] = {...arrayOfObj[indexItem], ...update};

        fs.writeFile(itemsPath, JSON.stringify(arrayOfObj), (err)=> {
            if(err){
                serverError();
            }
            res.end(JSON.stringify(arrayOfObj[indexItem]));
        })
    })
}


//Delete an Item

function deleteItem(req, res){
    const id = req.url.split("/")[2];

    const items = fs.readFileSync(itemsPath);
    const arrayOfObj = JSON.parse(items);

    const indexItem = arrayOfObj.findIndex((item)=>{
        return item.id === id;
    });

    if (indexItem == -1){
        res.writeHead(404);
        res.end("Item not found");
    }

    arrayOfObj.splice(indexItem, 1);

    fs.writeFile(itemsPath, JSON.stringify(arrayOfObj), (err)=>{
        if(err){
            serverError();
        }
        res.end("Item deleted successfully");
    })
}



//Error Handlers
function serverError() {
    res.writeHead("500");
    res.end("Internal Server Error");
}

