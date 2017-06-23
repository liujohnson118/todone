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
          bcrypt.compare(req.body.password,userHash,function(error, result){
            console.log('Result is '+result);
            if(result){
              console.log("Password correct");
            }else{
              res.status(403).send('Wrong password');
            }
          })
        }
      })
  });

  return router;
}


