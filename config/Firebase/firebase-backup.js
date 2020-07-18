import * as firebase from "firebase";
import "firebase/auth";
import "firebase/firestore";
import firebaseConfig from "./firebaseConfig.js";

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

const Firebase = {
    // auth
    loginWithEmail: (email, password) => {
        return firebase.auth().signInWithEmailAndPassword(email, password);
    },
    signupWithEmail: (email, password) => {
        return firebase.auth().createUserWithEmailAndPassword(email, password);
    },
    signOut: () => {
        return firebase.auth().signOut();
    },
    checkUserAuth: (user) => {
        return firebase.auth().onAuthStateChanged(user);
    },
    passwordReset: (email) => {
        return firebase.auth().sendPasswordResetEmail(email);
    },
    // firestore
    createNewUser: (userData) => {
        return firebase
            .firestore()
            .collection("UserDetails")
            .doc(`${userData.UserId}`)
            .set(userData);
    },
    getCurrentUserData: async () => {
        let currentUser = firebase.auth().currentUser.uid;
        return await firebase
            .firestore()
            .collection("UserDetails")
            .doc(currentUser)
            .get()
            .data();
    },
    firebase: firebase,
};

export default Firebase;
