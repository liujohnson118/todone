"use strict";

const express = require('express');
const router  = express.Router();
const bcrypt=require('bcrypt');


module.exports = (knex) => {

  /*
  * Handles POST request for /updateEmail
  * If not logged in, send error message
  * If new email and new email confrimation match, update database with new email and redirect to /
  */
  router.post("/", (req, res) => {
    let currentUser=req.session.username;
    if(!currentUser){
      res.status(403).send('Log in first to access your profile');
    }else{
      if(req.body.newEmail === req.body.newEmailReenter){
        knex('users').where('username',currentUser).update({email:req.body.newEmail}).then((result)=>{
          res.redirect("/");
        })
      }else{
        res.status(403).send("Error reconfirming your email. Try again.")
      }
    }
  });

  return router;
}