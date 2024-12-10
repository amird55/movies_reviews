//npm i express body-parser ejs htmlspecialchars
const express = require('express');
const port = 4371;
const app = express();
app.use(express.json());

const bodyParser = require('body-parser');
const path = require("path");
app.use(bodyParser.urlencoded({extended: false}));

app.set("view engine", "ejs");
app.set('views', path.join(__dirname, "/views"));

var htmlspecialchars = require('htmlspecialchars');

let curr_id=1;
let reviews=[];
let r1={id:curr_id,title:"XSS",content:"<img src='x' onerror='alert(1)' >"};
// let r1={id:curr_id,title:"LOTR",content:"one to rule"};
curr_id++;
reviews.push(r1);

app.post("/Review",(req,res)=>{
    let item={};
    item.id      = curr_id;
    item.title   = req.body.title;
    item.content = req.body.content;
    curr_id++;
    reviews.push(item);

    console.log(reviews);
    res.status(200).json("ok");
});
app.get('/Review', (req, res) => {
    let safeRows = []
    for (let row of reviews){
        safeRows.push({
            id:                      row.id,
            title:  htmlspecialchars(row.title),
            content:htmlspecialchars(row.content)
        });
    }
    res.status(200).json(safeRows);
});

app.get('/', (req, res) => {
    res.status(200).sendFile(path.join(__dirname,"/views/review_main.html"));
});
app.get("/ssr", (req,res)=>{
    res.render("review_ssr",
        {AllReviews:reviews}
    );
});

app.listen(port, () => {            //server starts listening for any attempts from a client to connect at port: {port}
    console.log(`Now listening on port http://localhost:${port}`);
});
