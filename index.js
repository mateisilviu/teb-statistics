const fetch = require('node-fetch');
const functions = require('@google-cloud/functions-framework');
const escapeHtml = require('escape-html');
const cheerio = require('cheerio');

var TermoModel = require('./src/core/termo-model.js');
const NodeGeocoder = require('node-geocoder');
const { Firestore } = require('@google-cloud/firestore');

// Create a new client
const firestore = new Firestore();

var sector = 0;

const timestamp = Date.now();
const todayStatistics = [];
var rowStatistics = [];

/**
 * Responds to an HTTP request using data from the request body parsed according
 * to the "content-type" header.
 *
 * @param {Object} req Cloud Function request context.
 * @param {Object} res Cloud Function response context.
 */
functions.http('helloHttp', async (req, res) => {

    res.send(`Hello ${escapeHtml(req.query.name || req.body.name || 'World')}!`);
});



async function geocodeTEB(address) {

    const options = {
        provider: 'google',

        // Optional depending on the providers
        //fetch: customFetchImplementation,
        apiKey: 'AIzaSyCtiocjASKs9ShtzcqeklOfQgfzVGT_IeA', // for Mapquest, OpenCage, Google Premier
        formatter: null // 'gpx', 'string', ...
    };

    const geocoder = NodeGeocoder(options);

    // Using callback
    //console.log(address);
    const res = await geocoder.geocode(address + ", Bucuresti");
    //console.log(res);
    return res;
}



async function getGeocodeFromDB(address) {
    // Obtain a document reference.
    const document = firestore.collection('bucharest').doc(address);

    const doc = await document.get();
    if (!doc.exists) {
        console.log('No such document for ' + address);
        geocode = await geocodeTEB(address);
        setGeocodeToDB(address, geocode);
        return geocode;
    } else {
        console.log('Document data:', doc.data());
        return doc.data();
    }
}

async function setGeocodeToDB(address, geocode) {
    // Obtain a document reference.
    const document = firestore.collection('bucharest').doc(address);

    // Enter new data into the document.
    await document.set({
        geocode: geocode
    });
    console.log('Entered ' + address + ' data into the document');
}

async function insertTermoModelToDB(termoModel) {
    console.log(timestamp);
    // Obtain a document reference.
    const document = firestore.collection('teb').doc("teb" + timestamp);

    await document.set({
        termoModel: termoModel
    });
}

async function getTEBHTML() {
    const response = await fetch('https://www.cmteb.ro/functionare_sistem_termoficare.php');
    var body = await response.text();
    body = body.replaceAll("<br>", "</br>");
    const $ = cheerio.load(body);
    // console.log($('#ST > div > table').text());
    var cellBlocuri = 0;
    var divST = $('#ST > div > table').find('td');
    for (var i = 0; i < divST.length; i++) {
        // console.log(divST[i]);
        var issueType;
        var cause;
        var date;

        td = divST[i];
        switch (cellBlocuri) {
            case 0: {
                await extractSector(td);
            } break;
            case 1: {
                if (sector == 1) {
                    await extractBlocuri(td);
                }
            } break;
            case 2: {
                issueType = await extractTypeIssue(td);
            }; break;
            case 3: {
                cause = await extractCause(td);
            }; break;
            case 4: {
                date = await extractDate(td);
                cellBlocuri = -1;
                rowStatistics.forEach(termoModel => {
                    termoModel.setSector(sector);
                    termoModel.setAlertType(issueType);
                    termoModel.setCauseType(cause);
                    termoModel.setHourDate(date);
                    console.log("toMap:" + JSON.stringify(termoModel.toMap()));
                    todayStatistics.push(termoModel.toMap());
                });
                rowStatistics = [];
            } break;
        }
        cellBlocuri++;
    }
    /*.each(
        function (index, td) {

            
            // if (index < 5) {
            //     console.log(index);
            //     //console.log(td);
            //     //console.log($(this).text());
            // }

            switch (cellBlocuri) {
                case 0: {
                    extractSector(td,termoModel);
                } break;
                case 1: {
                    if (sector == 6) {
                       extractBlocuri(td,termoModel);
                    }
                } break;
                case 2: {
                    extractTypeIssue(td,termoModel);
                };break;
                case 3: {
                    extractCause(td, termoModel);
                };break;
                case 4: {
                    extractDate(td, termoModel);
                    cellBlocuri = -1;
                    termoModel = new TermoModel();
                } break;
            }
            cellBlocuri++;
        }
    );*/

    console.log("todayStatistics.length " + todayStatistics.length);
    insertTermoModelToDB(todayStatistics);
}

