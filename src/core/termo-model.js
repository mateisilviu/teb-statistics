function TermoModel(sector, termicPoint, street, flat, geocode, alertType, causeType, hourDate){
    this.sector = sector || null;
    this.termicPoint = termicPoint || null;
    this.street = street || null;
    this.flat = flat || null;
    this.geocode = geocode || null;
    this.alertType = alertType || null;
    this.causeType = causeType || null;
    this.hourDate = hourDate || null;
}

function TermoModel(copyFrom){
    if (copyFrom instanceof TermoModel){
        this.sector = copyFrom.sector;
        this.termicPoint = copyFrom.termicPoint;
        this.street = copyFrom.street;
        this.flat = copyFrom.flat;
        this.geocode = copyFrom.geocode;
        this.alertType = copyFrom.alertType;
        this.causeType = copyFrom.causeType;
        this.hourDate = copyFrom.hourDate;
    }
    
}

TermoModel.prototype.setSector = function(sector){
    this.sector = sector;
}

TermoModel.prototype.setTermicPoint = function(termicPoint){
    this.termicPoint = termicPoint;
}

TermoModel.prototype.setStreet = function (street) {
    this.street = street;
}

TermoModel.prototype.setFlat = function (flat){
    this.flat = flat;
}

TermoModel.prototype.setGeocode = function (geocode) {
    this.geocode = geocode;
}

TermoModel.prototype.setAlertType = function (alertType) {
    this.alertType = alertType;
}

TermoModel.prototype.setCauseType = function (causeType) {
    this.causeType = causeType;
}

TermoModel.prototype.setHourDate = function (hourDate) {
    this.hourDate = hourDate;
}

TermoModel.prototype.getStreetAndFlat = function (){
    return "Bloc " + this.flat + " Strada " + this.street + ", Bucharest";
}

TermoModel.prototype.toMap = function(){
    return {
        'sector' : this.sector,
        'termicPoint' : this.termicPoint,
        'street' : this.street,
        'flat' : this.flat,
        'geocode' : this.geocode,
        'alertType' : this.alertType,
        'causeType' : this.causeType,
        'hourDate' : this.hourDate
    }
}

module.exports = TermoModel;