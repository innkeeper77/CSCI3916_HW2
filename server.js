var express = require('express');
var http = require('http');
var bodyParser = require('body-parser');
var passport = require('passport');
var authController = require('./auth');
var authJwtController = require('./auth_jwt');
db = require('./db')(); //global hack
var jwt = require('jsonwebtoken');

var app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(passport.initialize());

var router = express.Router();

function getJSONObject(req) {
    var json = {
        headers : "No Headers",
        key: process.env.UNIQUE_KEY,
        body : "No Body"
    };

    if (req.body != null) {
        json.body = req.body;
    }
    if (req.headers != null) {
        json.headers = req.headers;
    }

    return json;
}

router.route('/post')
    .post(authController.isAuthenticated, function (req, res) {
            console.log(req.body);
            res = res.status(200);
            if (req.get('Content-Type')) {
                console.log("Content-Type: " + req.get('Content-Type'));
                res = res.type(req.get('Content-Type'));
            }
            var o = getJSONObject(req);
            res.json(o);
        }
    )
    .all(function (req, res) { // Using "all" to catch anything that gets to this point in the section. Eg here, only in the /post section. (Thanks Gavin for the pointer on this!)
            console.log(req.body);
            res = res.status(403);
            res.send("Request type not supported.");
        }
    );

// removed postjwt- not part of assignment requirements

router.route('/signup')
    .post(function(req, res) {
    if (!req.body.username || !req.body.password) {
        res.json({success: false, msg: 'Please pass username and password.'});
    } else {
        var newUser = {
            username: req.body.username,
            password: req.body.password
        };
        // save the user
        db.save(newUser); //no duplicate checking
        res.json({success: true, msg: 'Successfully created new user.'});
    }
    })
    .all(function(req, res) {
            console.log(req.body);
            res = res.status(403);
            res.send("Request type not supported SIGNUP ROUTE.");
        }
    );

router.route('/signin', function(req, res) {
        var user = db.findOne(req.body.username);

        if (!user) {
            res.status(401).send({success: false, msg: 'Authentication failed. User not found.'});
        }
        else {
            // check if password matches
            if (req.body.password == user.password)  {
                var userToken = { id : user.id, username: user.username };
                var token = jwt.sign(userToken, process.env.SECRET_KEY);
                res.json({success: true, token: 'JWT ' + token});
            }
            else {
                res.status(401).send({success: false, msg: 'Authentication failed. Wrong password.'});
            }
        }
    })
    .all(function(req, res) {
            console.log(req.body);
            res = res.status(403);
            res.send("Request type not supported.");
        }
    );

router.route('/movies') // /movies added per requirements. post, get, put, delete
    .post(function(req, res) {
            console.log(req.body);
            res = res.status(200);
            if (req.get('Content-Type')) {
                console.log("Content-Type: " + req.get('Content-Type'));
                res = res.type(req.get('Content-Type'));
            }
            res.send({status:200,
                message:"movie Saved",
                headers:req.headers,
                query:req.query,
                env:process.env.UNIQUE_KEY
            });
        }
    )
    .get(function(req, res) {
            console.log(req.body);
            res = res.status(200);
            if (req.get('Content-Type')) {
                console.log("Content-Type: " + req.get('Content-Type'));
                res = res.type(req.get('Content-Type'));
            }
            res.send({status:200,
                message:"GET movies",
                headers:req.headers,
                query:req.query,
                env:process.env.UNIQUE_KEY
            });
        }
    )
    .put(authJwtController.isAuthenticated, function(req, res) {
            console.log(req.body);
            res = res.status(200);
            if (req.get('Content-Type')) {
                console.log("Content-Type: " + req.get('Content-Type'));
                res = res.type(req.get('Content-Type'));
            }
            res.send({status:200,
                message:"movie updated",
                headers:req.headers,
                query:req.query,
                env:process.env.UNIQUE_KEY
            });
        }
    )
    .delete(authController.isAuthenticated, function(req, res) { // Read more on basic auth usage authjwt vs auth?
            console.log(req.body);
            res = res.status(200);
            if (req.get('Content-Type')) {
                console.log("Content-Type: " + req.get('Content-Type'));
                res = res.type(req.get('Content-Type'));
            }
            res.send({status:200,
                message:"movie deleted",
                headers:req.headers,
                query:req.query,
                env:process.env.UNIQUE_KEY
            });
        }
    )
    .all(function (req, res) { // Using "all" to catch anything that gets to this point in the section. Eg here, only in the /post section. (Thanks Gavin for the pointer on this!)
            console.log(req.body);
            res = res.status(403);
            res.send("Request type not supported.");
        }
    );

router.route('/') // Final catch all
    .all(function (req, res) {
            console.log(req.body);
            res = res.status(403);
            res.send("Request type not supported. CATCHALL");
        }
    );

app.use('/', router);
app.listen(process.env.PORT || 8080);

module.exports = app; // for testing