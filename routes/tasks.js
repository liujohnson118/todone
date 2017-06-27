"use strict";

const express = require('express');
const router  = express.Router();

module.exports = (knex) => {

  /*
  * Handles GET request for /api/tasks
  * Show in json format all tasks
   /*
  * DEPRECATED
  * NOT USED BY SERVER
  * KEPT FOR POTENTIAL FURTURE IMPROVEMENT
  */
  router.get("/", (req, res) => {
    knex
      .select("*")
      .from("tasks")
      .then((results) => {
        res.json(results);
    });
  });

  return router;
}
