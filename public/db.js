let db;

const request = indexedDB.open('BudgetDB', 1);

request.onupgradeneeded = (e) => {
  const db = e.target.result;
  db.createObjectStore('New_Transaction', { autoIncrement: true });
};

request.onerror = function (e) {
  console.log(`Slight problem. Error code: ${e.target.errorCode}`);
};

function checkDatabase() {
  console.log('Check database invoked');

  // Open a transaction on your New_Transaction db
  const transaction = db.transaction(['New_Transaction'], 'readwrite');

  // Access your New_Transaction object
  const store = transaction.objectStore('New_Transaction');

  // Get all records from store and set to a variable
  const getAll = store.getAll();

  // If the request was successful
  getAll.onsuccess = function () {
    // If there are items in the store, we need to bulk add them when we are back online
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
          // If our returned response is not empty
          if (res.length !== 0) {
            // Open another transaction to New_Transaction with the ability to read and write
            transaction = db.transaction(['New_Transaction'], 'readwrite');

            // Assign the current store to a variable
            const currentStore = transaction.objectStore('New_Transaction');

            // Clear existing entries because our bulk add was successful
            currentStore.clear();
            console.log('Clearing store 🧹');
          }
        });
    }
  };
}

request.onsuccess = (e) => {
  console.log('IndexedDB open successful.');

  db = e.target.result;

  // Check if app is online before reading from db
  if (navigator.onLine) {
    console.log('Backend online! 🗄️');
    checkDatabase();
  }
};

const saveRecord = (record) => {
  console.log('Save record invoked');
  // Create a transaction on the New_Transaction db with readwrite access
  const transaction = db.transaction(['New_Transaction'], 'readwrite');

  // Access your New_Transaction object store
  const store = transaction.objectStore('New_Transaction');

  // Add record to your store with add method.
  store.add(record);
};

// Listen for app coming back online
window.addEventListener('online', checkDatabase);
