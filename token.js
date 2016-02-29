var express=require('express'),
 mongoose = require('mongoose'),
 bodyParser = require('body-parser'),
 crypto = require('crypto')
var morgan = require('morgan');

var jwt    = require('jsonwebtoken'); 
var config = require('./config');

var Schema=mongoose.Schema;
var db = mongoose.connection;
var app=express();

app.set('superSecret', config.secret);
app.set('view engine','ejs');

mongoose.connect('mongodb://localhost/test10');

db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {

	console.log('Connection established to','mongodb://localhost/test10');
     
});

//use morgan to log requests to the console
app.use(morgan('dev'));
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));

// parse application/json
app.use(bodyParser.json())

var userSchema=Schema({
	first_name:{type:String,default:''},
	last_name:{type:String,default:''},
	hashedPassword:{type:String,default:''},
	admin:{type:Boolean,default:''},
    salt:{type:String,default:''},
	roll_no:{type:String,default:''},
	email_id:{type:String,default:''},
	college_name:{type:String,default:''},
	title:{type:Array,default:[]},
	postBody:{type:Array,default:[]},
    question:{type:String,default:'What is your nick name?'},
    answer:{type:String,default:''},	
	timestamp:{type:Date,default:Date.now,index:true}
});


var User = mongoose.model('User',userSchema);

app.use(express.static(__dirname + '/public'));
app.use(express.static(__dirname + '/styles'));

app.get('/htmlfirst.html',function(req,res)
{
  res.sendFile(__dirname+('/htmlfirst.html'));
})
app.get('/forgetPassword.html',function(req,res)
{
  res.sendFile(__dirname+('/forgetPassword.html'));
})


app.locals.pagetitle='Students page';


//routes
//app.get('/',routes.index);
//app.get('/about',routes.about);


//user sign up
app.post('/user',function(req,res)
{

	var first_name=req.body.first_name
	var last_name=req.body.last_name
	var password=req.body.password
	var roll_no=req.body.roll_no
	var email_id=req.body.email_id
	var college_name=req.body.college_name
	var answer=req.body.answer

    var salt = Math.round(new Date().valueOf() * Math.random()) + '';
    var hash = crypto.createHmac('sha256', salt);
    var hashedPassword= hash.update(password).digest('hex');

    console.log('answer',answer)


    
	var newUser=new User({
		first_name:first_name,
		last_name:last_name,
		roll_no:roll_no,
		email_id:email_id,
		college_name:college_name,
		salt:salt,
		hashedPassword:hashedPassword,
		answer:answer,
		admin:true
	});

	newUser.save(function(err,data)
	{
		console.log(err,data)
		res.json({ success: true });
	})
})

//login and token creation
app.post('/login',function(req,res)
{
	
	var userPassword=req.body.password;
   
    User.findOne({first_name:req.body.first_name}).exec(function(err,data)	
    {
 
    if (err) throw err;

    if (!data) {
    	res.render('not_found',{  error: ":X",description:"We Can't find the Person you are looking for."});
     }  
    else if (data) {
       console.log("login",data._id); 

       var id=data.id;  
       var hash = crypto.createHmac('sha256', data.salt);
       userHash= hash.update(userPassword).digest('hex');

          console.log("salt",data.salt);
	      console.log("first_name",data.first_name);
	      console.log("last_name",data.last_name);
	      console.log("roll_no",data.roll_no);
	      console.log("userHash",userHash);
     
      if (data.hashedPassword != userHash) {
      	res.render('not_found',{  error: "Lost",description:"Authentication failed. Wrong password."});
        
      }

      else {

        var token = jwt.sign(data, app.get('superSecret'), {
          expiresInMinutes: 1440 // expires in 24 hours
        });

       res.render('post',{
          token: token,
          id: id,
          title:data.title,
          postBody:data.postBody
        });

      } 
    }

   }) 
}) 

