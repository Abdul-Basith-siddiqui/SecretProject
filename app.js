//jshint esversion:6
const express = require("express");
const ejs = require("ejs");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

const app = express();

app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));
app.set("view engine", "ejs");

mongoose.connect("mongodb://0.0.0.0:27017/userDB",{useNewUrlParser:true});

const userSchema = {
  email:String,
  password:String
};

const User = mongoose.model("User",userSchema);


app.get("/",function(req,res){
  res.render("home");
});

app.get("/register", function(req,res){
  res.render("register");
});

app.get("/login", function(req,res){
  res.render("login");
});

app.post("/register",(req,res)=>{
  // const email = req.body.username;
  // const password = req.body.password;

  const newUser = new User({
    email:req.body.username,
    password:req.body.password
  });
  newUser.save((err)=>{
    if(err)
    console.log(err);
    else
    res.render("secrets");
  });

});
//level 1 authentication
app.post("/login",function(req,res){
  const userName = req.body.username;
  const password = req.body.password;
  User.findOne({email:userName},(err,foundEmail)=>{
    if(err) console.log(err);
    else{
      if(foundEmail){                       //if its true the check for password
        if(foundEmail.password === password)       // both are ture then render secretspage
        res.render("secrets");
      }
    }
  });
});






app.listen(3000,function(){
  console.log("working");
})
