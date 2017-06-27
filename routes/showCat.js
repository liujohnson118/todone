"use strict";

const express = require('express');
const router  = express.Router();

module.exports = (knex) => {

  /*
  * DEPRECATED
  * NOT USED BY SERVER
  * KEPT FOR POTENTIAL FURTURE IMPROVEMENT
  */
  router.get("/", (req, res) => {
    knex('tasks')
    .select('user_id','content')
    .where('category', 'e')
    .andWhere('user_id', 'new')
      .then((results) => {
        res.json(results);
    });
  });

  return router;
}
