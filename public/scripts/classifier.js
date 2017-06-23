const ENV         = process.env.ENV || "development";
const knexConfig  = require("../../knexfile");
const knex        = require("knex")(knexConfig[ENV]);
const bayes=require("bayes");
let bayesModel=bayes();
knex('taskClasses').select("*").then((result)=>{
  for(var i=0;i<result.length;i++){
    let tempTask=result[i];
    bayesModel.learn(tempTask.task, tempTask.class);
  }
})
exports.bayesModel=bayesModel;