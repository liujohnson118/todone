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
const catRoutes = require("./routes/showCat");
const classesRoutes = require("./routes/classes");
const userRegistrationRoutes=require("./routes/userRegistration");
const userLoginRoutes=require("./routes/user_login");
const newTaskRoutes=require("./routes/newTask");
const allEatsRoutes=require("./routes/allEatsRoutes");



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
app.use("/api/showCat", catRoutes(knex));
app.use("/user_registration",userRegistrationRoutes(knex));
app.use("/user_login",userLoginRoutes(knex));
app.use("/new_task",newTaskRoutes(knex));
app.use((req, res, next) => {
  res.locals.user=req.session.username;
  next();
})
app.use("/allEats",allEatsRoutes(knex));
//findLatestTaskByCat retrieves the most recent tasks for each category
//That are unique to that user
function findLatestTaskByCat(cat, currentUser) {
  var task;
  console.log("Current USER IS "+currentUser);
  return knex('tasks').select('*').where('category',cat).andWhere('user_id',currentUser)
    .orderBy('id', 'desc')
    .then((result) => {
      if(result.length > 0){
      return result;
    }else{
      return undefined;
    }
    })
}
//findAllTasksByCat retrieves all tasks for each category
//That are unique to that user
function findAllTasksByCat(cat, currentUser) {
  var tasks;
  return knex('tasks').select('*').where('category',cat).andWhere('user_id',currentUser)
    .then((result) => {
      if(result.length > 0){
      tasks = result.map(row => row.content);
      return tasks;
    } else {
      return undefined;
    }
  })
}

function findAllUserInfo(currentUser) {
  var userInfo;
  return knex('users').select('*').where('username', currentUser).limit(1)
  .then((result) => {
    if(result.length > 0){
      return result[0];
    }else{
      return undefined;
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

//User registration page
app.get("/register",(req,res)=>{
  res.render("register");
});

//User login page
//If username exists redirects to
app.get("/login",(req,res)=>{
  res.render("register.ejs");
});

app.post("/logout",(req,res)=>{
  req.session=null;
  res.redirect("/");
})

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

app.post("/reclassifyTask",(req,res)=>{
  if(req.session.username){
    let taskID=req.body.taskID;
    let newClass=req.body.taskNewClass
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
app.listen(PORT, () => {
  console.log("Example app listening on port " + PORT);
});