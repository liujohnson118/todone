"use strict";

const express = require('express');
const router  = express.Router();

module.exports = (knex) => {
  /*
  * Handles GET request for /api/taskClasses
  * Show in json format the table for training set for Naive Bayes algorithm
  */
  router.get("/", (req, res) => {
    knex
      .select("*")
      .from("taskClasses")
      .then((results) => {
        res.json(results);
    });
  });

  return router;
}