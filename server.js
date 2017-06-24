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
app.use((req, res, next) => {
  res.locals.user=req.session.username;
  //console.log(res.locals.user);
  next();
})

function findLatestTaskByCat(cat, currentUser) {

  var task;
  console.log("Current USER IS "+currentUser);
  return knex('tasks').select('user_id','content').where('category',cat).andWhere('user_id',currentUser)
      .orderBy('id', 'desc')
      .then((result) => {
        task = result[0].content;
        return task;
      })
}

/*
* GET request for root
* If logged in, render the page with the 4 lists
* If not logged in, render the register page
*/
app.get("/", (req, res) => {
  let currentUser=req.session.username;
  if (currentUser) {

    // Promise.all taskes an array of promises, and returns a promise of an array
    Promise.all([
      findLatestTaskByCat('b',currentUser),
      findLatestTaskByCat('e',currentUser),
      findLatestTaskByCat('r',currentUser),
      findLatestTaskByCat('w',currentUser),

      // look up 'destructuring' on MDN
    ]).then(([b, e, r, w]) => {
      return { b, e, r, w };
      // ...
    }).catch((err) => {
      return { b: "bbb",e:"eee", r:"rrr",w:"www"};
    }).then((latestTasks) => {
        res.render('index', {tasks:latestTasks});
    })


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
