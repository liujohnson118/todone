"use strict";

const express = require('express');
const router  = express.Router();

module.exports = (knex) => {

  /*
  * DEPRECATED
  * NOT USED BY SERVER
  * KEPT FOR POTENTIAL FUTURE IMPROVEMENT
  * GET method for seeing all eat tasks
  */
  router.get("/", (req, res) => {
    let currentUser=req.session.username;
    if(currentUser){
      knex
      .select("*")
      .from("tasks")
      .where('user_id',currentUser)
      .andWhere('category','e')
      .then((results) => {
        res.json(results);
    });
    }
  });

  return router;
}
