"use strict";

const express = require('express');
const router  = express.Router();
const bcrypt=require('bcrypt');
const salt=10;

module.exports = (knex) => {

  /*
  * Handles POST request for /updatePW
  * If not logged in, send error message
  * If old password entered is wrong, send error message
  * If old password is correct and new password and new password confirmation match, update database
  * and redirect to /
  */
  router.post("/", (req, res) => {
    let currentUser=req.session.username;
    if(!currentUser){
      res.status(403).send('Log in first to access your profile');
    }else{
      knex.select("password").from('users').where('username', currentUser).limit(1).then((data) => {
        if(data.length<1){
          res.status(403).send('user does not exist');
        }else{
          let userHash=data[0].password;
          if(req.body.newPW === req.body.newPWReenter){
            bcrypt.compare(req.body.oldPW,userHash,function(error, result){
            if(result){
              bcrypt.hash(req.body.newPW,salt, function(err,hash){
                if(err){
                  res.status(403).send("Error changing password, contact administrator");
                }
                knex('users').where('username',currentUser).update({password:hash}).then((out)=>{
                  res.redirect('/');
                })
              })
            }else{
              res.status(403).send('Old password wrong');
            }
          })
          }else{
            res.status(403).send("password confirmation failed")
          }
        }
      })
    }
  });

  return router;
}