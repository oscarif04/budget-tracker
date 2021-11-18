let db;

const request = window.indexedDB.open("budgetData", 1);

request.onupgradeneeded = ({ target }) => {
  db = target.result;

  if (db.objectStoreNames.length === 0) {
    db.createObjectStore('TransactionStore', { autoIncrement: true });
  }

}

request.onerror = function (e) {
    console.log(`Error:`+ e.target.errorCode);
  };

  function checkDatabase() {  
    let transaction = db.transaction(['TransactionStore'], 'readwrite');
    const store = transaction.objectStore('TransactionStore');
  
    const getAll = store.getAll();
  
    getAll.onsuccess = function () {
      if (getAll.result.length > 0) {
        fetch('/api/transaction/bulk', {
          method: 'POST',
          body: JSON.stringify(getAll.result),
          headers: {
            Accept: 'application/json, text/plain, */*',
            'Content-Type': 'application/json',
          },
        })
          .then((response) => response.json())
          .then((res) => {
            if (res.length !== 0) {
              transaction = db.transaction(['TransactionStore'], 'readwrite');
                const currentStore = transaction.objectStore('TransactionStore');
                currentStore.clear();
            }
          });
      }
    };
  }

request.onsuccess = function (e) {
    console.log('success');
    db = e.target.result;
  
    if (navigator.onLine) {
      console.log('Backend online! 🗄️');
      checkDatabase();
    }
  };


  const saveRecord = (record) => {
    console.log('Save record invoked');
    const transaction = db.transaction(['TransactionStore'], 'readwrite');
    const store = transaction.objectStore("TransactionStore")
    store.add(record)

  };


window.addEventListener('online', checkDatabase);