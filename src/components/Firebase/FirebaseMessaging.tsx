import React, {useEffect, useState} from 'react';
import {initializeApp } from 'firebase/app';
import { getMessaging, getToken } from "firebase/messaging";


const FirebaseMessaging = () => {
    const [permission, setPermission] = useState(Notification.permission as any);

    useEffect(() => {
        // Check if the browser supports notifications
        if (!("Notification" in (window as any))) {
            alert("This browser does not support desktop notification");
        }
        // Else, we need to ask for permission
        else if (Notification.permission !== "denied") {
            Notification.requestPermission().then(permission => {
                console.log('permission', permission);
                setPermission(permission);
            });
        }
    }, []);


    const requestForToken = (app: any) => {
        const messaging = getMessaging(app);
        return getToken(messaging, { vapidKey: 'BGYfT0YnPvRzECB-FBLnitSuXFZoZa7KrxeQAVoL_sMUFNGCKdGYJwdmpNiVJpvGFz4Ow0gIEIMGSSEjUusUFTU' }) // Your web push certificate key pair from the Firebase console
            .then((currentToken) => {
                if (currentToken) {
                    console.log('Token:', currentToken);

                    // Send the token to your server and update the UI if necessary
                    // ...
                } else {
                    console.log('No registration token available. Request permission to generate one.');
                    // Shows a request permission UI
                }

                return currentToken;

            }).catch((err) => {
                console.log('An error occurred while retrieving token. ', err);
                // Handle error
            });
    };


    const initializeFirebaseMessaging = async () => {
        try {
            // Initialize Firebase app with your Firebase configuration
            const firebaseConfig = {
                apiKey: "AIzaSyChT2qJ_DLUmzRJtxtrDw8_NsWY3gxxsLY",
                authDomain: "send-notification-6c563.firebaseapp.com",
                projectId: "send-notification-6c563",
                storageBucket: "send-notification-6c563.appspot.com",
                messagingSenderId: "18330650812",
                appId: "1:18330650812:web:74f0cd657a3de8fde168b9",
                measurementId: "G-5GPNQD1D43"
            };

            const app = await initializeApp(firebaseConfig);

            const token = await requestForToken(app);
            console.log('token', token);
            // Get the Firebase Cloud Messaging (FCM) token

        } catch (error) {
            console.error("Error initializing Firebase Messaging:", error);
        }
    };


    useEffect(() => {

        initializeFirebaseMessaging();

    }, [permission]);

    return (
        <div>
            {/* Your React component content */}
        </div>
    );
};

export default FirebaseMessaging;
