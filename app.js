//jshint esversion:6
require('dotenv').config()
//console.log(process.env)
const express = require("express");
const ejs = require("ejs");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
// const encrypt = require("mongoose-encryption")
// const md5 = require("md5");
// const bcrypt = require("bcrypt"); //salting
// const saltRounds = 10;  //no. of rounds
const session = require("express-session");  // here order is important
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose"); //we dont have to require the passport-local, its one of the dependices for passport-local-mongoose
const GoogleStrategy = require('passport-google-oauth20').Strategy;  //requiring google strategy
const findOrCreate = require('mongoose-findorcreate');  //it will find in the database or if not there then create new ans save into database
const app = express();

app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));
app.set("view engine", "ejs");

//order is important here till passport.session
app.use(session({  //initializing the session and setting some defaults , saves the user  login session
   secret:process.env.SESSION_KEY,
   resave:false,
   saveUninitialized:false
}));

app.use(passport.initialize()); //initializing passport
app.use(passport.session());  //basically we are saying that passport to manage all the session
//
mongoose.connect("mongodb://0.0.0.0:27017/userDB",{useNewUrlParser:true});
//mongoose.set("useCreateIndex",true);//error coming needed not necessary

const userSchema = new mongoose.Schema({  //authentication -- this sehema is no longer javascript obj but a mongoose sehema obj , created from mongoose class what we require
  email:String,                          // for more info- https://www.npmjs.com/package/mongoose-encryption
  password:String,
  googleId:String,
  secret:String
});

//adding passportLocalMongoose as a plugin into our Schema
userSchema.plugin(passportLocalMongoose); //use for hash and salt our passwords and save our users data into our dataBase.
userSchema.plugin(findOrCreate); //- google strategy ke liye, adding into schema

const User = mongoose.model("User",userSchema); //model- collection

passport.use(User.createStrategy()); //this method comes from passportLocalMongoose and down those two se/de   //The createStrategy is responsible to setup passport-local LocalStrategy with the correct options.

// passport.serializeUser(User.serializeUser()); //it creates a cookies and stuff the user identification into the cookies
// passport.deserializeUser(User.deserializeUser()); // it allows passport to crumble the cookeis and find all of the user identification so to authenticate them on our server


passport.serializeUser(function(user, cb) {  // works for all not just local
  process.nextTick(function() {
    return cb(null, {
      id: user.id,
      username: user.username,
      picture: user.picture
    });
  });
});

passport.deserializeUser(function(user, cb) {
  process.nextTick(function() {
    return cb(null, user);
  });
});

passport.use(new GoogleStrategy({
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    callbackURL: "http://localhost:3000/auth/google/secretss",
    userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo"  //taking data from google id,username etc
  },
  function(accessToken, refreshToken, profile, cb) {
    console.log(cb);
    User.findOrCreate({username: profile.emails[0].value, googleId: profile.id }, function (err, user) { //find inthe database then send get request or create new user inthe database with google provided id then make a get request
      return cb(err, user);
    });
  }
));



app.get("/",function(req,res){
  res.render("home");
});

app.get('/auth/google',  //something like redirest to google
  passport.authenticate('google', { scope: ["profile","email"] }) // show popup to sign up with google and , scope: profile we are asking from google
);  //onces is successful google will redirect to /auth/google/secretss , down

app.get('/auth/google/secretss',  // this get request is send by google and then we can authenticate locally
  passport.authenticate('google', { failureRedirect: '/login' }),
  function(req, res) {
    // Successful authentication, redirect secrets.
    res.redirect('/secrets');
  });

app.get("/register", function(req,res){
  res.render("register");
});

app.get("/login", function(req,res){
  res.render("login");
});

app.get("/secrets",(req,res)=>{
  User.find({"secret":{$ne: null}}, function(err,foundUsers){
    if(err){
      console.log(err);
    }else{
      if(foundUsers){
        res.render("secrets", {userWithSecrets:foundUsers});
      }
    }
  });
});

app.get("/submit",function(req,res){
  if(req.isAuthenticated()){ //from passportLocalMongoose  For any request you can check if a user is authenticated or not using this method.
    res.render("submit");
  }else{
    res.render("login");
  }
});

app.post("/submit",function(req,res){
  const submittedpost=req.body.secret;
     console.log(req.user); //currently login kare so obj print hota
     User.findById(req.user.id, function(err,foundUser){
       if(err){
         console.log(err);
       }else{
         if(foundUser){
           foundUser.secret=submittedpost;
           foundUser.save(function(){
             res.redirect("/secrets");
           });
         }
       }
     });
});



app.get("/logout", (req,res)=>{
  req.logout((err)=>{  //from passportLocalMongoose   Invoking logout() will remove the req.user property and clear the login session (if any).
    if(err)
    console.log(err);
    else
    res.redirect("/");
  });
});


//level 5 authentication cookies and session
app.post("/register",(req,res)=>{
//User-is our model
// register is the method from passwordlocalmongoose - handles the create new user and avoid the creating existing users
//{username}, password callback
User.register({username:req.body.username}, req.body.password, function(err,user){  //this method comes from passportLocalMongoose
  if(err){
    console.log(err);
    res.redirect('/register'); // previously we are writing res,render in other previous levels  ,now res.redirect because we are authenticating ...
  }else{
    passport.authenticate("local")(req,res, function(){  //this method comes from passport - successfully setup a cookies and save the current logged session
      res.redirect("/secrets") //we are authenticating and setting up a session , so if the user go directly to the secret page they can view it if they are still login
    });
  }
});

});
//level 5 authentication cookies and session
app.post("/login",function(req,res){
  const user = new User({
    username:req.body.username,
    password:req.body.password
  });

   req.login(user, (err)=>{ //this method comes from passport, creates a session
     if(err){
       console.log(err);
     }else{
       passport.authenticate("local")(req,res, function(){  //this method comes from passport - successfully setup a cookies and save the current logged session
         res.redirect("/secrets") //we are authenticating and setting up a session , so if the user go directly to the secret page they can view it if they are still login
       });
     }
   });

});








app.listen(3000,function(){
  console.log("working");
})
