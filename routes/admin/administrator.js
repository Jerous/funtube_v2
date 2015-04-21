var express = require('express');
var router = express.Router();
var events = require('events');
var crypto = require('crypto');
var passport = require('passport'), 
    LocalStrategy = require('passport-local').Strategy;
    
var adminuser = require('../../schema/adminuser.js');

function isAuth(req, res, next){
	if (req.isAuthenticated()) {  
		next();
	} else {
		res.redirect('/administrator/login');
	}
}

router.get('/administrator', isAuth, function(req, res) {
    res.render('admin/index', { title: 'Admin Area' });
});

router.get('/administrator/login', function(req, res) {
    res.render('admin/login/index', { title: 'Admin Login' });
});

router.post('/administrator/login', 
    passport.authenticate('local'),
        function(req, res) {      
            adminuser.update(
                {username: req.user.username}, 
                {$set: 
                    {lastlogin: Date.now()}
                },
                function(err){
                    if(!err){
                        res.redirect('/administrator/');
                    }
                }
            ); 
});

router.get('/administrator/logout', function(req, res){
    req.logout();
    res.redirect('/administrator/login');
});

router.get('/administrator/signup', function(req, res) {
    res.render('admin/signup/index', { title: 'Admin Signup' });
});

router.post('/administrator/signup', function(req, res) {
    var workflow = new events.EventEmitter();
    
    workflow.outcome = {
        success: false,
        errors: [],
        errfor: {}
    };
    
    workflow.on('validation',function(){    //設立一個狀態 validation
        
        if (!req.body.username)
            workflow.outcome.errfor.username = '這是一個必填欄位';
        
        if (!req.body.password)
            workflow.outcome.errfor.password = '這是一個必填欄位';

        if (Object.keys(workflow.outcome.errfor).length !== 0)
            return workflow.emit('response');
   
        workflow.emit('UsernameCheck');  //跳到另一個狀態
    });
    
    workflow.on('UsernameCheck', function() {
        adminuser.findOne({ username: req.body.username }, function(err, user) {

          if (user) {
            workflow.outcome.errfor.usernamecheck = '使用者名稱已經存在';
          }

          workflow.emit('createadmin');
        });
    });
    
    workflow.on('createadmin',function(){
        var passwordsha1 = crypto.createHash('sha1').update(req.body.password).digest("hex");
        var newadminuser = new adminuser({
            username : req.body.username,
            password : passwordsha1,
            timeCreated : Date.now(),
            lastlogin : ''
        });
        newadminuser.save();
        
        workflow.user = newadminuser;
        workflow.outcome.success = true;
        
        workflow.emit('logUserIn');
    });
    
    workflow.on('logUserIn', function() {
        req.login(workflow.user, function(err) {
            workflow.emit('response');
        });
    });
    
    workflow.on('response',function(){
        res.send(workflow.outcome);
    });
    
    return workflow.emit('validation');
    
});


router.get('/api/adminuser', function(req, res) {
	var adminuserlist = adminuser.find({}, function(err, adminuserlist) {
		res.send({
			AdminUser: adminuserlist
		});
		res.end();
	});
});

module.exports = router;
