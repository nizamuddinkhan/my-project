var express=require('express')
var app=express()

app.use(express.static('public'));

app.get('/htmlFirst.html', function(req,res)
{
  res.sendFile(__dirname+'/'+"htmlFirst.html")
})

app.get('/htmlsecond.html', function(req,res)
{
	res.sendFile(__dirname+"/"+"htmlsecond.html")
})

app.get('/htmlfileUpload.html',function(req,res)
{
	res.sendFile(__dirname+"/"+"htmlfileUpload.html")
})

app.get('/home', function (req, res) {
   console.log("GET request");
   response={
    first_name:req.query.first_name,
    last_name:req.query.last_name
   };
   console.log(response);
   res.send('Hello Get');
   
})

app.put('/',function(req,res)
{
	res.send('PUT Resquest');
});

app.post('/home',function(req,res)
{
	res.send("POST request")
})

app.delete('/del_user', function (req, res) {
   console.log("DELETE request");
   res.send('Hello Delete');
})
app.listen(3000,function()
{
	console.log("it just started at 3000")
})