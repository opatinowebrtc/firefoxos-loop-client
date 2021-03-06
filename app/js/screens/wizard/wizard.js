(function(exports) {
  'use strict';

  var wizardPanel, wizardLogin, termsOfServiceElement, talkToAnyone, anywhereInTheWorld, startAConversation,
    createANewRoom, shareItWith, seeWhoIs, roomIsEmpty, friendJoined, roomIsFull;

  var _ = navigator.mozL10n.get;

  function localize() {
    termsOfServiceElement.innerHTML = _('termsOfServiceAndPrivacyNotice');
    talkToAnyone.innerHTML = _('talkToAnyone');
    anywhereInTheWorld.innerHTML = _('anywhereInTheWorld');
    startAConversation.innerHTML = _('startAConversation');
    createANewRoom.innerHTML = _('createANewRoom');
    shareItWith.innerHTML = _('shareItWith');
    seeWhoIs.innerHTML = _('seeWhoIs');
    roomIsEmpty.innerHTML = _('roomIsEmpty');
    friendJoined.innerHTML = _('friendJoined');
    roomIsFull.innerHTML = _('roomIsFull');
  }

  function render() {
    if (wizardPanel) {
      return;
    }

    wizardPanel = document.getElementById('wizard-panel');
    wizardPanel.innerHTML = Template.extract(wizardPanel);

    postRendering();
  }

  function postRendering() {
    wizardLogin = document.getElementById('wizard-login');
    termsOfServiceElement =
              document.getElementById('terms-of-service-and-privacy-notice');
    talkToAnyone =
              document.getElementById('talk-to-anyone');
    anywhereInTheWorld = document.getElementById('anywhere-in-the-world');
    startAConversation = document.getElementById('start-a-conversation');
    createANewRoom = document.getElementById('create-a-new-room');
    shareItWith = document.getElementById('share-it-with');
    seeWhoIs = document.getElementById('see-who-is');
    roomIsEmpty = document.getElementById('room-is-empty');
    friendJoined = document.getElementById('friend-joined');
    roomIsFull = document.getElementById('room-is-full');
    Branding.naming(wizardPanel);
    Wizard.localize();
    window.addEventListener('localized', localize);
    wizardPanel.classList.remove('hide');
  }

  var Wizard = {
    init: function w_init(isFirstUse, success, error) {

      render();

      Authenticate.init();

      if (!isFirstUse) {
        // Show the right panel
        wizardPanel.dataset.step = 6;
        wizardPanel.classList.add('login');
        wizardLogin.classList.add('show');
        success();
        return;
      }

      Tutorial.init();
      success();
    },

    localize: function w_localize() {
      if (navigator.mozL10n.readyState === 'complete') {
        localize();
      } else {
        navigator.mozL10n.ready(localize);
      }
    }
  };

  exports.Wizard = Wizard;
}(this));
