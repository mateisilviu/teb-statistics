//const firebase = require("firebase");
// Required for side-effects
//require("firebase/firestore");
import { initializeApp } from 'firebase/app';

let map;

function initMap() {
    const homeCoordonates = { lat: 44.45, lng: 26.09 };
    map = new google.maps.Map(document.getElementById("map"), {
        center: homeCoordonates,
        zoom: 12,
    });

    new google.maps.Marker({
        position: { lat: 44.475252, lng: 26.091441 },
        map,
        title: "Hello World!",
    });
}

function initFirestore() {
    // Initialize Firestore through Firebase
    firebase.initializeApp({
        apiKey: '### FIREBASE API KEY ###',
        authDomain: '### FIREBASE AUTH DOMAIN ###',
        projectId: '### CLOUD FIRESTORE PROJECT ID ###'
    });

    var db = firebase.firestore();
}

window.initMap = initMap;
