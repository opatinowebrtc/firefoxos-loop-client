(function(exports) {
  'use strict';

  var _ = navigator.mozL10n.get;

  var _optionMenu = null;

  function _showOptionMenu(infoToShow, reason, success, cancel) {
    _optionMenu = new OptionMenu({
      section: _('newRoomFallbackMessage', {
        reason: Branding.getTranslation(reason + 'Message', {
          contactName: infoToShow
        })
      }),
      type: 'confirm',
      items: [
        {
          name: 'Cancel',
          l10nId: 'cancel',
          method: function() {
            _optionMenu = null;
            cancel();
          }
        },
        {
          name: 'New Room',
          class: 'recommend',
          l10nId: 'newRoom',
          method: function() {
            _optionMenu = null;
            success();
          },
          params: []
        }
      ]
    });
  }

  function _onClose() {
    Controller.updateConversationInfo('sharedVia', 'canceled');
    ShareScreen.hide();
  }

  function _onOtherClicked() {
    Controller.shareUrl(
      {
        url: _url
      },
      function onShared() {
        ShareScreen.hide();
      },
      function onError() {
        // TODO Do we need to show something to the user?
      }
    );
  }

  function _onSMSClicked() {
    if (_tels.length === 1) {
      _newSMS(_tels[0]);
      return;
    }
    _newFromArray(_tels, _newSMS);
  }

  function _onEmailClicked() {
    if (_mails.length === 1) {
      _newMail(_mails[0]);
      return;
    }
    _newFromArray(_mails, _newMail);
  }

  function _attachHandlers() {
    _closeButton.addEventListener('click', _onClose);
    _shareOthers.addEventListener('click', _onOtherClicked);
    _shareSMS.addEventListener('click', _onSMSClicked);
    _shareEmail.addEventListener('click', _onEmailClicked);
  }

  function _removeHandlers() {
    _closeButton.removeEventListener('click', _onClose);
    _shareOthers.removeEventListener('click', _onOtherClicked);
    _shareSMS.removeEventListener('click', _onSMSClicked);
    _shareEmail.removeEventListener('click', _onEmailClicked);
  }

  function _init() {
    if (_sharePanel) {
      return;
    }

    _ = navigator.mozL10n.get;

    _sharePanel = document.getElementById('share-panel');
    _sharePanel.innerHTML = Template.extract(_sharePanel);
    // We emit this event to center properly headers
    window.dispatchEvent(new CustomEvent('lazyload', {
      detail: _sharePanel
    }));
    _closeButton = document.getElementById('share-close-button');
    _shareOthers = document.getElementById('share-by-others');
    _shareSMS = document.getElementById('share-by-sms');
    _shareEmail = document.getElementById('share-by-email');
    _contactName = document.getElementById('contact-name-to-share');
    _sharingReason = document.getElementById('sharing-reason');
    _urlshown = document.getElementById('link-to-share');
    _shareInfo = document.querySelector('.share-contact-info');
    _shareInfoPhoto = document.querySelector('.share-contact-photo');
  }


  function _renderOptions(identities) {

    // Classify the identities taking into account the group
    for (var i = 0, l = identities.length; i < l; i++) {
      if (identities[i].indexOf('@') === -1) {
        _tels.push(identities[i]);
      } else {
        _mails.push(identities[i]);
      }
    }

    // Show the right set of options
    if (_tels.length === 0) {
      _shareSMS.style.display = 'none';
    } else {
      _shareSMS.style.display = 'flex';
    }

    if (_mails.length === 0) {
      _shareEmail.style.display = 'none';
    } else {
      _shareEmail.style.display = 'flex';
    }
  }

  function _getIdentities(contact) {
    var phones = contact.tel || [];
    var emails = contact.email || [];
    var candidates = phones.concat(emails);
    var identities = [];

    for (var i = 0, l = candidates.length; i < l; i++) {
      identities.push(candidates[i].value);
    }
    return identities;
  }

  function _render(identities, url, sharingReason) {
    _identities = identities;
    // Firsf of all we update the basics, the reason and
    // the info related with URL and identities
    _sharingReason.textContent = Branding.getTranslation(sharingReason);
    _contactName.textContent = identities[0];
    _urlshown.textContent = url;

    // Now we update with the contacts info if available
    ContactsHelper.find(
      {
        identities: identities
      },
      function onContact(result) {
        _contactInfo = result;
        _contact = result.contacts[0];
        // Update the name
        _contactName.textContent = ContactsHelper.prettyPrimaryInfo(_contact);
        // Update the photo
        if (_contact.photo && _contact.photo.length > 0) {
          var url = URL.createObjectURL(_contact.photo[0]);
          var urlString = 'url(' + url + ')';
          _shareInfoPhoto.style.backgroundImage = urlString;
          _shareInfo.classList.remove('has-no-photo');
        } else {
          _shareInfo.classList.add('has-no-photo');
        }
        // Render options from contact
        _renderOptions(_getIdentities(_contact));
      },
      function onFallback() {
        _shareInfo.classList.add('has-no-photo');
        _renderOptions(identities);
      }
    );
  }

>>>>>>> Bug1099142 - Conversations report
  var ShareScreen = {
    show: function s_show(identity, reason, subject) {
      return new Promise(function(resolve, reject) {
        var contact = null;

        var creteRoomAndShare = function() {
          Loader.getRoomCreateObj().then(RoomCreate => {
            RoomCreate.create(subject).then(room => {
              if (!room || !room.roomUrl) {
                reject();
              }

              CallLog.showRooms();
              Loader.getShare().then(Share => {
                var method = contact ? 'toContact' : 'toIdentity';
                var params = {
                  type: 'room',
                  url: room.roomUrl,
                  identity: identity,
                  contact: contact
                };
                Share[method](params, function onShared(contact, identity) {
                  Controller.onRoomShared(room, contact, identity);
                }, function onError() {
                  // Currently we dont need to show any error here
                });
              });

              resolve();
            }, reject);
          });
        };

        ContactsHelper.find({
          identities: identity
        }, function(result) {
          contact = result.contacts[0];
          _showOptionMenu(ContactsHelper.getPrimaryInfo(contact), reason,
                                               creteRoomAndShare, reject);
        }, function() {
          _showOptionMenu(identity, reason, creteRoomAndShare, reject);
        });
      });
    },

    hide: function s_hide() {
      if (_optionMenu) {
        _optionMenu.hide();
        _optionMenu = null;
      }
    }
  };

  exports.ShareScreen = ShareScreen;
}(this));
