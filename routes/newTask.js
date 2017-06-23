"use strict";

const express = require('express');
const router  = express.Router();
let bayesModel=require("../public/scripts/classifier.js").bayesModel;

module.exports = (knex) => {

  router.post("/", (req, res) => {
     if(req.body.task.replace(/ /g,"").length>0){
      let tempTask=req.body.task;
        knex('tasks').insert({category:bayesModel.categorize(tempTask),content:tempTask}).then((result)=>{
          res.redirect("/");
        });
     }else{
      res.status(403).send("Not a valid task");
     }
  });

  return router;
}
