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

  function _updateConversation(conversation) {
    var objectStore = _callStore;
    var _updateConv = function(event) {
      var cursor = event.target.result;
      if(!cursor || !cursor.value) {
        return;
      }
      var record = cursor.value;
      console.log('opg ' + JSON.stringify(record, null, " "));
    };
    _dbHelper.newTxn(function(error, txn, stores) {
      if (error) {
        console.error(error);
        return;
      }
      for (var i = 0, ls = stores.length; i < ls; i++) {
        var request = stores[i].index('contactID')
                               .openCursor(IDBKeyRange.only(conversation.contactID));
        request.onsuccess = _updateConv;
      }
      txn.onerror = function(event) {
        console.error(event.target.error.name);
      };
    }, 'readwrite', objectStore);
  }

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
    }
  };

  exports.ConversationsDB = ConversationsDB;

})(window);