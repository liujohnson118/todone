"use strict";

const express = require('express');
const router  = express.Router();

module.exports = (knex) => {

  /*
  * Handles GET request for /api/tasks
  * Show in json format all tasks
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
