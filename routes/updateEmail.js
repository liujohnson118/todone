"use strict";

const express = require('express');
const router  = express.Router();
const bcrypt=require('bcrypt');


module.exports = (knex) => {

  /*
  * Handles POST request for /user_registration form
  * If user enters a username or email already in our database, send error message

  */
  router.post("/", (req, res) => {
    let currentUser=req.session.username;
    if(!currentUser){
      res.status(403).send('Log in first to access your profile');
    }else{
      if(req.body.newEmail === req.body.newEmailReenter){
        console.log("FUFFUIJ");
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