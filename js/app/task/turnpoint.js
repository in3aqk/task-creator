/**
 * @file
 * Task turnpoint module for the task creator.
 */
define(['app/param', 'app/geoCalc', 'waypoints/waypoint', 'app/geoCalc'], function (param, geoCalc, Waypoint, geoCalc) {


  // function drawSector(lat, lng, r, azimuth, width,map) { 
  //   var centerPoint = new google.maps.LatLng(lat, lng); 
  //   var PRlat = (r/3963) * (180 / Math.PI); // using 3963 miles as earth's radius 
  //   var PRlng = PRlat/Math.cos(lat*((Math.PI / 180))); 
  //   var PGpoints = []; 
  //   PGpoints.push(centerPoint); 
  //   with (Math) { 
  //     lat1 = lat + (PRlat * cos( ((Math.PI / 180)) * (azimuth  - width/2 ))); 
  //     lon1 = lng + (PRlng * sin( ((Math.PI / 180)) * (azimuth  - width/2 ))); 
  //     PGpoints.push( new google.maps.LatLng(lat1,lon1)); 
  //     lat2 = lat + (PRlat * cos( ((Math.PI / 180)) * (azimuth  + width/2 ))); 
  //     lon2 = lng + (PRlng * sin( ((Math.PI / 180)) * (azimuth  + width/2 ))); 
  //     var theta = 0; 
  //     var gamma = ((Math.PI / 180)) * (azimuth  + width/2 ); 
  //     for (var a = 1; theta < gamma ; a++ ) { 
  //     theta = ((Math.PI / 180)) * (azimuth  - width/2 +a); 
  //     PGlon = lng + (PRlng * sin( theta )); 
  //     PGlat = lat + (PRlat * cos( theta )); 
  //     PGpoints.push(new google.maps.LatLng(PGlat,PGlon)); 
  //   }
  //   PGpoints.push( new google.maps.LatLng(lat2,lon2)); 
  //   PGpoints.push(centerPoint);
  // } 
  //   var poly = new google.maps.Polygon({
  //     path:PGpoints,
  //     strokeColor: '#4B0082',
  //     strokeOpacity: .2,
  //     map: map
  //   });
  //   poly.setMap(map);
  //   return poly; 
  // } 
  class Turnpoint {
    
    constructor(waypoint) {
      //var turnpoints = require('task/task').getTurnpoints();
      //console.log("Task turnpoint module for the task creator ",turnpoints.length);
      if (!waypoint)
        return;
      // Inherit from the base waypoint.
      Waypoint.apply(this, arguments);
      this.index = 0;
      this.type = param.turnpoint.default.type;
      this.radius = param.turnpoint.default.radius;
      this.mode = param.turnpoint.default.mode;
      this.icon = param.turnpoint.icon[this.type];
      this.shortName = param.turnpoint.shortName[this.type];
      this.xctrackName = param.turnpoint.xctrackName[this.type];
      this.open = 0;
      this.close = 0;
      this.fillColor = param.turnpoint.fillColor[this.type];
      this.goalType = param.turnpoint.default.goalType;
      this.mapElement = false;
      this.setTurnpoint = function (turnpointInfo) {
        for (var element in turnpointInfo) {
          this[element] = turnpointInfo[element];
        }
        this.icon = param.turnpoint.icon[this.type];
        this.shortName = param.turnpoint.shortName[this.type];
        this.xctrackName = param.turnpoint.xctrackName[this.type];
        this.fillColor = param.turnpoint.fillColor[this.type];
      };
      this.generateKML = function () {
        var output = "";
        var d2r = Math.PI / 180; // degrees to radians 
        var r2d = 180 / Math.PI; // radians to degrees 
        var earthsradius = 6378137; // 6378137 is the radius of the earth in meters
        var dir = 1; // clockwise
        var points = 64;
        // find the raidus in lat/lon 
        var rlat = (this.radius / earthsradius) * r2d;
        var rlng = rlat / Math.cos(this.latLng.lat() * d2r);
        var extp = new Array();
        if (dir == 1) {
          var start = 0;
          var end = points + 1;
        } // one extra here makes sure we connect the line
        else {
          var start = points + 1;
          var end = 0;
        }
        for (var j = start; (dir == 1 ? j < end : j > end); j = j + dir) {
          var theta = Math.PI * (j / (points / 2));
          ey = this.latLng.lng() + (rlng * Math.cos(theta)); // center a + radius x * cos(theta) 
          ex = this.latLng.lat() + (rlat * Math.sin(theta)); // center b + radius y * sin(theta) 
          output += (ey + "," + ex + ",0 ");
        }
        return output;
      };
      this.renderTurnpoint = function (google, map, turnpoints) {
        if (this.type != 'goal' || this.goalType != 'line') {
          let coords = [];
          for (let i = 0; i < param.option.circle_number_of_points; i++) {
            let angle = (360 / param.option.circle_number_of_points) * i;
            let p = geoCalc.computeOffset(this.latLng, this.radius, angle);
            coords.push({
              lat: p.lat(),
              lng: p.lng(),
            });
          }
          var circleOptions = {
            strokeColor: param.turnpoint.strokeColor[this.type],
            strokeOpacity: 0.8,
            strokeWeight: 2,
            fillColor: this.fillColor,
            fillOpacity: 0.35,
            center: this.latLng,
            map: map,
            marker: this.marker,
            turnpoint: this,
            paths: coords,
          };
          this.mapElement = new google.maps.Polygon(circleOptions);

          // var circleOptions = {
          //   strokeColor: param.turnpoint.strokeColor[this.type],
          //   strokeOpacity: 0.8,
          //   strokeWeight: 2,
          //   fillColor: this.fillColor,
          //   fillOpacity: 0.35,
          //   map: map,
          //   center: this.latLng,
          //   radius: parseInt(this.radius),
          //   marker: this.marker,
          //   turnpoint: this,
          // };
          //this.mapElement = new google.maps.Circle(circleOptions);
          
        }
        else {
          // Render goalLine.
          // Getting the heading of the last leg.
          var i = this.index - 1;
          var pastTurnpoint = turnpoints[i];
          while (i > 0 && pastTurnpoint.latLng == this.latLng) {
            i--;
            pastTurnpoint = turnpoints[i];
          }
          var lastLegHeading = geoCalc.computeHeading(pastTurnpoint.latLng, this.latLng);
          if (lastLegHeading < 0)
            lastLegHeading += 360;
          // Add 90° to this heading to have a perpendicular.
          var heading = lastLegHeading + 90;
          // Getting a first point 50m further. 
          var firstPoint = geoCalc.computeOffset(this.latLng, this.radius, heading);
          // Reversing the heading.
          heading += 180;
          // And now completing the line with a point 100m further.
          var secondPoint = geoCalc.computeOffset(firstPoint, 2 * this.radius, heading);
          //this.mapElement = drawSector(this.latLng.lat, this.latLng.lng, this.radius, heading, 180 ,map)
          //Building the line.
          this.mapElement = new google.maps.Polyline({
            path: [firstPoint, secondPoint],
            geodesic: true,
            strokeColor: param.turnpoint.strokeColor[this.type],
            strokeOpacity: 1.0,
            strokeWeight: 3,
            center: this.latLng,
            marker: this.marker,
            turnpoint: this,
            map: map,
          });
        }
        google.maps.event.addListener(this.mapElement, 'click', function () {
          this.marker.edit = true;
          this.marker.turnpoint = this.turnpoint;
          new google.maps.event.trigger(this.marker, 'click');
        });
        return this.mapElement;
      };
    }
  }

  // Turnpoint inherit from Waypoint.
  Turnpoint.prototype = new Waypoint();
  // Turnpoint constructor is still its own !
  Turnpoint.prototype.constructor = Turnpoint;

  return Turnpoint;
});
