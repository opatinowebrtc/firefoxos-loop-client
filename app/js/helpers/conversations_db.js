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
	      primary: 'url',
	      indexes: [{
	        name: 'conversationPending',
	        field: 'conversationPending',
	        params: {
	          multientry: true
	        }
	      }, {
	        name: 'contactId',
	        field: 'contactId',
	        params: {
	          multientry: true
	        }
	      }],
	      fields: [
	        'date',
	        'url',
          'contactId',
	        'origin',
	        'sharedVia',
	        'conversationPending'
	      ]
	    },
	});

  var ConversationsDB = {
    setDate: function(conversationItem) {
      conversationItem.date = Date.now();
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
      return new Promise(function(resolve, rejet){
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