async function extractTypeIssue(td) {
    issueType = td.children[0].data;
    console.log("issueType :" + issueType);
    return issueType;
}

async function extractCause(td) {
    cause = td.children[0].data;
    console.log("cause :" + cause);
    return cause;
}

async function extractDate(td) {
    dateEstimated = td.children[0].data;
    console.log("dateEstimated :" + dateEstimated);
    return dateEstimated;
}

async function extractSector(td) {
    sector = td.children[0].data;
    console.log("sector :" + sector);
    //termoModel.setSector(sector);
}

async function extractBlocuri(td) {
    // zona afectata
    var punctTermic = td.children[1].children[0].data;
    var nrBlocuri = td.children[2].data.match(/(\d+)/)[0];
    console.log('punctTermic: ', punctTermic);
    console.log('nrBlocuri: ', nrBlocuri);
    k = 3;
    console.log('td.children.length: ', td.children.length);
    while (k < td.children.length) {
        var blocElement = td.children[k];
        if (blocElement.name === "strong") {
            // console.log(blocElement);
            punctTermic = blocElement.children[0].data;
            console.log('punctTermic2: ', punctTermic);
            k++;
            blocElement = td.children[k];
            nrBlocuri = blocElement.data.match(/(\d+)/)[0];
            console.log('nrBlocuri2: ', nrBlocuri);
        }
        if (blocElement.type.toString() === "text") {
            var innerText = blocElement.data;
            if (innerText.indexOf("Punct termic:") > 0) {
                console.log("am gasit punct termic");
            }
            else {
                var street = innerText.substring(innerText.indexOf("•") + 1, innerText.lastIndexOf("-"));
                street = replaceStreet(street);
                var blocuriText = innerText.substring(innerText.indexOf(" -") + 2).replace("bl.", "").trim();
                blocuriText = blocuriText.replaceAll(";", ",");
                console.log('street:', street.trim());
                if (street.trim().length > 3) {
                    var blocuri = blocuriText.split(',');
                    for (var bloc of blocuri) {
                        bloc = bloc.trim();
                        if (bloc.length > 1) {
                            console.log('bloc:', bloc);
                            termoModel = new TermoModel();
                            termoModel.setTermicPoint(punctTermic);
                            termoModel.setStreet(street);
                            termoModel.setFlat(bloc);
                            const completeAddress = "bloc " + bloc + ", " + street;
                            geocoded = await getGeocodeFromDB(completeAddress);
                            termoModel.setGeocode(geocoded);

                            //insertTermoModelToDB(termoModel.toMap());
                            rowStatistics.push(termoModel);

                        }
                    }

                    /*
                    blocuri.forEach(async (element) => {
                        if (element.trim().length>1){
                            console.log('bloc:', element.trim());
                            termoModel.setTermicPoint(punctTermic);
                            termoModel.setStreet(street);
                            termoModel.setFlat(element.trim());
                            var geocoded = await geocodeTEB(street + ", " + element.trim() );
                            termoModel.setGeocode(geocoded);
                        }
                        
                    });*/
                }
            }

        }
        k++;
    }
}

function replaceStreet(street) {
    if (street.includes('Str ')) {
        return street.replace('Str ', 'Strada ');
    }
    if (street.includes('Bld ')) {
        return street.replace('Bld ', 'Bulevardul ');
    }
    if (street.includes('Ale ')) {
        return street.replace('Ale ', 'Aleea ');
    }
    if (street.includes('Cal ')) {
        return street.replace('Cal ', 'Calea ');
    }
    if (street.includes('Şos ')) {
        return street.replace('Şos ', 'Şoseaua ');
    }
    if (street.includes('Sos ')) {
        return street.replace('Sos ', 'Soseaua ');
    }
    return street;
}


// setGeocodeToDB('Bloc 27B, Strada Constantin Rădulescu-Motru 12', "geocodee");
// getGeocodeFromDB('Bloc 27B, Strada Constantin Rădulescu-Motru 12')


// quickstartMaps();
getTEBHTML();