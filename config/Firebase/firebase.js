import * as firebase from "firebase";
import "firebase/auth";
import "firebase/firestore";
import firebaseConfig from "./firebaseConfig";

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
            .doc(userData.UserId)
            .set(userData);
    },
    getCurrentUserData: () => {
        let currentUser = firebase.auth().currentUser.uid;
        return firebase
            .firestore()
            .collection("UserDetails")
            .doc(currentUser)
            .get();
    },
    setCurrentUserData: (data) => {
        let currentUser = firebase.auth().currentUser.uid;
        firebase
            .firestore()
            .collection("UserDetails")
            .doc(currentUser)
            .set(data);
    },
    // setField: (field, data) => {
    //     async function dothis(field, data) {
    //         let currentUser = firebase.auth().currentUser.uid;
    //         let obj = await firebase
    //             .firestore()
    //             .collection("UserDetails")
    //             .doc(currentUser)
    //             .get()
    //             .data();
    //         obj[field] = data;
    //         firebase
    //             .firestore()
    //             .collection("UserDetails")
    //             .doc(currentUser)
    //             .set(data);
    //     }
    //     return dothis(field, data);
    // },
    getUserId: () => {
        return firebase.auth().currentUser.uid;
    },
    firebase: firebase,
};

export default Firebase;