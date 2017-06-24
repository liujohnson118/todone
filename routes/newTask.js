"use strict";

const express = require('express');
const router  = express.Router();
let bayesModel=require("../public/scripts/classifier.js").bayesModel;

module.exports = (knex) => {
  /*
  * Handles POST request for /new_task form once the user has logged in
  * If new task has nonempty conent, categorize task and then
  * redirect to / and insert new task into tasks table
  */
  router.post("/", (req, res) => {
     if(req.body.task.replace(/ /g,"").length>0){
      let tempTask=req.body.task;
      let currentUser = req.session.username;
        knex('tasks').insert({category:bayesModel.categorize(tempTask),content:tempTask,date: new Date(),user_id:currentUser}).then((result)=>{
          res.redirect("/");
        });
     }else{
      res.status(403).send("Not a valid task");
     }
  });

  return router;
}
