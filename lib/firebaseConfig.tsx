// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth"
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDDlY2LfyZXIbDZIrD1dZHxMtLFLQcKoJA",
  authDomain: "ictpiwebsite.firebaseapp.com",
  projectId: "ictpiwebsite",
  storageBucket: "ictpiwebsite.firebasestorage.app",
  messagingSenderId: "25459124721",
  appId: "1:25459124721:web:427d286041a1cf455fbc50",
  measurementId: "G-S6DDZKK6LH"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth=getAuth(app);


export {auth,app};