//password-reset
app.post('/passwordReset',function(req,res)
{
  console.log('name',req.body.first_name)

  User.findOne({first_name:req.body.first_name}).exec(function(err,data)
  {
    var answer=req.body.answer;
    console.log('answer',answer);
    console.log('data',data);
    var id=data.id;


    if(!data)
    {
      res.render('not_found',{  error: "403",description:"Can't find the person you are looking for!"});
    }
    else(data)
    {
      if (data.answer!=answer) 
      {
        res.render('not_found',{  error: "Wrong",description:"Authentication failed. Wrong answer."});        
      }

      else {

        var token = jwt.sign(data, app.get('superSecret'), {
          expiresInMinutes: 10 // expires in 24 hours
        });

        res.render('tokenPage',{
          token: token,
          id: id
          
        });

      }
    }    
  })
})  

//displsy token
app.post('/tokenSend',function(req,res)
{
  var token=req.body.token;
  var id=req.body.id1;
  res.render('passwordReset',{
          token: token,
          id:id

        });

})


//post comment
app.post('/post-delete',function(req,res)
{
  var postBody=req.body.postValue;
  var title=req.body.titleValue;
  console.log(req.body.postBody);
  console.log(req.body.titleValue);
 	User.findOneAndUpdate({_id:req.body.id1}, {$pull:{title:title ,postBody:postBody}}).exec(function(err,data)
	{
    console.log(data.title);
    console.log(data._id);

		res.render('post',{ 
          id: data.id,           
            title:data.title,
            postBody:data.postBody
           });
	})  
})
		
//user post and update

app.post('/post-comment' , function(req,res)
{

 User.findOneAndUpdate({
		_id:req.body.id1
},	
{
	$push:
		{	title:req.body.title,
         		postBody:req.body.postBody
         	}
    }).exec(function(err,data)
    {
    	if(err){
     		console.log("error",err);
    	}

   		res.render('post',{ 
   		    id: data.id,           
            title:data.title,
            postBody:data.postBody
           });

    	});
       console.log('data pushed');     
})   


//get all users
app.get('/users',function(req,res)
{
	User.find({}).limit(20).skip(0).exec(function(err,data)
	{
		res.send(200,data)
	})
})

//token authentication
app.use(function(req, res, next) {

  
  var token = req.body.token || req.query.token || req.headers['x-access-token'] || req.params.token;

  
  if (token) {

    console.log(token);

    jwt.verify(token, app.get('superSecret'), function(err, decoded) 
    {      
      if (err) 
      {
      	console.log(err);
        return res.render('not_found',{error: "403",description:"Token Mismatched"});    
      } 
      else 
      {
     
        req.decoded = decoded;    
        next();
      }
    });

  } else {

    return res.render('not_found',{  error: "403",description:"No token provided."});   
  }
}); 



//get one user
app.get('/users/:userID',function(req,res)
{
	var id = req.param('userID')
	User.findOne({_id:id}).exec(function(err,data)
	{
		res.json(200,data)
	})
})

//udate user name
app.put('/userUpdate/:id',function(req,res)
{
	  
	    User.update({_id:req.params.id},{$set:{first_name:req.body.first_name}}).exec(function(err,data)
		{
			console.log(data)
			res.json(200,data)

		})
})

//find and modify
app.post('/userFindAndModify/:id',function(req,res)
{
    
    User.findOneAndUpdate({_id:req.params.id}, {$set:{last_name:req.body.last_name}}).exec(function(err,data)
    {
    	res.json(200,data)
    })

})

//remove user
app.get('/userRemove/:id',function(req,res)
{
var id=req.param('id');
  console.log('id',id)
  User.remove({_id:id}).exec(function(err,data)
  {
    console.log("id",data.id)
    res.json(200,data)
    console.log('data removed')
    
  })
})

//password update
app.post('/updatePassword', function(req,res)
{
    var password=req.body.password;
    console.log('password',password)

    var salt = Math.round(new Date().valueOf() * Math.random()) + '';
    var hash = crypto.createHmac('sha256', salt);
    var hashedPassword= hash.update(password).digest('hex');

    
    console.log('salt',salt)
    console.log('hash',hash)
    console.log('hashedPassword',hashedPassword)

  User.findOneAndUpdate({_id:req.body.id1},{$set:{salt:salt,hashedPassword:hashedPassword}}).exec(function(err,data)
  {
    console.log('password changed')
    res.redirect('http://127.0.0.1:3000/htmlfirst.html')
  })
})

 


app.listen(3000)
