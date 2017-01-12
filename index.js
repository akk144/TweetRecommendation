var express = require('express');
var passport = require('passport');
var app = express();

require('./routes/index')(app);

app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(function errorHandler(err, req, res, next) {
  console.error('errOnReq: on request  %s %s: %j', req.method, req.url, err.stack);
  if(err.status === 400) {
    return res.send(400).json({err: err})
  }
  res.status(500).json({err: err});
});

app.listen(3000, function () {
  console.log('Server started on port: %s', 3000);
});
