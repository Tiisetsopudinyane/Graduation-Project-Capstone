var express = require("express");
var app = express();
var bodyParser = require("body-parser");
var mongoose = require("mongoose");
var passport = require("passport");
var User = require("./models/user");
var LocalStrategy = require("passport-local");
var passportLocalMongoose = require("passport-local-mongoose");


mongoose.connect('mongodb://localhost:27017/Software_System_v2', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('Connected to DB!'))
.catch(error => console.log(error.message));

app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(express.static(__dirname + '/public'));

app.use(require("express-session")({
	secret: "Super computer is a chess player",
	resave: false,
	saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//MONGOOSE/MODEL CONFIG
var systemSchema = new mongoose.Schema({
	Current: Number,
	Voltage: Number
});

var System = mongoose.model("System",systemSchema);

//===============================================================================================
//ROUTES
//===============================================================================================

// Authentication ROUTES

// Show sign up form
app.get("/register", function(req, res){
	res.render("register");
});

//handling user sign up
app.post("/register", function(req, res){
	req.body.username
	req.body.password
	User.register(new User({username: req.body.username}), req.body.password, function(err, user){
		if(err){
			console.log(err);
			return res.render('register');
		}
		passport.authenticate("local")(req, res, function(){
			res.redirect("/login");
		});
	});
});

//LOGIN ROUTES
// Render login form
app.get("/login", function(req, res){
	res.render("login");
});
//login logic
//middleware
app.post("/login", passport.authenticate("local",{
	successRedirect: "/system",
	failureRedirect: "/login"
}), function(req,res){
	
});

app.get("/logout",function(req, res){
	req.logout();
	res.redirect("/");
});

function isLoggedIn(req, res, next){
	if(req.isAuthenticated()){
		return next();
	}
	res.redirect("/login");
}


// RESTFUL ROUTES

app.get("/",function(res, res){
	res.render("login");
});

app.get("/system",isLoggedIn, function(req, res){
	System.find({}, function(err, system){
		if(err){
			console.log("ERROR!");
		} else {
			res.render("home", {system: system});
		}
	});
});

// NEW ROUTE
app.get("/system/new", isLoggedIn, function(req, res){
	res.render("admin");
});

// CREATE ROUTE
app.post("/system", function(req, res){
	// create new values
	System.create(req.body.system, function(err, newValues){
		if(err){
			res.render("admin");
		} else {
			//then, redirect to the index
			res.redirect("/system");
		}
	});
});

app.listen(3000, function(){
	console.log("The Server Has Started !");
});
