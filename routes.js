'use strict';

function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.set('X-Auth-Required', 'true');
  req.session.returnUrl = req.originalUrl;
  res.redirect('/login/');
}

function ensureAdmin(req, res, next) {
  if (req.user.canPlayRoleOf('admin')) {
    return next();
  }
  res.redirect('/');
}

function ensureAccount(req, res, next) {
  if (req.user.canPlayRoleOf('account')) {
    if (req.app.get('require-account-verification')) {
      if (req.user.roles.account.isVerified !== 'yes' && !/^\/account\/verification\//.test(req.url)) {
        return res.redirect('/account/verification/');
      }
    }
    return next();
  }
  res.redirect('/');
}

exports = module.exports = function(app, passport) {
  
  //front end 
  app.use('/', require('./routes/index'));
  app.use('/users', require('./routes/users'));

  //sign up
  /*app.get('/signup/', require('./routes/signup/index').init);
  app.post('/signup/', require('./routes/signup/index').signup)

  //route not found
  app.all('*', require('./routes/http/index').http404);*/
};
