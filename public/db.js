let db;

const request = window.indexedDB.open('BudgetDB', 1);

request.onsuccess = (e) => {
  console.log(request.result.name);
};
