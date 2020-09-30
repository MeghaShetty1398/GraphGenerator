var mysql = require('mysql');
var express = require('express');
var session = require('express-session');
var bodyParser = require('body-parser');
var path = require('path');
var nodemailer = require('nodemailer');
//var async = require('async');
var crypto = require('crypto');
const { fileLoader } = require('ejs');
var connection = mysql.createConnection({
	host     : 'localhost',
	user     : 'root',
	password : '',
	database : 'nodelogin'
});
var transporter = nodemailer.createTransport({
	service: 'gmail',
	auth: {
		//    user: 'graphgenerator2020@gmail.com',
		//    pass: 'generator@2020'
		   user: 'shettymalathijaya09@gmail.com',
		   pass: 'malathi09'
	   },
	   tls:{
		rejectUnauthorized: false
		}
   });
   

var app = express();
app.use(session({
	secret: 'secret',
	resave: true,
	saveUninitialized: true
}));
app.use(bodyParser.urlencoded({extended : true}));
app.use(bodyParser.json());



app.get('/', function(request, response) {
	response.sendFile(path.join(__dirname + '/register.html'));
});
app.post('/login', function(request, response) {
	response.sendFile(path.join(__dirname + '/login.html'));
});
app.get('/forgot-password', function(request, response) {
	response.sendFile(path.join(__dirname + '/forgot-password.html'));
});
app.get('/reset', function(request, response) {
	response.sendFile(path.join(__dirname + '/reset-password.html'));
});
app.post('/update-password', function(request, response) {
	var otp=request.body.otp;
	var password=request.body.password;
	var  sql = "SELECT email FROM my_otp WHERE otp = '"+otp+"'";
	connection.query(sql, function (err, results,fields) {  
		if (results.length > 0) {
			email=results[0].email;
			var  sql = "UPDATE USERS set PASSWORD='"+password+"' where EMAIL='"+email+"'";
			connection.query(sql, function (err, results,fields) {  
				response.redirect('/login');
			});  
		} 
		else {
			response.end("Incorrect OTP");
		}
		
	});  
});
app.post('/reset-password', function(request, response) {
	var email = request.body.email;
	var digits='0123456789';
	let otp='';
	for(let i=0;i<6;i++){
		otp+=digits[Math.floor(Math.random()*10)];
	}
	sql = "DELETE FROM my_otp where email ='"+email+"'";  
	connection.query(sql, function (err, result) {  
	if (err) throw err;  
	console.log("Record deleted.");  
	});
	sql = "INSERT INTO my_otp (EMAIL,OTP) VALUES ('"+email+"','"+otp+"')";  
	connection.query(sql, function (err, result) {  
	if (err) throw err;  
	console.log("1 record inserted.");  
	});  

	const mailOptions = {
		from: 'shettymalathi09@gmail.com', // sender address
		to: email, // list of receivers
		subject: 'Your password reset link.  ', // Subject line
		text: 'http://localhost:3000/password/'+email+'     Please use the otp: '+otp+' to reset the password.'// plain text body
	  };
	  transporter.sendMail(mailOptions, function (err, info) {
		if(err)
		  console.log(err)
		else
		  console.log(info);
	 });
	 response.redirect('/reset');
	 response.end();
});

