// eslint-disable-next-line no-undef
importScripts('https://www.gstatic.com/firebasejs/9.4.0/firebase-app.js');
// eslint-disable-next-line no-undef
importScripts('https://www.gstatic.com/firebasejs/9.4.0/firebase-messaging.js');

// eslint-disable-next-line no-undef
firebase.initializeApp({
    apiKey: "AIzaSyChT2qJ_DLUmzRJtxtrDw8_NsWY3gxxsLY",
    authDomain: "send-notification-6c563.firebaseapp.com",
    projectId: "send-notification-6c563",
    storageBucket: "send-notification-6c563.appspot.com",
    messagingSenderId: "18330650812",
    appId: "1:18330650812:web:74f0cd657a3de8fde168b9",
    measurementId: "G-5GPNQD1D43"
    // Note: Ensure these values are replaced with your Firebase project's configuration.
});

console.log('klk execute')

const messaging = firebase.messaging();