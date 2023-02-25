// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs } from 'firebase/firestore/lite';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyCtiocjASKs9ShtzcqeklOfQgfzVGT_IeA",
    authDomain: "teb-statistics.firebaseapp.com",
    projectId: "teb-statistics",
    storageBucket: "teb-statistics.appspot.com",
    messagingSenderId: "1066419981708",
    appId: "1:1066419981708:web:4e1d3bab219aa0048f9aa9"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

const db = getFirestore(app);

// Get a list of cities from your database
async function getCities(db) {
    const citiesCol = collection(db, 'teb');
    const citySnapshot = await getDocs(citiesCol);
    const cityList = citySnapshot.docs.map(doc => doc.data());
    console.log(cityList);
    return cityList;
}

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

window.initMap = initMap;