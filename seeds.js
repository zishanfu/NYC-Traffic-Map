var mongoose= require("mongoose");
var request = require("request");
var rawData = require("./models/rawdata");
var dataWithRoutes = require("./models/routes");
var streetsData = require("./models/streets");

var sodaUrl = "https://data.cityofnewyork.us/resource/2yzn-sicd.json?$query=SELECT pickup_longitude, pickup_latitude, dropoff_longitude, dropoff_latitude, pickup_datetime WHERE pickup_datetime between '2015-12-31T23:30:00' and '2015-12-31T23:33:00' AND pickup_latitude>40.5 and pickup_latitude<40.9 AND dropoff_longitude<-73.7 and dropoff_longitude>-74.25";
var routeUrl = "https://www.mapquestapi.com/directions/v2/alternateroutes?key=PXTeWUmAT1TdOabKuunTGgQUMq0Pnzlb&path&outFormat=json&ambiguities=ignore&routeType=fastest&maxRoutes=3&timeOverage=25&doReverseGeocode=false&enhancedNarrative=false&avoidTimedConditions=false&unit=M"

function replacer(url, str){
    var newStr = url.replace(/path/i, str);
    return newStr;
}

function addTime(time, min, sec){
    time.setMinutes ( time.getMinutes() + min);
    time.setSeconds(time.getSeconds() + sec);
    //return time.toISOString();
    return time;
}

function getRoute(base, pickup_datetime){
      var newLegs = [];
      var routeInfo = base.legs[0].maneuvers;
      var beforeTime = new Date(pickup_datetime);
      routeInfo.forEach(function(r){
            var time = r.formattedTime;
            var timeArr = time.split(":");
            var inStreetTime = addTime(beforeTime, Number(timeArr[1]), Number(timeArr[2]));
            var middlePoint = {distance: r.distance, streets: r.streets, startPoint: r.startPoint, timeInterval: time, InStreetTime: inStreetTime};
            newLegs.push(middlePoint);
            beforeTime = new Date(inStreetTime);
      });
      var route = {distance:base.distance, timeInterval: base.formattedTime, 
            beginTime: pickup_datetime, legs: newLegs};
      return route;
}

function constructRoute(body, pickup_datetime){
      var routes = [];
      var firstRoute = body.route;
      var structured_firstRoute = getRoute(firstRoute, pickup_datetime);
      routes.push(structured_firstRoute);

      var alternateRoutesInfo = body.route.alternateRoutes;
      if(typeof alternateRoutesInfo === "undefined") return routes;
      alternateRoutesInfo.forEach(function(alternateR){
            var alternateRoute = alternateR.route;
            var structured_alternateRoute = getRoute(alternateRoute, pickup_datetime);
            routes.push(structured_alternateRoute);
      });
      return routes;
}

function findRoutes(oneRecord){
    var pickup_latitude   = oneRecord.pickup_latitude,
        pickup_longitude  = oneRecord.pickup_longitude,
        pickup_datetime   = oneRecord.pickup_datetime,
        dropoff_latitude  = oneRecord.dropoff_latitude,
        dropoff_longitude = oneRecord.dropoff_longitude;
        var coor = "from=" + pickup_latitude + "%2C" + pickup_longitude + "&to=" + dropoff_latitude + "%2C" + dropoff_longitude;
        var newRouteUrl = replacer(routeUrl, coor);
    request({
        url: newRouteUrl,
        json: true
    }, function (error, response, body) {
        if (!error && response.statusCode === 200) {
            var routes = constructRoute(body, pickup_datetime);
            var newRoute = {
                pickup_datetime: pickup_datetime,
                pickup_latitude: pickup_latitude,
                pickup_longitude: pickup_longitude,
                dropoff_latitude: dropoff_latitude,
                dropoff_longitude: dropoff_longitude,
                routes: routes
            };
            console.log(newRoute);
            dataWithRoutes.create(newRoute, function(err, newlyCreated){
                if(err){
                    console.log(err);
                }else{
                    console.log(newlyCreated);
                }
            });
        }
    });
}


function seedDB(){
    request({
        url: sodaUrl,
        json: true
    }, function (error, response, body) {
        if (!error && response.statusCode === 200) {
            rawData.remove({}, function(err){
                if(err){
                    console.log(err);
                }
                console.log("removed rawData!");
             });
            rawData.create(body, function(err, doc){
                if(err) throw err;
                console.log("create rawData!");
                rawData.find({}).sort({'pickup_datetime': 1}).exec(function(err, records){
                    if(err){
                        console.log(err);
                    }else{
                        records.forEach(function(record){
                            findRoutes(record);
                            console.log("Create routes database!");
                            dataWithRoutes.find().exec(function(err, AlldataWithRoutes){
                                if(err){
                                    console.log(err);
                                }else{
                                    var data = AlldataWithRoutes[0];
                                    AlldataWithRoutes.forEach(function(data){
                                        var route = data.routes[0];
                                        var legs = route.legs;
                                        var leg = legs[0];
                                        legs.forEach(function(leg){
                                            var streets = {
                                                InStreetTime: leg.InStreetTime,
                                                streets: leg.streets,
                                                startPoint: leg.startPoint
                                            };
                                            streetsData.create(streets, function(err, newlyCreated){
                                                if(err) throw err;
                                                console.log(newlyCreated);
                                            })
                                        })
                                    })
                                }
                            });
                        })
                    }
                });
            });
        }
    });
}

module.exports = seedDB;
