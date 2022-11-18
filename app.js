//jshint esversion:6
const express = require("express");
const ejs = require("ejs");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const encrypt = require("mongoose-encryption")

const app = express();

app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));
app.set("view engine", "ejs");

mongoose.connect("mongodb://0.0.0.0:27017/userDB",{useNewUrlParser:true});
//level-2 authentication - encryption
const userSchema = new mongoose.Schema({  //level-2 authentication -- this sehema is no longer javascript obj but a mongoose sehema obj , created from mongoose class what we require
  email:String,                          // for more info- https://www.npmjs.com/package/mongoose-encryption
  password:String
});
//Schemas are pluggable, that is, they allow for applying pre-packaged capabilities to extend their functionality. This is a very powerful feature.
//Plugins are a tool for reusing logic in multiple schemas. Suppose you have several models in your database and want to add a loadedAt property to each one. Just create a plugin once and apply it to each Schema:
  const secret = "thisisourlitlesecret.";  //encryption key                      //Secret String Instead of Two Keys
  userSchema.plugin(encrypt,{secret:secret, encryptedFields: ['password']});     //For convenience, you can also pass in a single secret string instead of two keys.
// schema    plugin  package   object        what to encrypt
// when document is save() then it encrypt                                       //var secret = process.env.SOME_LONG_UNGUESSABLE_STRING;
// when find or findOne() use it decript                                          //userSchema.plugin(encrypt, { secret: secret });

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
