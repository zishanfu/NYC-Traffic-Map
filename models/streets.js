var mongoose = require("mongoose");

var streetsSchema = new mongoose.Schema({
    InStreetTime:Date,
    streets:[{
        type: String
    }],
    startPoint:{
        lng: String,
        lat: String
    }
});

module.exports = mongoose.model("streets", streetsSchema)