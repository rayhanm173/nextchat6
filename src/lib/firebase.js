// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import {getFirestore} from 'firebase/firestore'
import { getStorage } from "firebase/storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyADvwf98ecI0AXjMsXt1VkaYabCGZNJMGY",
  authDomain: "nextchat-85530.firebaseapp.com",
  projectId: "nextchat-85530",
  storageBucket: "nextchat-85530.appspot.com",
  messagingSenderId: "31449878034",
  appId: "1:31449878034:web:ee62173735ff91c6df92cb"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db= getFirestore()
export const storage= getStorage() 