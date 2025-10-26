const DB_NAME = 'contentDB';
const DB_VERSION = 1;
const STORE_NAME = 'contentStore';

// Global variable to hold the database connection
let db = null;

function requestToPromise(request) {
    return new Promise((resolve, reject) => {
        request.onsuccess = (event) => {
            resolve(event.target.result);
        };
        request.onerror = (event) => {
            console.error("IndexedDB operation error:", event.target.error);
            reject(event.target.error);
        };
    });
}

async function openDB() {
    if (db) return db;

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
        const database = event.target.result;
        if (!database.objectStoreNames.contains(STORE_NAME)) {
            // The object store will use the key name as its primary key
            database.createObjectStore(STORE_NAME);
        }
    };

    // Wait for the open request to succeed
    db = await requestToPromise(request);
    return db;
}

export async function saveToIDB(key, data) {
    const database = await openDB();
    const transaction = database.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);

    // Put operation stores or updates the data
    const request = store.put(data, key);

    await requestToPromise(request);
}

export async function loadFromIDB(key) {
    try {
        const database = await openDB();
        const transaction = database.transaction([STORE_NAME], 'readonly');
        const store = transaction.objectStore(STORE_NAME);

        const request = store.get(key);
        const result = await requestToPromise(request);

        return result || null; // Return null if undefined/not found
    } catch (error) {
        console.error("Failed to load from IDB:", error);
        return null;
    }
}


//Clears specific content items and the version from IndexedDB.
export async function clearIDBData() {
    try {
        const database = await openDB();
        const transaction = database.transaction([STORE_NAME], 'readwrite');
        const store = transaction.objectStore(STORE_NAME);

        // Delete 'QURAN_CONTENT' and the 'CONTENT_VERSION' key
        await requestToPromise(store.delete('QURAN_CONTENT'));
        await requestToPromise(store.delete('CONTENT_VERSION'));

        console.log('IDB cleared.');

    } catch (error) {
        console.error("Failed to clear IDB data:", error);
    }
}