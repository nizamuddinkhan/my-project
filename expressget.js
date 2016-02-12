var express = require('express');
var app = express();

app.get('/', function (req, res) {
   res.send('gud morning world');
});
app.listen(3000, function () {
console.log('example at listening on  port  3000!');
});

