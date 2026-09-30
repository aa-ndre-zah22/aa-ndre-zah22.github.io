const firebaseConfig = {
  apiKey: "AIzaSyBmJe6zIV2hZTSwjrPJCf0awByEzufCGSY",
  authDomain: "ring-a-bell-4593a.firebaseapp.com",
  projectId: "ring-a-bell-4593a",
  storageBucket: "ring-a-bell-4593a.firebasestorage.app",
  messagingSenderId: "358771324071",
  appId: "1:358771324071:web:97a8ebf7910f53b90f1782",
  measurementId: "G-6ZPLV4V903",
};

firebase.initializeApp(firebaseConfig);
window.auth = firebase.auth();
window.db = firebase.firestore();
