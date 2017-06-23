"use strict";

const express = require('express');
const router  = express.Router();
const salt=10;
const bcrypt      = require('bcrypt');
let bayesModel=require("../public/scripts/classifier.js").bayesModel;

module.exports = (knex) => {

  router.post("/", (req, res) => {
      knex.select("password").from('users').where('username', req.body.username).limit(1).then((data) => {
        if(data.length<1){
          res.status(403).send('user does not exist');
        }else{
          let userHash=data[0].password;
          console.log("User typed: "+req.body.password+" as password for login");
          console.log("Hashed password from database for this user is: "+userHash);
          bcrypt.compare(req.body.password,userHash,function(error, result){
            console.log('Result is '+result);
            if(result){
              knex('taskClasses').select("*").then((learningTasks)=>{
                for(var i=0;i<learningTasks.length;i++){
                  let tempTask=learningTasks[i];
                  bayesModel.learn(tempTask.task,tempTask.class);
                }
              })
              req.session.username=req.body.username;
              res.redirect('/');
            }else{
              res.status(403).send('Wrong password');
            }
          })
        }
      })
  });

  return router;
}


