"use strict";

const express = require('express');
const router  = express.Router();
const salt=10;
const bcrypt      = require('bcrypt');
let bayesModel=require("../public/scripts/classifier.js").bayesModel;

module.exports = (knex) => {

  /*
  * Handles POST request for /user_login form
  * If username entered exisits in data base and password check is correct, redirect to root
  * If no username exists in database, send error message
  * If password is wrong, send error message
  */
  router.post("/", (req, res) => {
      knex.select("password").from('users').where('username', req.body.username).limit(1).then((data) => {
        if(data.length<1){
          res.status(403).send('user does not exist');
        }else{
          let userHash=data[0].password;
          bcrypt.compare(req.body.password,userHash,function(error, result){
            console.log('Result is '+result);
            if(result){
              console.log("Password correct");
              req.session.username=req.body.username;
              res.redirect("/");
            }else{
              res.status(403).send('Wrong password');
            }
          })
        }
      })
  });

  return router;
}


