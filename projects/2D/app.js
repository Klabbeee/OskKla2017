function openNav() {
    document.getElementById("mySidenav").style.width = "50%";
}

function closeNav() {
    document.getElementById("mySidenav").style.width = "0";
}

var view = new ol.View({
  center: ol.proj.fromLonLat([18.063240, 59.334591]),
  zoom: 14
  });

var scaleLineControl = new ol.control.ScaleLine({className: 'ol-scale-line', 
target: document.getElementById('scale-line')
});

  var map = new ol.Map({
    controls: ol.control.defaults({
      attributionOptions: /** @type {olx.control.AttributionOptions} */ ({
        collapsible: false
      })
    }).extend([
      scaleLineControl
    ]),
    target: 'map',
    layers: [
      new ol.layer.Tile({
        source: new ol.source.OSM()
      })
    ],
    view: view
  });

scaleLineControl.setUnits('metric');


var geolocation = new ol.Geolocation({
  projection: view.getProjection()
});

// function el(id) {
//   return document.getElementById(id);
// }

geolocation.setTracking(true);


// update the HTML page when the position changes.
// geolocation.on('change', function() {
//   el('accuracy').innerText = geolocation.getAccuracy() + ' [m]';
//   el('altitude').innerText = geolocation.getAltitude() + ' [m]';
//   el('altitudeAccuracy').innerText = geolocation.getAltitudeAccuracy() + ' [m]';
//   el('heading').innerText = geolocation.getHeading() + ' [rad]';
//   el('speed').innerText = geolocation.getSpeed() + ' [m/s]';
// });

// handle geolocation error.
geolocation.on('error', function(error) {
  var info = document.getElementById('info');
  info.innerHTML = error.message;
  info.style.display = '';
});

var accuracyFeature = new ol.Feature();
geolocation.on('change:accuracyGeometry', function() {
  accuracyFeature.setGeometry(geolocation.getAccuracyGeometry());
});

var positionFeature = new ol.Feature();
positionFeature.setStyle(new ol.style.Style({
  image: new ol.style.Circle({
    radius: 6,
    fill: new ol.style.Fill({
      color: '#3399CC'
    }),
    stroke: new ol.style.Stroke({
      color: '#fff',
      width: 2
    })
  })
}));

geolocation.on('change:position', function() {
  var coordinates = geolocation.getPosition();
  positionFeature.setGeometry(coordinates ?
      new ol.geom.Point(coordinates) : null);
});

new ol.layer.Vector({
  map: map,
  source: new ol.source.Vector({
    features: [accuracyFeature, positionFeature]
  })
});

function myLocation() {
  map.getView().setCenter(geolocation.getPosition());
  view.setZoom(14);
};

geolocation.on('change', function myLocation() {
  map.getView().setCenter(geolocation.getPosition());
});
