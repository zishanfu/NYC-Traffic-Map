# NYC-Balancing-Traffic-Routing
This repository visualize traffic of Yellow Taxi Trip Data. [Link](https://nycrouting.herokuapp.com/)

### Raw Data
Raw data is generated from [Socrata Developers](https://data.cityofnewyork.us/view/ba8s-jw6u) API. 
API like this: `https://data.cityofnewyork.us/resource/2yzn-sicd.json`
Filter and save data in this structure:
| pickup_datetime | pickup_latitude | pickup_longitude | dropoff_latitude | dropoff_longitude |
| --------------- |:---------------:| ----------------:|:----------------:| -----------------:|
| Date            | String          | String           | String           | String            |
Data size: 933 rows

### Routes Data
Using trip data above, searching routes based on open map services [mapquest] (https://developer.mapquest.com/).
API like this: `http://www.mapquestapi.com/directions/v2/alternateroutes key=KEY&from=Denver,CO&to=Golden,CO&maxRoutes=2&timeOverage=100`
User can specify the max number of alternate routes and percentage of the time overage.
Reconstruct and save data in this structure:
```{
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
}
```
Data size: 932 rows
Begintime is same as pickup_datetime and it regard as the reference for the time taxi in certain street. Caculating InStreetTime based on begintime and the timeInterval in this streets.

### Streets Data
Using routes data above, select first route and aggregate data in certain date range to visualize taffic.(How many taxi in the street)
Data structure:
```
{
    InStreetTime:Date,
    streets:[{
        type: String
    }],
    startPoint:{
        lng: String,
        lat: String
    }
}
```
Data size: 6543 rows

### Traffic Map

### Routes Table

