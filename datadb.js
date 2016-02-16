var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/test');

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {

	console.log('Connection established to','mongodb://localhost/test');
});

var employeeSchema = mongoose.Schema({
    name: String,
    EmailID:String,
    TelNo:Number,
});

employeeSchema.methods.speak = function () {
  var greeting = this.name
    ? "Person name is " + this.name
    : "I don't have a name";
  console.log(greeting);
}

var employee = mongoose.model('employee', employeeSchema);

var nizamuddin = new employee({ name: 'nizamuddin', EmailID:'nizam200@hotmail.com', TelNo:'123456789'  });
console.log(nizamuddin.name);

var shanky = new employee({ name: 'shanky' ,EmailID:'shanky@emp.com',TelNo:'987654321'});

shanky.save(function(err,data){
	console.log(data) //data._id

	employee.update({_id:data._id},{name:"nizamuddin khan"},function(err,data_new)
	{
		console.log(data_new)
	})
});


employee.find(function (err, employees) {
  if (err) return console.error(err);
  console.log(employees);
})

employee.find({ name: 'nizamuddin' }, function(err,data){
	console.log(data._id)
});