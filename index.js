const express = require('express');
const port = 4371;
const app = express();
app.use(express.json());

const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended: false}));

let curr_id=1;
let reviews=[];
let r1={id:curr_id,title:"LOTR",content:"one to rule"};
curr_id++;
reviews.push(r1);


app.listen(port, () => {            //server starts listening for any attempts from a client to connect at port: {port}
    console.log(`Now listening on port http://localhost:${port}`);
});
