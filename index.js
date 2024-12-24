//npm i express body-parser ejs htmlspecialchars mysql2 md5
const express = require('express');
const port = 4371;
const app = express();
app.use(express.json());

const bodyParser = require('body-parser');
const path = require("path");
app.use(bodyParser.urlencoded({extended: false}));

let db_M = require('./database');
global.db_pool = db_M.pool;

app.set("view engine", "ejs");
app.set('views', path.join(__dirname, "/views"));

var htmlspecialchars = require('htmlspecialchars');
var md5 = require('md5');

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

app.post("/login",async (req,res)=>{
    let username    = req.body.username;
    let passwd      = md5('2'+req.body.passwd);

    let Query="SELECT * FROM users";
    Query +=" WHERE ";
    Query +=` username='${username}'`;
    Query +=" AND ";
    Query +=` passwd='${passwd}'`;
    console.log(Query);

    const promisePool = db_pool.promise();
    let rows=[];
    try {
        [rows] = await promisePool.query(Query);
        if (rows.length === 0){
            res.status(200).json({msg:"NO"});
        } else {
            res.status(200).json({msg:"ok"});
        }
    } catch (err) {
        console.log(err);
        res.status(500).json({msg:err});
    }

});
app.post("/register",async (req,res)=>{
    let name        = req.body.name;
    let username    = req.body.username;
    let passwd      = md5('2'+req.body.passwd);

    let Query  = "INSERT INTO `users`";
    Query += "( `name`, `username`, `passwd`)  ";
    Query += " VALUES ";
    Query += `( '${name}', '${username}', '${passwd}')  `;

    const promisePool = db_pool.promise();
    let rows=[];
    try {
        [rows] = await promisePool.query(Query);
        res.status(200).json({msg:"ok",insertId:rows.insertId});
    } catch (err) {
        console.log(err);
        res.status(500).json({msg:err});
    }
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
