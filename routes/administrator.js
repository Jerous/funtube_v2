var express = require('express');
var router = express.Router();
var events = require('events');
var passport = require('passport'), 
    LocalStrategy = require('passport-local').Strategy;

router.get('/administrator', function(req, res, next) {
	if (req.isAuthenticated()) {  
		next();
	} else {
		res.redirect('/administrator/login');
	}
});

router.get('/administrator', function(req, res) {
    res.render('admin/index', { title: 'funtube admin area' });
});

router.get('/administrator/login', function(req, res) {
    res.render('admin/login/index', { title: 'admin login' });
});

router.post('/administrator/login', 
passport.authenticate('local', { failureRedirect: '/administrator/login' }),
    function(req, res) {
        res.redirect('/administrator');
    });

router.get('/administrator/logout', function(req, res){
    req.logout();
    res.redirect('/administrator/login');
});

router.get('/administrator/signup', function(req, res) {
    res.render('admin/signup/index', { title: 'admin signup' });
});

router.post('/administrator/signup', function(req, res) {
    var workflow = new events.EventEmitter();  //建立狀態機物件
    var model = req.app.db.model.AdminUser;
    
    var username = req.body.username;
    var password = req.body.password;
    
    workflow.outcome = {
        success: false,
        errfor: {}
    };
    
    workflow.on('validation',function(){    //設立一個狀態 validation
        
        if (username.length === 0)
            workflow.outcome.errfor.title = '這是一個必填欄位';
        
        if (password.length === 0)
            workflow.outcome.errfor.content = '這是一個必填欄位';

        if (Object.keys(workflow.outcome.errfor).length !== 0)
            return workflow.emit('response');
   
        workflow.emit('createadmin');  //跳到另一個狀態
    });
    
    workflow.on('createadmin',function(){
        var crypto = require('crypto');
        var passwordsha1 = crypto.createHash('sha1').update(password).digest("hex");
        var adminuser = new model({
            username : username,
            password : passwordsha1,
            timeCreated : Date.now(),
            lastlogin : '',

        });
        adminuser.save();
        
        workflow.outcome.success = true;
        
        workflow.emit('response');
    });
    
    workflow.on('response',function(){
        res.send(workflow.outcome);
    });
    
    return workflow.emit('validation');
    
});


router.get('/api/adminuser', function(req, res) {
    var model = req.app.db.model.AdminUser;

	var vcard = model.find({}, function(err, vcard) {
		res.send({
			AdminUser: vcard
		});
		res.end();
	});
});

function isAuth(req, res, next){
	if (req.isAuthenticated()) {  
		next();
	} else {
		res.redirect('/administrator/login');
	}
}

module.exports = router;
