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
async function getAlerts() {
    const citiesCol = collection(db, 'teb');
    const citySnapshot = await getDocs(citiesCol);
    const cityList = citySnapshot.docs.map(doc => doc.data());
    //console.log(cityList);
    return cityList;
}

let map;

function initMap() {
    const homeCoordonates = { lat: 44.45, lng: 26.09 };
    map = new google.maps.Map(document.getElementById("map"), {
        center: homeCoordonates,
        zoom: 12,
    });

    const alertsList = getAlerts();

    alertsList.then(function (value) {
        //console.log("value : " + value);
        console.log("value.length" + value.length);
        value.forEach(
            element => {
                console.log("element.termoModel.length" + element.termoModel.length);
                element.termoModel.forEach(termoModel => {
                    // console.log(termoModel);
                    var googleGeocode = termoModel.geocode[0];
                    //console.log(googleGeocode);
                    if (googleGeocode !== undefined) {
                        console.log(googleGeocode.latitude + " " + googleGeocode.longitude);
                        const marker = new google.maps.Marker({
                            position: { lat: googleGeocode.latitude, lng: googleGeocode.longitude },
                            map,
                            label: "Bloc " + termoModel.flat,
                            icon: getIconTypeBasedOnIssueType(termoModel.alertType)
                        });
                        const infowindow = getInfoWindow(termoModel);
                        marker.addListener("click", () => {
                            infowindow.open({
                                anchor: marker,
                                map,
                            });
                        });
                    }

                })
            }
        )

    },
        function (error) {
            console.log("error");
        }
    )


}

function getInfoWindow(termoModel) {
    var alertType = termoModel.alertType.replace("ACC", "Apă Caldă de Consum");
    alertType = termoModel.alertType.replace("INC", "Încălzire");
    const contentInfoWindow = '<div id="infoWindoContent"><h3>' + alertType + '</h3><p>' + termoModel.causeType + '</p><p>' + termoModel.hourDate + '</p></div>';
    const infowindow = new google.maps.InfoWindow({
        content: contentInfoWindow,
    });
    return infowindow;
}

function getIconTypeBasedOnIssueType(alertType) {
    if (alertType.includes("Oprire")) {
        return "http://maps.gstatic.com/mapfiles/ms2/micons/red.png";
    }
    if (alertType.includes("Deficienta")) {
        return "http://maps.gstatic.com/mapfiles/ms2/micons/yellow.png";
    }
}

window.initMap = initMap;