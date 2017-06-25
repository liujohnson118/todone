
 //var $ = require('jQuery');
$(function(){
  let myEatDelete=String("<form action='/tasks/"+window.latestEatId+"/delete' method='POST'><button>DELETE</button></form>");
  $('.eatTask').each(function(){$(this).append(myEatDelete)});
  let myWatchDelete=String("<form action='/tasks/"+window.latestWatchId+"/delete' method='POST'><button>DELETE</button></form>");
  $('.watchTask').each(function(){$(this).append(myWatchDelete)});
})

