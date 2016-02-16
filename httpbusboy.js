
var fs = require('fs');    
var Busboy = require('busboy');

var express = require('express')
var app = express();


app.get('/',function(req,res){


  res.writeHead(200, { Connection: 'close' });
    res.end('<html><head></head><body>\
               <form method="POST" enctype="multipart/form-data">\
                <input type,="text" name="textfield"><br />\
                <input type="file" name="filefield"><br />\
                <input type="submit">\
              </form>\
            </body></html>');

})


app.post('/',function(req,res){

  var busboy = new Busboy({ headers: req.headers });
    busboy.on('file', function(fieldname, file, filename, encoding, mimetype) {

      var fstream = fs.createWriteStream('./public/image/' + filename); 
        file.pipe(fstream)
      
      console.log('File [' + fieldname + ']: filename: ' + filename + ', encoding: ' + encoding + ', mimetype: ' + mimetype);
      
      file.on('data', function(data) {
        console.log('File [' + fieldname + '] got ' + data.length + ' bytes');
        
      });

      file.on('end', function() {
        console.log('File [' + fieldname + '] Finished');
        
      });
    });
  
    busboy.on('finish', function() {
      console.log('Done parsing form!');
      res.writeHead(303, { Connection: 'close', Location: '/' });
      res.end();
    });
    req.pipe(busboy);

})

app.listen(8000)
