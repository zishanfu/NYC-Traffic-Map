var mongoose = require("mongoose");

var rawdataSchema = new mongoose.Schema({
    pickup_datetime: Date,
    pickup_latitude: String,
    pickup_longitude: String,
    dropoff_latitude: String,
    dropoff_longitude: String
});

module.exports = mongoose.model("rawData", rawdataSchema)