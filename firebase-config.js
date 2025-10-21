// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyCmSEtYvL0PSkwk5FmDwpdfF908IA9NAVA",
    authDomain: "database62-e9ae4.firebaseapp.com",
    databaseURL: "https://database62-e9ae4-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "database62-e9ae4",
    storageBucket: "database62-e9ae4.firebasestorage.app",
    messagingSenderId: "25520417785",
    appId: "1:25520417785:web:b4b2c81aa5423120f6eb28"
};

// Initialize Firebase
let database;
let app;

try {
    // Cek apakah Firebase sudah diinisialisasi
    if (!firebase.apps.length) {
        app = firebase.initializeApp(firebaseConfig);
    } else {
        app = firebase.app();
    }
    
    database = firebase.database();
    console.log('✅ Firebase initialized successfully');
    
    // Setup error handling untuk database
    database.ref('.info/connected').on('value', (snapshot) => {
        if (snapshot.val() === true) {
            console.log('✅ Connected to Firebase Database');
        } else {
            console.log('❌ Disconnected from Firebase Database');
        }
    });
    
} catch (error) {
    console.error('❌ Firebase initialization error:', error);
}

// Fungsi untuk anonymous authentication dengan retry
function initializeFirebaseAuth() {
    return new Promise((resolve, reject) => {
        firebase.auth().signInAnonymously()
            .then(() => {
                console.log('✅ Anonymous authentication successful');
                resolve(true);
            })
            .catch((error) => {
                console.error('❌ Anonymous auth failed:', error);
                // Tetap resolve agar aplikasi bisa berjalan
                resolve(true);
            });
    });
}

// Initialize auth ketika page load
document.addEventListener('DOMContentLoaded', function() {
    initializeFirebaseAuth().then(() => {
        console.log('✅ Firebase auth initialized');
    });
});

// Export untuk penggunaan di file lain
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { database, firebaseConfig };
}