app.post('/register-user', function(request, response) {
	var email = request.body.email;
	var username = request.body.username;
	var password = request.body.password;
	var cpassword = request.body.cpassword;
	var  sql = "SELECT USERNAME FROM USERS WHERE username = '"+username+"'";
	connection.query(sql, function (err, results,fields) {  
		if (results.length > 0) {
			//return response.render('',{message:'Username already exists.'});
			response.end("Username already exists.");
		} 
		else if(password!==cpassword)
		{	response.end("Passwords do not match.");}
		else {
			sql = "INSERT INTO users (EMAIL,USERNAME,PASSWORD) VALUES ('"+email+"','"+username+"','"+password+"')";  
			connection.query(sql, function (err, result) {  
			if (err) throw err;  
			console.log("1 record inserted");  
			response.redirect('/login');
			});  
			
	const mailOptions = {
		from: 'shettymalathi09@gmail.com', // sender address
		to: email, // list of receivers
		subject: 'Graph Genetor', // Subject line
		text: 'Thanks for Registering in Graph Generator you can create charts like Pie Chart,Doughnut Chart,Bar Chart, Line Chart,Horizontal Bar Chart.'// plain text body
	  };
	  transporter.sendMail(mailOptions, function (err, info) {
		if(err)
		  console.log(err)
		else
		  console.log(info);
	 });
		}
	});  
	//response.sendFile(path.join(__dirname + '/login.html'));
});
app.get('/login', function(request, response) {
	response.sendFile(path.join(__dirname + '/login.html'));
});
app.get('/mycss', function(request, response) {
	response.sendFile(path.join(__dirname + '/login.css'));
});
app.get('/logo', function(request, response) {
	response.sendFile(path.join(__dirname + '/logo1.png'));
});
app.get('/person', function(request, response) {
	response.sendFile(path.join(__dirname + '/person.png'));
});
app.get('/barchart_img', function(request, response) {
	response.sendFile(path.join(__dirname + '/barchart_img.png'));
});
app.get('/piechart_img', function(request, response) {
	response.sendFile(path.join(__dirname + '/piechart_img.png'));
});
app.get('/linechart_img', function(request, response) {
	response.sendFile(path.join(__dirname + '/linechart_img.png'));
});
app.get('/doughnutchart_img', function(request, response) {
	response.sendFile(path.join(__dirname + '/doughnutchart_img.png'));
});
app.get('/horizontalbarchart_img', function(request, response) {
	response.sendFile(path.join(__dirname + '/horizontal_barchart_img.png'));
});
//For authentication of users
app.post('/auth', function(request, response) {
	var username = request.body.username;
	var password = request.body.password;
	if (username && password) {
		connection.query('SELECT USERNAME,PASSWORD FROM USERS WHERE username = ? AND password = ?', [username, password], function(error, results, fields) {
			if (results.length > 0) {
				request.session.loggedin = true;
				request.session.username = username;
				response.redirect('/logged_home');
			} else {
				response.send('Incorrect Username and/or Password!');
			}			
			response.end();
		});
	} else {
		response.send('Please enter Username and Password!');
		response.end();
	}
});
//When user successfully login
app.get('/home', function(request, response) {
	if (request.session.loggedin) {
		//response.send('Welcome back, ' + request.session.username + '!');
		//  response.redirect('http://localhost:3000/logged_home');
	} else {
		response.send('Please login to view this page!');
	}
	response.end();
});
app.get('/logged_home', function(request, response) {
	if (request.session.loggedin) {
		//response.send('Welcome back, ' + request.session.username + '!');
		//  response.redirect('http://localhost:3000/logged_home');
		response.sendFile(path.join(__dirname + '/home.html'));
	} else {
		response.send('Please login to view this page!');
	}
	
});

//All graph
//1.Line Chart
app.get('/line_chart', function(request, response) {
	response.sendFile(path.join(__dirname + '/LineChart/html2.html'));
});
app.get('/pie_chart', function(request, response) {
	response.sendFile(path.join(__dirname + '/PieChart/html1.html'));
});
app.get('/doughnut_chart', function(request, response) {
	response.sendFile(path.join(__dirname + '/DoughnutChart/html1.html'));
});
app.get('/bar_chart', function(request, response) {
	response.sendFile(path.join(__dirname + '/BarChart/html1.html'));
});
app.get('/horizontal_bar_chart', function(request, response) {
	response.sendFile(path.join(__dirname + '/HorizontalBarChart/html1.html'));
});



app.get('/line_data/:fileName', function(req, response) {
	console.log(req.params.fileName);
	response.sendFile(path.join(__dirname + '/LineChart/'+req.params.fileName));
});
app.get('/pie_data/:fileName', function(req, response) {
	console.log(req.params.fileName);
	response.sendFile(path.join(__dirname + '/PieChart/'+req.params.fileName));
});
app.get('/doughnut_data/:fileName', function(req, response) {
	console.log(req.params.fileName);
	response.sendFile(path.join(__dirname + '/DoughnutChart/'+req.params.fileName));
});
app.get('/barchart_data/:fileName', function(req, response) {
	console.log(req.params.fileName);
	response.sendFile(path.join(__dirname + '/BarChart/'+req.params.fileName));
});
app.get('/horizontalbarchart_data/:fileName', function(req, response) {
	console.log(req.params.fileName);
	response.sendFile(path.join(__dirname + '/HorizontalBarChart/'+req.params.fileName));
});

app.listen(3000);
//https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/data_connectedscatter.csv
//https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/connectedscatter.csv
//https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/data_connectedscatter.csv