// Importa las funciones que necesitas de los SDKs
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

// Tu configuración de la app web de Firebase que ya proporcionaste
const firebaseConfig = {
  apiKey: "AIzaSyDJodCJmwrDJ36b8iQaQLJvLSXHS1CtXK4",
  authDomain: "rifa-c2fd6.firebaseapp.com",
  projectId: "rifa-c2fd6",
  storageBucket: "rifa-c2fd6.appspot.com",
  messagingSenderId: "1060448290328",
  appId: "1:1060448290328:web:aa9b7803d3c1714a5de56d",
  measurementId: "G-9VBSBPD4F2"
};

// Inicializa Firebase
const app = initializeApp(firebaseConfig);

// Exporta la instancia de Firestore para que otros componentes puedan usarla
export const db = getFirestore(app);
// Exporta Auth y Google provider
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
