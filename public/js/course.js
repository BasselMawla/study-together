$(document).ready(function(){
  $(".div-question").click(function(){
    //console.log($(this).children());
    //console.log($(this).find('button:first'));
    $(this).find("button")[0].click();
  });
});