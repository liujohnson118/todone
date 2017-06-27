"use strict";

const express = require('express');
const router  = express.Router();

module.exports = (knex) => {
  /*
  * DEPRECATED
  * NOT USED BY SERVER
  * KEPT FOR POTENTIAL FUTURE IMPROVEMENT
  * Handles POST request for /new_task form once the user has logged in
  * If new task has nonempty conent, categorize task and then
  * redirect to / and insert new task into tasks table
  */
  router.post("/", (req, res) => {
     console.log("UUUUUU"+req);
     res.redirect("/")
  });

  return router;
}
