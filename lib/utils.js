exports.getTimeOFDay = function(oldDate) {
  return oldDate.getHours();
}

exports.getDayInWeek = function(oldDate) {
  var utcDate = getDateInUTCFormat(oldDate);
  return utcDate.getDay();
}

function getDateInUTCFormat(existDate) {
  return new Date(Date.UTC(existDate.getFullYear(),existDate.getMonth(),existDate.getDate()));
}

exports.sanitizeNumber = function(str){
  var reg = /[^\d]/g;
  return str.replace(reg, '');
}

exports.convertTime = function(time) {
	var duration = (time > 11) ? 'PM' :'AM';
	time = +time%12 || 12;
    return (time +' '+duration);
}

exports.getChunkedArrays = function(array,size) {
  var arrays = [];
  while(array.length>0) {
    arrays.push(array.splice(0,size));
  }
  return arrays;
}

exports.statusCode = {
  found: 200,
  bad_request: 400,
  not_found: 404
}

