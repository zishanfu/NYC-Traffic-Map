var express = require("express"),
    app = express(),
    bodyParser  = require("body-parser"),
    mongoose    = require("mongoose"),
    request = require("request"),
    async = require('async'),
    rawData = require("./models/rawdata"),
    dataWithRoutes = require("./models/routes"),
    streetsData = require("./models/streets"),
    seedDB = require("./seeds");

//seedDB();
mongoose.Promise = global.Promise;
//mongoose.connect("mongodb://localhost/nyc_routing");
mongoose.connect("mongodb://zf:thesis@ds125618.mlab.com:25618/nycrouting");
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));

app.get("/", function(req, res){
    res.render("landing");
});

app.get("/data", function(req, res){
    var routes = dataWithRoutes.find({}).sort({'pickup_datetime': 1});
    var defaultBegin = new Date("2015-12-31T23:30:03Z").toISOString();
    var defaultEnd = new Date("2016-01-01T00:01:00Z").toISOString();
    var streets = streetsData.aggregate([{$match:{InStreetTime: { $gte: new Date(defaultBegin), $lte: new Date(defaultEnd)}}}, {$group: { _id: {"streets": "$streets", "startPoint": "$startPoint"}, count: {$sum: {"$size": "$streets"}}}}]);
    var resources = {
        routes: routes.exec.bind(routes),
        streets: streets.exec.bind(streets)
    };
    async.parallel(resources, function (error, results){
        if (error) {
            res.status(500).send(error);
            return;
        }
        res.render("index", results);
    });
});

app.post("/map", function(req, res) {
    var routes = dataWithRoutes.find({}).sort({'pickup_datetime': 1});
    var begin = new Date(req.body.begin).toISOString();
    var end = new Date(req.body.end).toISOString();
    var streets = streetsData.aggregate([{$match:{InStreetTime: { $gte: new Date(begin), $lte: new Date(end)}}}, {$group: { _id: {"streets": "$streets", "startPoint": "$startPoint"}, count: {$sum: {"$size": "$streets"}}}}]);
    var resources = {
        routes: routes.exec.bind(routes),
        streets: streets.exec.bind(streets)
    };
    async.parallel(resources, function (error, results){
        if (error) {
            res.status(500).send(error);
            return;
        }
        res.render("index", results);
    });
})

app.listen(process.env.PORT, process.env.IP, function(){
    console.log("The VisNYC Server Has Started!");
});
    