function sleep(milliseconds) {
  var start = new Date().getTime();
  while ((new Date().getTime() - start) < milliseconds) {
    if ((new Date().getTime() - start) > milliseconds) {
	  
      break;
    }
  }
}

$(function () {

	//which.decide

	//sleep(50);
	
});