
var express=require('express')
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/test1');


//var jwt = require('jsonewbtoken'); // use to create sign , and verify tokens

var bodyParser = require('body-parser')
var morgan = require('morgan');
var crypto=require('crypto');
var app=express()
var Schema=mongoose.Schema;
var db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  console.log('Connection established to','mongodb://localhost/test2');
});

//app.use(morgan('dev'));

//app.set('superSecret', config.secret);
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())
var config = {

    //'secret': 'ilovescotchyscotch',
    //'database': 'mongodb://noder:noderauth&54;proximus.modulusmongo.net:27017/so9pojyN'

};

var userSchema=Schema({
  first_name:{type:String,default:'firstname'},
  last_name:{type:String,default:'lastname'},
  roll_no:{type:String,default:'rollno'},
  email_id:{type:String,default:'emailid'},
  father_name:{type:String,default:'fathername'},
  phone_no:{type:String,default:'phoneno'},
  college_name:{type:String,default:'collegename'},
  hashedPassword:{type:String,default:''},
  salt:{type:String,default:''},
  timestamp:{type:Date,default:Date.now,index:true}
})

var User = mongoose.model('User',userSchema)


app.get('/htmlFirst.html',function(req,res)
{
  res.sendFile(__dirname+'/'+"htmlFirst.html")
})


app.get('/',function(req,res)
{
  res.send(200,{"all":"ok"})
})

app.post('/user',function(req,res)
{
  var first_name=req.body.first_name
  var last_name=req.body.last_name
  var password=req.body.password
  var roll_no=req.body.roll_no
  var email_id=req.body.email_id
  var father_name=req.body.father_name
  var phone_no=req.body.phone_no
  var college_name=req.body.college_name

  var salt = Math.round(new Date().valueOf() * Math.random()) + '';
  var hash = crypto.createHmac('sha256' , salt);
  var hashedPassword= hash.update(password).digest('hex');
  
  console.log("salt",salt)
  console.log("password",password)
  console.log("hash",hashedPassword)


  var newUser=new User({
      first_name:first_name,
    last_name:last_name,
    father_name:father_name,
    roll_no:roll_no,
    email_id:email_id,
    college_name:college_name,
    salt:salt,
    hashedPassword:hashedPassword})

  newUser.save(function(err,data)
  {
    console.log(err,data)
    res.send(200,data)
  })
})

app.get('/users',function(req,res)
{
  User.find({}).limit(20).skip(0).exec(function(err,data)
  {
    res.send(200,data)
  })
})


app.get('/users/:userID',function(req,res)
{
  var id = req.param('userID')

  User.findOne({_id:id}), (function(err,data)
  {
    res.send(200,data)
  })
})

  
app.post('/userUpdate/:userID',function(req,res)
{
  
      User.update({_id:req.params.userID},{$set:{first_name:req.body.first_name}}).exec(function(err,data)
    {
      console.log(data)
      res.send(200,data)

    })
})

app.post('/userFindAndModify/:userID',function(req,res)
{

    User.findOneAndUpdate({_id:req.params.userID},{$set:{last_name:req.body.last_name}}).exec(function(err,data)
    {
      res.send(200,data)
    })

})

app.get('/userRemove/:userID',function(req,res)
{
  User.remove({_id:req.params.userID}).exec(function(err,data)
  {
    res.send(200,data)
    console.log('data removed')
    
  })
})

app.post('/login',function(req,res)
{
   
   var userPassword=req.body.password

   User.findOne({first_name:req.body.first_name}).exec(function(err,data)
   {

    var hash = crypto.createHmac('sha256',data.salt);
    userHash=hash.update(userPassword).digest('hex');

    console.log('userHash',userHash)
    console.log('hashedPassword',data.hashedPassword)

    if(data.hashedPassword==userHash)
       res.send('you are logged in')
     else
      res.send('you r incorrect logged')
  })

})


app.listen(3000)