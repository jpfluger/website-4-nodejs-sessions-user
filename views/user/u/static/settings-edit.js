$(document).ready(function () {

  if ($('#form_edit_user_settings').length === 0) {
    return console.log('cannot find the element form_user_settings')
  }

  // grab the original data
  var dataOriginal = $('#form_edit_user_settings').serializeJSON()

  // edit check
  if (!dataOriginal || zzb.types.isEmptyString(dataOriginal.username)) {
    return console.log('cannot find the user to edit')
  }

  var username = $('#form_edit_user_settings').find('.zzb-form-field-value[name=fullname]').focus()

  if ($('#button_show_change_password_dialog').length > 0) {
    $('#button_show_change_password_dialog').click(function (ev) {
      ev.preventDefault()
      var url = $(this).attr('href')
      zzb.ajax.get({url: url})
      .then(function(data){
        if (!data || data.length === 0) {
          zzb.dialogs.handleError({log: 'contacted the server for the change password form but no data returned', title: 'No form found', message: 'We contacted the remote server for the change password form but no data was returned. Please check your connection settings and try again.'})
        } else {
          zzb.dialogs.showMessageChoice({
            type: BootstrapDialog.TYPE_DEFAULT,
            title: 'Change password',
            message: data.first(),
            noButtons: true,
            onShown: function(dialogRef) {
              // focus inside the existing password element
              $('#button_password_update').closest('form').find('.zzb-form-field-value[name=existing]').focus()
              // handle clicks
              $('#button_password_update').click( function (ev) {
                ev.preventDefault()
                var $form = $('#button_password_update').closest('form')
                var data = $form.serializeJSON()

                var errs = []

                if (!zzb.types.isNonEmptyString(data.existing)) {
                  errs.push(zzb.rob.createError({field: 'existing', message: 'Existing password not valid'}))
                }

                if (!zzb.types.isNonEmptyString(data.password)) {
                  errs.push(zzb.rob.createError({field: 'password', message: 'Password not valid'}))
                } else {
                  if (!zzb.types.isNonEmptyString(data.verify)) {
                    errs.push(zzb.rob.createError({field: 'verify', message: 'Reenter the password'}))
                  } else if (data.password !== data.verify) {
                    errs.push(zzb.rob.createError({field: 'verify', message: 'Password verification mismatch'}))
                  } else if (data.existing === data.password) {
                    errs.push(zzb.rob.createError({field: 'password', message: 'Existing password cannot match new password'}))
                  }
                }

                if (errs.length > 0) {
                  // show errors within input form
                  return zzb.forms.displayUIErrors({$form: $form, errs: errs})
                }

                // let's clear the errors, if any
                zzb.forms.displayUIErrors({$form: $form, errs: null, hideWhenNoError: true})

                // post to site
                zzb.ajax.postJSON({url: $(this).attr('href'), data: data})
                .then(function (data) {

                  if (data.errs) {
                    zzb.forms.displayUIErrors({$form: $form, errs: data.errs})                    
                  }
                  else if (data.ok) {
                    dialogRef.close()
                  }

                }).catch(function (err) {
                  zzb.dialogs.handleError({log: 'failed to update password: ' + err, title: 'Unknown error', message: 'An unknown communications error occurred while updating passwords. Please check your connection settings and try again.'})
                })
              })
            }
          })
        }
      })
      .catch(function(err){
        zzb.dialogs.handleError({log: 'failed to retrieve password update form: ' + err, title: 'Unknown error', message: 'An unknown communications error occurred while retrieving the password update form. Please check your connection settings and try again.'})
      })
    })
  }

  if ($('#button_delete_user').length > 0) {

    $('#button_delete_user').click(function (ev) {
      ev.preventDefault()

      var url = $(this).attr('href')

      zzb.dialogs.showMessageChoice({
        type: BootstrapDialog.TYPE_DANGER,
        title: 'Delete user',
        message: zzb.strings.format('Do you want to delete the user "<strong>{0}</strong>" forever?', dataOriginal.username),
        buttonLeftName: 'No',
        buttonRightName: 'Yes',
        buttonRightCssClass: 'btn-danger',
        onButtonRightClick: function (callback) {
        zzb.ajax.postJSON({url: url})
          .then(function (data) {
            // only errors returned at this level b/c underlying function would redirect
            zzb.dialogs.handleError({log: 'failed to delete user; should not be common - server-side issue?', 
              title: 'Server error', 
              message: 'Our servers are experiencing technical issues and are unable to delete your user. This should not happen. Please try again after a few minutes.',
              errIntro: 'Server says:',
              errs: data.errs})

          }).catch(function (err) {
            zzb.dialogs.handleError({log: 'failed to delete the user: ' + err, title: 'Unknown error', message: 'An unknown communications error occurred while deleting the user. Please check your connection settings and try again.'})
          })
        }
      })
    })
  }

  if ($('#button_settings_save').length > 0) {
    $('#button_settings_save').click(function (ev) {
      ev.preventDefault()

      var data = $('#form_edit_user_settings').serializeJSON()

      if (_.isEqual(dataOriginal, data)) {
        return // no changes
      }

      var errs = []

      if (!zzb.types.isNonEmptyString(data.fullname)) {
        errs.push(zzb.rob.createError({field: 'fullname', message: 'Fullname not valid'}))
      }

      if (errs.length > 0) {
        return zzb.forms.displayUIErrors({$form: $('#form_edit_user_settings'), errs: errs})
      }

      var url = $(this).attr('href')

      // let's clear the errors, if any
      zzb.forms.displayUIErrors({$form: $('#form_edit_user_settings'), errs: null, hideWhenNoError: true})

      // post to site
      zzb.ajax.postJSON({url: url, data: data})
      .then(function (data) {
        // only errors returned at this level b/c underlying function would redirect
        zzb.forms.displayUIErrors({$form: $('#form_edit_user_settings'), errs: data.errs})
      }).catch(function (err) {
        zzb.dialogs.handleError({log: 'failed to save user settings: ' + err, title: 'Unknown error', message: 'An unknown communications error occurred when saving the user settings. Please check your connection settings and try again.'})
      })
    })
  }
})