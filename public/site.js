/* global $ */
/* global alert */

$(document).ready(function () {
  // when using bootstraps's nav-menu components, don't define the active menu on the server
  // rather, to make active, match on the pathanme to the a.href attribute
  $('#mainNavBar a').each(function () {
    if (window.location.pathname === $(this).attr('href')) {
      $(this).closest('li').addClass('active')
      // return false
    } else {
      $(this).closest('li').removeClass('active')
    }
  })

  zzb.status.get(function(err, status) {
    if (err) {
      console.log(err)      
    } 
    console.log(JSON.stringify(status))
  })

  // --------------------------------------------------
  // Login and Registration
  // --------------------------------------------------

  var handleSubmitLogin = function (ev) {
    ev.preventDefault()
    var $form = $(this).closest('form')
    var data = $form.serializeJSON()

    var errs = []

    if (!zzb.types.isNonEmptyString(data.username)) {
      errs.push(zzb.rob.createError({field: 'username', message: 'Username not valid'}))
    }

    if (!zzb.types.isNonEmptyString(data.password)) {
      errs.push(zzb.rob.createError({field: 'password', message: 'Password not valid'}))
    }

    if (errs.length > 0) {
      // show errors within input form
      return zzb.forms.displayUIErrors({$form: $form, errs: errs})
    }

    // let's clear the errors, if any
    zzb.forms.displayUIErrors({$form: $form, errs: null, hideWhenNoError: true})

    // post to site
    zzb.ajax.postJSON({url: '/login', data: data})
    .then(function (data) {

      // only errors returned at this level b/c underlying function would redirect
      zzb.forms.displayUIErrors({$form: $form, errs: data.errs})


    }).catch(function (err) {
      zzb.dialogs.handleError({log: 'failed to post login form: ' + err, title: 'Unknown error', message: 'An unknown communications error occurred while retrieving the login form. Please check your connection settings and try again.'})
    })
  }

  var handleSubmitRegistration = function (ev) {
    ev.preventDefault()
    var $form = $(this).closest('form')
    var data = $form.serializeJSON()

    var errs = []

    if (!zzb.types.isNonEmptyString(data.fullname)) {
      errs.push(zzb.rob.createError({field: 'fullname', message: 'Fullname not valid'}))
    }

    if (!zzb.types.isNonEmptyString(data.username)) {
      errs.push(zzb.rob.createError({field: 'username', message: 'Username not valid'}))
    }

    if (!zzb.types.isNonEmptyString(data.password)) {
      errs.push(zzb.rob.createError({field: 'password', message: 'Password not valid'}))
    } else {
      if (!zzb.types.isNonEmptyString(data.verify)) {
        errs.push(zzb.rob.createError({field: 'verify', message: 'Reenter the password'}))
      } else if (data.password !== data.verify) {
        errs.push(zzb.rob.createError({field: 'verify', message: 'Password verification mismatch'}))
      }
    }

    if (errs.length > 0) {
      // show errors within input form
      return zzb.forms.displayUIErrors({$form: $form, errs: errs})
    }

    // let's clear the errors, if any
    zzb.forms.displayUIErrors({$form: $form, errs: null, hideWhenNoError: true})

    // post to site
    zzb.ajax.postJSON({url: '/register', data: data})
    .then(function (data) {

      // only errors returned at this level b/c underlying function would redirect
      zzb.forms.displayUIErrors({$form: $form, errs: data.errs})


    }).catch(function (err) {
      zzb.dialogs.handleError({log: 'failed to post registration form: ' + err, title: 'Unknown error', message: 'An unknown communications error occurred while sending the registration form. Please check your connection settings and try again.'})
    })
  }

  if ($('#button_login').length > 0) {
    // focus inside the username element
    $('#button_login').closest('form').find('.zzb-form-field-value[name=username]').focus()
    // handle login click
    $('#button_login').click(handleSubmitLogin)    
  }

  if ($('#button_register').length > 0) {
    // focus inside the username element
    $('#button_register').closest('form').find('.zzb-form-field-value[name=fullname]').focus()
    // handle login click
    $('#button_register').click(handleSubmitRegistration)
  }

  $('#button_logout').click(function (ev) {
    ev.preventDefault()

    var url = $(this).attr('href')

    // user option (currently disabled)
    var promptUserToVerifyLogout = false

    var handleLogout = function (callback) {
      zzb.ajax.postJSON({url: url})
      .then(function (data) {
        // only errors returned at this level b/c underlying function would redirect
        zzb.dialogs.handleError({log: 'failed to logout; should not be common - server-side issue?', 
          title: 'Server error', 
          message: 'Close your browser to logout completely or try logging out later. Our servers are experiencing technical issues and are unable to log you out from the server.',
          errIntro: 'Server says:',
          errs: data.errs})

      }).catch(function (err) {
        zzb.dialogs.handleError({log: 'failed to post login dialog form: ' + err, title: 'Unknown error', message: 'An unknown communications error occurred while retrieving the login form. Please check your connection settings and try again.'})
      })
    }

    if (!promptUserToVerifyLogout) {
      handleLogout()
    } else {
      zzb.dialogs.showMessageChoice({
        type:BootstrapDialog.TYPE_PRIMARY,
        title:'Logout?',
        message:'Do you want to logout from this site?',
        buttonLeftName:'No',
        buttonLeftCssClass: 'btn-primary',
        buttonRightName: 'Yes',
        onButtonRightClick: handleLogout
      })      
    }
  })

  $('#button_showLoginDialog').click(function (ev) {
    ev.preventDefault()
    var url = $(this).attr('href')
    zzb.ajax.get({url: url})
      .then(function(data){
        if (!data || data.length === 0) {
          zzb.dialogs.handleError({log: 'contacted the server for the login dialog form but no data returned', title: 'No form found', message: 'We contacted the remote server for the login form but no data was returned. Please check your connection settings and try again.'})
        } else {
          zzb.dialogs.showMessageChoice({
            type: BootstrapDialog.TYPE_DEFAULT,
            title: 'Log in',
            message: data.first(),
            cssClass: 'login_dialog',
            noButtons: true,
            onShown: function(dialogRef) {
              // focus inside the username element
              $('#button_login').closest('form').find('.zzb-form-field-value[name=username]').focus()
              // handle login click
              $('#button_login').click(handleSubmitLogin)
            }
          })
        }
      })
      .catch(function(err){
        zzb.dialogs.handleError({log: 'failed to retrieve login dialog form: ' + err, title: 'Unknown error', message: 'An unknown communications error occurred while retrieving the login form. Please check your connection settings and try again.'})
      })
  })

  $('#button_showRegisterDialog').click(function(ev){
    ev.preventDefault()
    var url = $(this).attr('href')
    zzb.ajax.get({url: url})
      .then(function(data){
        if (!data || data.length === 0) {
          zzb.dialogs.handleError({log: 'contacted the server for the register dialog form but no data returned', title: 'No form found', message: 'We contacted the remote server for the registration form but no data was returned. Please check your connection settings and try again.'})
        } else {
          zzb.dialogs.showMessageChoice({
            type: BootstrapDialog.TYPE_DEFAULT,
            title: 'Registration',
            message: data.first(),
            cssClass: 'register_dialog',
            noButtons: true,
            onShown: function(dialogRef) {
              // focus inside the username element
              $('#button_register').closest('form').find('.zzb-form-field-value[name=fullname]').focus()
              // handle login click
              $('#button_register').click(handleSubmitRegistration)
            }
          })
        }
      })
      .catch(function(err){
        zzb.dialogs.handleError({log: 'failed to retrieve login registration form: ' + err, title: 'Unknown error', message: 'An unknown communications error occurred while retrieving the registration form. Please check your connection settings and try again.'})
      })
  })

})
