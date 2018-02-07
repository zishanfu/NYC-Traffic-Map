var mongoose = require("mongoose");

var routesSchema = new mongoose.Schema({
    pickup_datetime: String,
    pickup_latitude: String,
    pickup_longitude: String,
    dropoff_latitude: String,
    dropoff_longitude: String,
    routes:[
        {
            distance: String,
            timeInterval: String,
            beginTime: Date,
            legs:[
                {
                    distance: String,
                    streets: [{
                    	type: String
                    }],
                    startPoint:{
                        lng: String,
                        lat: String
                    },
                    timeInterval: String,
                    InStreetTime: Date
                }    
            ]
        }
    ]
});

module.exports = mongoose.model("routes", routesSchema);