//jshint esversion:6
require('dotenv').config()
//console.log(process.env)
const express = require("express");
const ejs = require("ejs");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
// const encrypt = require("mongoose-encryption")
// const md5 = require("md5");
const bcrypt = require("bcrypt"); //salting
const saltRounds = 10;  //no. of rounds

const app = express();

app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));
app.set("view engine", "ejs");

mongoose.connect("mongodb://0.0.0.0:27017/userDB",{useNewUrlParser:true});


const userSchema = new mongoose.Schema({  //authentication -- this sehema is no longer javascript obj but a mongoose sehema obj , created from mongoose class what we require
  email:String,                          // for more info- https://www.npmjs.com/package/mongoose-encryption
  password:String
});

const User = mongoose.model("User",userSchema); //model- collection


app.get("/",function(req,res){
  res.render("home");
});

app.get("/register", function(req,res){
  res.render("register");
});

app.get("/login", function(req,res){
  res.render("login");
});

// level-4 salting and salt rounds
app.post("/register",(req,res)=>{
  // const email = req.body.username;
  // const password = req.body.password;
  //D  hash fun  user input pass  no of salt
  bcrypt.hash(req.body.password, saltRounds, function(err, hash) {  // bcrypt generate the hash with the no of salt required
    const newUser = new User({  //document
      email:req.body.username,
      password:hash
        });
    newUser.save((err)=>{
      if(err)
      console.log(err);
      else
      res.render("secrets");
    });
  });
});
//level 4 authentication Salting and  saltRounds
app.post("/login",function(req,res){
  const userName = req.body.username;
  const password = req.body.password;
  User.findOne({email:userName},(err,foundobj)=>{
    if(err) console.log(err);
    else{
      if(foundobj){                       //if its true the check for password
//bcrypt     compare fun  uesrinput pass  database stored hashSlated pass
        bcrypt.compare(password , foundobj.password, function(err, result) {  //bcrypt will take userinput password and combine with salt stored in the database,salt no of times, and check with database saltedHash password
          if(result==true)
          res.render("secrets");
        });
      }
    }
  });
});






app.listen(3000,function(){
  console.log("working");
})
