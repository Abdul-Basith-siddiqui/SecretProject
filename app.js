//jshint esversion:6
require('dotenv').config()
//console.log(process.env)
const express = require("express");
const ejs = require("ejs");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const encrypt = require("mongoose-encryption")
const md5 = require("md5");

const app = express();

app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));
app.set("view engine", "ejs");

mongoose.connect("mongodb://0.0.0.0:27017/userDB",{useNewUrlParser:true});
//level-3 authentication - Hashing --when use register password it is converted into hash form by md5 hash function and store in the database.
// when user try to login again password is converted into hash form then check, (converted user hash) to (database hash) password if(true) render, else err.
const userSchema = new mongoose.Schema({  //authentication -- this sehema is no longer javascript obj but a mongoose sehema obj , created from mongoose class what we require
  email:String,                          // for more info- https://www.npmjs.com/package/mongoose-encryption
  password:String
});
// {
// // // //Schemas are pluggable, that is, they allow for applying pre-packaged capabilities to extend their functionality. This is a very powerful feature.
// // // //Plugins are a tool for reusing logic in multiple schemas. Suppose you have several models in your database and want to add a loadedAt property to each one. Just create a plugin once and apply it to each Schema:
// // // //ceasar cipher, Enigma ceasar and morden (AES)                                     ///USING ENVIRONMENT VARIABLE
// // // console.log(process.env.SECRET); //password+enykey-cypher method(AES)->cipher text
// // //   userSchema.plugin(encrypt,{secret:process.env.SECRET, encryptedFields: ['password']});
// // // // schema    plugin  package   object                           what to encrypt
// // // // when document is save() then it encrypt                                       //var secret = process.env.SOME_LONG_UNGUESSABLE_STRING;
// // // // when find or findOne() use it decript                                          //userSchema.plugin(encrypt, { secret: secret });
// }
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

app.post("/register",(req,res)=>{
  // const email = req.body.username;
  // const password = req.body.password;

  const newUser = new User({  //document
    email:req.body.username,
    password:md5(req.body.password) //  converting user type password to Hashing form and then storing into the database
  });                               // once converted to hash form cant be covert back to original text thus, no key needed.
  newUser.save((err)=>{
    if(err)
    console.log(err);
    else
    res.render("secrets");
  });

});
//level 5 authentication Hashing
app.post("/login",function(req,res){
  const userName = req.body.username;
  const password = md5(req.body.password);
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
