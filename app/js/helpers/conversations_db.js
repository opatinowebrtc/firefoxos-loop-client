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
          'contactID',
	        'origin',
	        'sharedVia',
	        'conversationPending',
          'incoming',
          'subject'
        ]
	    },
	});

  var ConversationsDB = {
    setDate: function(conversationItem) {
      conversationItem.date_aud = Date.now();
    },
    add: function(conversation) {
      return new Promise(function(resolve, reject) {
        ConversationsDB.setDate(conversation);
        _dbHelper.addRecord(function(error, storedRecord) {
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
    },
    update: function(token, conversation) {
      return new Promise(function(resolve, reject) {
        _dbHelper.updateRecord(function(error) {
          if (error) {
            reject(error);
          } else {
            resolve();
          }
        }, _roomsStore, { key: token }, {
          date_aud: conversation.date_aud,
          url: conversation.url,
          origin: conversation.origin,
          sharedVia: conversation.sharedVia,
          conversationPending: conversation.conversationPending,
          incoming: conversation.incoming,
          subject: conversation.subject
        });
      });
    }
  };

  exports.ConversationsDB = ConversationsDB;

})(window);