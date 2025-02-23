import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
const firebaseConfig = {

    apiKey: "AIzaSyCZj9DhV1tHxmJMMAs6yzFDtun-ajM4Ejk",
  
    authDomain: "store-819a9.firebaseapp.com",
  
    projectId: "store-819a9",
  
    storageBucket: "store-819a9.firebasestorage.app",
  
    messagingSenderId: "846427011938",
  
    appId: "1:846427011938:web:dba5235e6eb20ae4978a3b",
  
    measurementId: "G-ZM1R103HRM"
  
  };
  

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };
