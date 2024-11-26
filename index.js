const express = require('express');
const port = 4371;
const app = express();
app.use(express.json());

const bodyParser = require('body-parser');
const path = require("path");
app.use(bodyParser.urlencoded({extended: false}));

let curr_id=1;
let reviews=[];
let r1={id:curr_id,title:"LOTR",content:"one to rule"};
curr_id++;
reviews.push(r1);

app.post("/Review",(req,res)=>{
    let item={};
    item.id      = curr_id;
    item.title   = req.body.title;
    item.content = req.body.content;
    curr_id++;
    reviews.push(item);

    res.status(200).json("ok");
});
app.get('/Review', (req, res) => {
    res.status(200).json(reviews);
});

app.get('/', (req, res) => {
    res.status(200).sendFile(path.join(__dirname,"/views/review_main.html"));
});

app.listen(port, () => {            //server starts listening for any attempts from a client to connect at port: {port}
    console.log(`Now listening on port http://localhost:${port}`);
});
