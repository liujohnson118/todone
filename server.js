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
const allEatsRoutes=require("./routes/allEatsRoutes");
const updateEmailRoutes=require("./routes/updateEmail");
const updatePWRoutes=require("./routes/updatePW");


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

//Style settings
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
app.use("/user_registration",userRegistrationRoutes(knex));
app.use("/user_login",userLoginRoutes(knex));
app.use("/updateEmail",updateEmailRoutes(knex));
app.use("/updatePW",updatePWRoutes(knex));
app.use("/new_task",newTaskRoutes(knex));
app.use((req, res, next) => {
  res.locals.user=req.session.username;
  next();
})

/*
* Function to find latest task by a category for a user
* Use only when current user is logged in
* Input: cat-category ("r","b","w","e") currentUser:username of current user
* Output: an array of tasks from tasks table for the user. If no tasks, return empty array
*/
  function findLatestTaskByCat(cat, currentUser) {
    var task;
    console.log("Current USER IS "+currentUser);
    return knex('tasks').select('*').where('category',cat).andWhere('user_id',currentUser)
      .orderBy('id', 'desc')
      .then((result) => {
        if(result.length > 0){
        return result;
      }else{
        return [];
      }
      })
  }

  /*
  * Find all tasks by a category for current user
  * Use only when current user is logged in
  * Input: cat-category ("r","b","w","e") currentUser:username of current user
  * Output: an array of tasks from tasks table for the user. If no tasks, return empty array
  */
  function findAllTasksByCat(cat, currentUser) {
    var tasks;
    return knex('tasks').select('*').where('category',cat).andWhere('user_id',currentUser)
      .then((result) => {
        if(result.length > 0){
        tasks = result[0];
        console.log([tasks]);
        return [tasks];
      } else {
        return [];
      }
    })
  }

  /*
  * Function to find all info about a user
  * Input: username of current user
  * Output: username, email, and password for the user
  */
  function findAllUserInfo(currentUser) {
    var userInfo;
    return knex('users').select('*').where('username', currentUser).limit(1)
    .then((result) => {
      if(result.length > 0){
        return result[0];
      }else{
        return [];
      }
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
      findAllTasksByCat('b', currentUser),
      findAllTasksByCat('e', currentUser),
      findAllTasksByCat('r', currentUser),
      findAllTasksByCat('w', currentUser),
      // look up 'destructuring' on MDN
    ]).then(([b, e, r, w, bb, ee, rr, ww]) => {
      return { b, e, r, w, bb, ee, rr, ww };
    }).catch((err) => {
      res.status(500).send("Something went wrong");
    }).then((results) => {
      res.render('index2', {
        latest: {b: results.b, e: results.e, r: results.r, w: results.w},
        allTasks: {b: results.bb, e: results.ee, r: results.rr, w: results.ww},
      });
    })
  } else {
    res.render("register");
  }
});

/*
* GET method for rendering registration/login page
*/
app.get("/register",(req,res)=>{
  res.render("register");
});

/*
* GET method for rendering login page
*/
app.get("/login",(req,res)=>{
  res.render("register.ejs");
});

/*
* POST method for logout
* Reset session at logout
*/
app.post("/logout",(req,res)=>{
  req.session=null;
  res.redirect("/");
})

/*
* DEPRECATED AND NOT USED, KEPT FOR POTENTIAL FUTURE IMPROVEMENT
* POST route for deleting a task by ID
* If not logged in, send error message
* If logged in, delete task from database and redirect to /
*/
app.post("/tasks/:id/delete",(req,res)=>{
    if(req.session.username){
      let taskID=req.params.id;
      knex('tasks').where('id',taskID).del().then((result)=>{
        res.redirect("/");
      });
    }else{
      res.status(403).send('Cannot delete unless you sign in');
  }
})

/*
* POST method to remove a task by task ID
* Send error message if not logged in
* Delete task from database and redirect to /
*/
app.post("/removeTask",(req,res)=>{
  if(req.session.username){
    let taskID=req.body.taskID;
    knex('tasks').where('id',taskID).del().then((result)=>{
      res.redirect("/");
    })
  }else{
   res.status(403).send('Cannot delete unless you sign in');
  }
})

/*
* POST method for reclassification of task
* If user enters a task id not associated with a task, send error message
* Check input for new class. If it is not one of b e r w, send error message - Will become
* redundant once drop down menu is implemented
*/
app.post("/reclassifyTask",(req,res)=>{
  if(req.session.username){
    let taskID=req.body.taskID;
    let newClass=req.body.taskNewClass;
    if(["b","e","r","w"].indexOf(newClass)===-1){
      res.status(403).send("The class you entered is invalid");
    }
    knex('tasks').where('id',taskID).limit(1).then((data)=>{
      if(data.length>0){
        bayesModel.learn(data[0].content,newClass);
        knex('tasks').where('id',taskID).update({category:newClass}).then((result)=>{
          res.redirect("/");
        })
      }else{
        res.status(403).send("The task ID you entered does not exist");
      }
    })
  }else{
   res.status(403).send('Cannot delete unless you sign in');
  }
})


/*
* POST method for letting user see and modify their profile
* contains functions to update email and password
*/
app.get("/profile", (req,res) => {
  let currentUser = req.session.username;
  if (currentUser) {
  Promise.all([
    findAllUserInfo(currentUser),
  ]).then(([currentUser]) => {
    return {'username': currentUser.username, 'email': currentUser.email, 'password': currentUser.password};
  }).catch((err) => {
    res.status(500).send("Something went wrong")
  }).then((results) => {
    res.render('profile', {
       userInfo : {username: results.username, email: results.email, password: results.password},
    });
  })
  } else {
    res.render("register");
  }
})

/*
* Set up port
*/
app.listen(PORT, () => {
  console.log("Example app listening on port " + PORT);
});