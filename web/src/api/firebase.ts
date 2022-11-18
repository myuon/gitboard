import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyD2MeK8VyY1ywRMjwF4rX16X7yUoiMsyvo",
  authDomain: "keys4-ebdd8.firebaseapp.com",
  projectId: "keys4-ebdd8",
  storageBucket: "keys4-ebdd8.appspot.com",
  messagingSenderId: "992824461113",
  appId: "1:992824461113:web:e943dcd300a24fd2f74ae8",
  measurementId: "G-PJK9S9PM8V",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
