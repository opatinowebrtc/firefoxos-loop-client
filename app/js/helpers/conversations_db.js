(function (exports) {
	'use strict'
	const _callStore = 'infoCalls';
	var _dbHelper = new DatabaseHelper({
		name: 'callInfo',
		version: 1,
		maxNumberOfRecords: 200,
    numOfRecordsToDelete: 50
  }, {
    'infoCalls': {
      primary: 'contactID',
      indexes: [{
        name: 'date_aud',
        field: 'date_aud',
        params: {
          multientry: true
        }
      }, {
        name: 'url',
        field: 'url',
        params: {
          multientry: true
        }
      }],
      fields: [
        'date_aud',
        'url',
        'email',
        'origin',
        'sharedVia',
        'conversationPending',
        'incoming',
        'subject',
        'contactID'
      ]
    },
	});

  var ConversationsDB = {
    setDate: function(conversation) {
      conversation.date_aud = Date.now();
    },
    create: function(conversation) {
      var self = this;
      return new Promise(function (resolve, reject){
        ConversationsDB.setDate(conversation);
        _dbHelper.addRecord(function (error, storedRecord) {
          if (error) {
            reject(error);
          } else {            
            resolve(storedRecord);
          }
        }, _callStore, conversation);
      });
    },
    get: function(token) {
      return new Promise(function(resolve, reject){
        _dbHelper.getRecord(function(error, result) {
          if (error) {
            reject(error);
          } else {
            resolve(result);
          }
        }, _callStore, {
          key: token
        });
      });
    },
    delete: function(tokensArray) {
      if (!Array.isArray(tokensArray)) {
        tokensArray = [ tokensArray ];
      }
      return new Promise(function(resolve, reject){
        tokensArray.forEach(function(token) {
          _dbHelper.deleteRecord(function (error) {
            if (error) {
              reject(error);
            } else {
              resolve();
            }
          }, _callStore, token);
        });
      });
    }
  };

  exports.ConversationsDB = ConversationsDB;

})(window);