const mongoose = require('mongoose') ; 
const dotenv = require('dotenv') ; 
const app = require('./app') ; 
dotenv.config({path :'./config.env'}) ; 
const PORT = process.env.PORT  ;
const db = process.env.DATABASE 
const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = "mongodb+srv://sashrikgupta:NZCFR0A9BeIoyltn@cluster0.u0pqprx.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
const moment = require('moment')

mongoose
    .connect(uri)
    .then(console.log("connected"))
    .catch((err)=>console.log("mongo error"))


app.use('/' , (req , res)=>{
    res.send("hello")
})

app.listen(PORT, (req, res) => {
    console.log("server has been started at port: " + PORT  + ` created on : ${moment().format('YYYY-MM-DD')}`);
});