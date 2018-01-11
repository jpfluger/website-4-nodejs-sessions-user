// --------------------------------------------------
// Required db libraries
// --------------------------------------------------

var db = require('./db.js')

db.initDb()
.then(function () {
  console.log('app-level initDb completed')
  runApp()
})
.catch(function (err) {
  console.log('fatal error: ' + err)
  process.exit(1)
})

var runApp = function () {
  // --------------------------------------------------
  // Required server libraries
  // --------------------------------------------------

  // see: http://markojs.com/docs/express/
  require('marko/node-require')

  var express = require('express')
  var app = express()
  var path = require('path')
  var markoExpress = require('marko/express')
  var bodyParser = require('body-parser')

  // --------------------------------------------------
  // Serve STATIC files that are available to the public
  // --------------------------------------------------

  app.use('/public', express.static('public'))
  // if not using /public/_third directly, then map-in the folder bower_components/
  // app.use('/public/_third', express.static(path.join(__dirname, 'bower_components')))

  // --------------------------------------------------
  // Sessions
  // --------------------------------------------------

  // placed AFTER "public" static files since for this demo we don't require the session in order to serve a public file
  // if placed BEFORE, then before each public file is served, the session will be checked
  var mySessions = require('./sessions.js')
  mySessions.initializeSessions(app, db)
  .then(function(){
    db.logDebug('initialized sessions')

    // --------------------------------------------------
    // Marko templates
    // --------------------------------------------------

    var marko = {}

    // https://github.com/marko-js/marko/blob/master/src/express.js
    var renderMarkoTemplate = function (res, pathToFile, data) {
      if (!marko[pathToFile]) {
        marko[pathToFile] = require(path.resolve(path.join(__dirname, '../' + pathToFile)))
      }

      data = data || {}
      data.$global = {locals: res.locals, escapeHtml: db.escapeHtml}      

      // it's okay if data is null
      res.marko(marko[pathToFile], data)
    }

    // app.use(markoExpress()) //enable res.marko(template, data)

    // --------------------------------------------------
    // Routes - Public
    // --------------------------------------------------

    app.get('/', function (req, res) {
      res.redirect('/home')
    })

    app.get('/home', markoExpress(), function (req, res) {
      renderMarkoTemplate(res, 'views/home.marko')
    })

    app.get('/time', markoExpress(), function (req, res) {
      renderMarkoTemplate(res, 'views/time.marko', {time: new Date().toLocaleString()})
    })

    // --------------------------------------------------
    // Routes - User Login (ul)
    // --------------------------------------------------

    app.get('/login', markoExpress(), function (req, res) {
      if (req.session.user && req.session.user.isLoggedIn) {
        return res.json({redirect: mySessions.pages.userHome})
      } else {
        renderMarkoTemplate(res, 'views/user/ul/login.marko')        
      }
    })

    app.get('/ul/login', markoExpress(), function (req, res) {
      if (req.session.user && req.session.user.isLoggedIn) {
        return res.json({redirect: mySessions.pages.userHome})
      } else {
        renderMarkoTemplate(res, 'views/user/ul/login-dialog.marko')        
      }
    })

    app.post('/login', bodyParser.json(), mySessions.handlePostLogin)

    app.get('/register', markoExpress(), function (req, res) {
      if (req.session.user && req.session.user.isLoggedIn) {
        return res.json({redirect: mySessions.pages.userHome})
      } else {
        renderMarkoTemplate(res, 'views/user/ul/register.marko')        
      }
    })

    app.get('/ul/register', markoExpress(), function (req, res) {
      if (req.session.user && req.session.user.isLoggedIn) {
        return res.json({redirect: mySessions.pages.userHome})
      } else {
        renderMarkoTemplate(res, 'views/user/ul/register-dialog.marko')        
      }
    })

    app.post('/register', bodyParser.json(), mySessions.handlePostRegister)
    app.post('/logout', mySessions.handlePostLogout)

    app.post('/zzb/status', bodyParser.json(), function (req, res) {
      res.json({rec: res.locals.zzbStatus})
    })

    // --------------------------------------------------
    // Routes - Logged-In Users
    // --------------------------------------------------

    app.use('/u/settings/static', function (req, res, next) {
      if (!req.session.user) {
        return res.status(401).send('login required');
      }
      next()
    }, express.static(path.resolve(path.join(__dirname, '../views/user/u/static'))))

    app.get(mySessions.pages.userSettings, markoExpress(), function (req, res) {
      if (!req.session.user) {
        return res.redirect(mySessions.pages.userLogin)
      } else {
        db.sqlRun(db.sqlE.getUserByUsername, {username: req.session.user.username}, function (err, dbr) {
          if (err) {
            db.logError(util.format('get user settings: db.sqlE.getUserByUsername has error: %s', err))
            err.display = 'Unexpected server error. If this issue persists, contact the website administrator.'
            next(err)
          } else {
            if (!dbr.rows || dbr.rows.length === 0) {
              db.logError(util.format('get user settings: db.sqlE.getUserByUsername returned with no error but no data where username=%s', req.session.user.username))
              err.display = 'Unexpected server error. If this issue persists, contact the website administrator.'
              next(err)
            } else {
              renderMarkoTemplate(res, 'views/user/u/settings-edit.marko', {user: {username: dbr.rows[0].username, fullname: dbr.rows[0].fullname}})
            }
          }
        })
      }
    })

    app.get('/u/settings/password-dialog', markoExpress(), function (req, res) {
      if (!req.session.user) {
        return res.redirect(mySessions.pages.userLogin)
      } else {
        renderMarkoTemplate(res, 'views/user/u/password-dialog.marko')        
      }
    })

    app.post('/u/settings/delete', bodyParser.json(), mySessions.handlePost_Delete_User) 
    app.post('/u/settings/password-update', bodyParser.json(), mySessions.handlePost_Edit_User_Password)
    app.post('/u/settings', bodyParser.json(), mySessions.handlePost_Edit_User_Settings)

    app.get('/analytics/site-usage', markoExpress(), function (req, res) {
      if (!req.session.user) {
        return res.redirect(mySessions.pages.userLogin)
      } else {
        renderMarkoTemplate(res, 'views/analytics/site-usage.marko', {globalStats: mySessions.getGlobalStats()})
      }
    })

    /**********************************************
    * Error handling
    */

    app.use(markoExpress(), function (req, res, next) {
      res.status(404)
      renderMarkoTemplate(res, 'views/404.marko')
    })

    app.use(markoExpress(), function (err, req, res, next) {
      db.logDebug(err)
      res.status(500)
      renderMarkoTemplate(res, 'views/500.marko')
    })

    app.listen(8080, function () {
      console.log('Sample app listening on http://localhost:8080')
    })
  })
}
