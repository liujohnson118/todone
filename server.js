"use strict";

require('dotenv').config();

const PORT        = process.env.PORT || 8080;
const ENV         = process.env.ENV || "development";
const express     = require("express");
const bodyParser  = require("body-parser");
const sass        = require("node-sass-middleware");
const app         = express();

const knexConfig  = require("./knexfile");
const knex        = require("knex")(knexConfig[ENV]);
const morgan      = require('morgan');
const knexLogger  = require('knex-logger');
const bcrypt      = require('bcrypt');
const cookieSession = require("cookie-session");
let bayesModel=require("./public/scripts/classifier.js").bayesModel;

const salt=10;

// Seperated Routes for each Resource
const usersRoutes = require("./routes/users");
const tasksRoutes = require("./routes/tasks");
const classesRoutes = require("./routes/classes");
const userRegistrationRoutes=require("./routes/userRegistration");
const userLoginRoutes=require("./routes/user_login");
const newTaskRoutes=require("./routes/newTask");



// Load the logger first so all (static) HTTP requests are logged to STDOUT
// 'dev' = Concise output colored by response status for development use.
//         The :status token will be colored red for server error codes, yellow for client error codes, cyan for redirection codes, and uncolored for all other codes.
app.use(morgan('dev'));


//Set up secret key for cookie session
app.use(cookieSession({
    secret: 'Vancouver downtown',
}))

// Log knex SQL queries to STDOUT as well
app.use(knexLogger(knex));

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use("/styles", sass({
  src: __dirname + "/styles",
  dest: __dirname + "/public/styles",
  debug: true,
  outputStyle: 'expanded'
}));
app.use(express.static("public"));

// Mount all resource routes
app.use("/api/users", usersRoutes(knex));
app.use("/api/tasks", tasksRoutes(knex));
app.use("/api/classes", classesRoutes(knex));
app.use("/user_registration",userRegistrationRoutes(knex));
app.use("/user_login",userLoginRoutes(knex));
app.use("/new_task",newTaskRoutes(knex));

function findLatestTaskByCat(cat) {
  return new Promise((resolve, reject) => {
   var task;
    knex('tasks').select('content').where('category', cat)
    .orderBy('id', 'desc')
    .then((result) => {
      task = result[0].content;
         resolve(task);
    })
  })
}

/*
* GET request for root
* If logged in, render the page with the 4 lists
* If not logged in, render the register page
*/
app.get("/", (req, res) => {
  var latestTasks={};
  if (req.session.username) {
    findLatestTaskByCat('b').then((task)=>{
      latestTasks['b']=task;
      findLatestTaskByCat('e').then((task)=>{
        latestTasks['e']=task;
        findLatestTaskByCat('r').then((task)=>{
          latestTasks['r']=task;
          findLatestTaskByCat('w').then((task)=>{
            latestTasks['w']=task;
            res.render("index",latestTasks);
          });
        });
      });
    });
    //res.render("index");
  } else {
    res.render("register");
  }
});

//User registration page
app.get("/register",(req,res)=>{
  res.render("register");
});

//User login page
//If username exists redirects to
app.get("/login",(req,res)=>{
  res.render("register.ejs");
});



/*
* POST request for adding a new task
* If logged in, add task to tasks table in database midterm
* If not logged in, send error to remind user to login first
*/
app.post("/new_task",(req,res)=>{
  if(req.session.username){
    knex.select('id').from('users').where('username',req.session.username).then((result)=>{
      let tempClass=bayesModel.categorize(req.body.task);
      knex('tasks').insert({category:tempClass,content:req.body.task,date:new Date(),users_id:result[0].id}).then((result)=>{
        console.log("The task "+req.body.task+" is classified as "+bayesModel.categorize(req.body.task));
        res.redirect("/");
      });
    })
  }else{
    res.status(403).send("Please login first before you can add a task");
  }
})

app.post("/logout",(req,res)=>{
  req.session=null;
  res.redirect("/");
})

app.listen(PORT, () => {
  console.log("Example app listening on port " + PORT);
});
