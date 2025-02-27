//npm i express cookie-parser jsonwebtoken body-parser ejs htmlspecialchars mysql2 md5 slashes@2.0.0
// https://www.npmjs.com/package/slashes/v/2.0.0

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

var cookieParser = require('cookie-parser');
app.use(cookieParser());
var jwt = require('jsonwebtoken');

var htmlspecialchars = require('htmlspecialchars');
var md5 = require('md5');
const { addSlashes, stripSlashes } = require('slashes');

let curr_id=1;
let reviews=[];
let r1={id:curr_id,title:"XSS",content:"<img src='x' onerror='alert(1)' >"};
// let r1={id:curr_id,title:"LOTR",content:"one to rule"};
curr_id++;
reviews.push(r1);

let HadLoggin=false;

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
    let username    = addSlashes(req.body.username);
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
            // console.log("id=",rows[0].id);
            let val = `${rows[0].id},${rows[0].name}`;
            var token = jwt.sign(
                {data: val},
                'myPrivateKey',
                { expiresIn: 31*24*60*60 // in sec
                });
            res.cookie("ImLogged", token, {
                maxAge: 31*24*60*60 * 1000, // 3hrs in ms
            });
            //HadLoggin=true;
            res.status(200).json({msg:"ok"});
        }
    } catch (err) {
        console.log(err);
        res.status(500).json({msg:err});
    }

});
app.post("/register",async (req,res)=>{
    let name        = addSlashes(req.body.name);
    let username    = addSlashes(req.body.username);
    let passwd      = md5('2'+req.body.passwd);

    let Query  = "INSERT INTO `users`";
    Query += "( `name`, `username`, `passwd`)  ";
    Query += " VALUES ";
    Query += `( '${name}', '${username}', '${passwd}')  `;
    console.log(Query);

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

app.get('/UsersList',async (req,res)=>{
    let Query="SELECT name,username FROM users";
    console.log(Query);

    const promisePool = db_pool.promise();
    let rows=[];
    try {
        [rows] = await promisePool.query(Query);
        for(let k in rows){
            rows[k].name     = stripSlashes(rows[k].name);
            rows[k].username = stripSlashes(rows[k].username);
        }
        res.status(200).json(rows);
    } catch (err) {
        console.log(err);
        res.status(500).json({msg:err});
    }

})

app.get('/', (req, res) => {
    res.status(200).sendFile(path.join(__dirname,"/views/review_main.html"));
});
app.get("/ssr", (req,res)=>{
    res.render("review_ssr",
        {AllReviews:reviews}
    );
});
app.get('/Lpage', (req, res) => {
    //אם עשיתי בעבר לוגין אני רוצה לעבור לעמוד פנימי
    const jwtToken = req.cookies.ImLogged;
    let user_id=-1;
    if (jwtToken !== "") {
        jwt.verify(jwtToken, 'myPrivateKey', async (err, decodedToken) => {
                console.log("decodedToken=",decodedToken);
            if (err) {
                console.log("err=",err);
            } else {
                // let val = `${rows[0].id},${rows[0].name}`;
                let data = decodedToken.data;
                console.log("data=",data);
            }
        })
    }

    res.status(200).sendFile(path.join(__dirname,"/views/login.html"));
});
app.get('/p1', (req, res) => {
    // console.log(req.cookies);
    if(req.cookies.ImLogged === undefined){
        res.redirect("/Lpage");
    } else
    res.status(200).sendFile(path.join(__dirname,"/views/p1.html"));
});

app.listen(port, () => {            //server starts listening for any attempts from a client to connect at port: {port}
    console.log(`Now listening on port http://localhost:${port}`);
});
