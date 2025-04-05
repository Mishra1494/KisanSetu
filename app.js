const express = require('express');
const app = express();
const mongoose = require("mongoose");
const ejs = require('ejs');
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
app.set("view engine","ejs");
app.set("views",path.join(__dirname,"views"));
app.use(express.urlencoded({extended:true}));
app.use(methodOverride("_method"));
app.engine("ejs",ejsMate);
app.use(express.static(path.join(__dirname,"/public")));

app.listen(3000,()=>{
    console.log("Listning........");
})

// mongo connections
async function main() {
    await mongoose.connect("mongodb://127.0.0.1:27017/fakewhatsapp");
}

main().then(()=>{
    console.log("connection hogya<<<");
}).catch(err =>{
    console.log("failed");
})



app.get("/",(req,res)=>{
     res.render("HomePage.ejs");
})