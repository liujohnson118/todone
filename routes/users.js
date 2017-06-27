"use strict";

const express = require('express');
const router  = express.Router();

module.exports = (knex) => {

  /*
  * DEPRECATED
  * NOT USED BY SERVER
  * May be used for duggging users table in database
  */
  router.get("/", (req, res) => {
    knex
      .select("*")
      .from("users")
      .then((results) => {
        res.json(results);
    });
  });

  return router;
}
