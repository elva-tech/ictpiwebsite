// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth"
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAV34h82OAX5MaRJtQOOOY_hYmio13Foso",
  authDomain: "ictpiwebsite-90b76.firebaseapp.com",
  projectId: "ictpiwebsite-90b76",
  storageBucket: "ictpiwebsite-90b76.firebasestorage.app",
  messagingSenderId: "171268728879",
  appId: "1:171268728879:web:ce2456338b3794019bfeda",
  measurementId: "G-ELZRQSTEBS"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth=getAuth(app);


export {auth,app};