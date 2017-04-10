function openNav() {
    document.getElementById("mySidenav").style.width = "50%";
}

function closeNav() {
    document.getElementById("mySidenav").style.width = "0";
}

function openBotInfo() {
    document.getElementById("bottominfo").style.height = "10vh";
    document.getElementById("mfb-component__wrap").style.paddingBottom = "11vh";
    document.getElementById("scale-line").style.bottom = "11vh"; 
}

function closeAll() {
    document.getElementById("bottominfo").style.height = "3vh";
    document.getElementById("mySidenav").style.width = "0";
    document.getElementById("mfb-component__wrap").style.paddingBottom = "4vh";
    document.getElementById("scale-line").style.bottom = "4vh";
    document.getElementById("bottomlabel").innerHTML = ""; 
}

function openAssign() {
    document.getElementById("assignments").style.display = "block";
    document.getElementById("plain-menu").style.display = "none";
    document.getElementById("arrow_drop_up").style.display = "block";
    document.getElementById("arrow_drop_down").style.display = "none";
}

function closeAssign() {
    document.getElementById("assignments").style.display = "none";
    document.getElementById("plain-menu").style.display = "block";
    document.getElementById("arrow_drop_up").style.display = "none";
    document.getElementById("arrow_drop_down").style.display = "block";
}

function combinedView() {
  //document.getElementById("map").style.height = "50vh";
}



/*** Slider ***/

var isResizing = false,
    lastDownY = 0;

$(function () {
    var container = $('.container'),
        top = $('.map3d'),
        bottom = $('.map2'),
        handle = $('.drag');

    //handle.on('mousedown', function (e) {
    handle.on('touchstart', function (e) {
        isResizing = true;
        lastDownY = e.clientY;
        console.log("Hello1")
    });

    //$(document).on('mousemove', function (e) {
    $(document).on('touchmove', function (e) {
        // we don't want to do anything if we aren't resizing.
        if (!isResizing) 
            return;
        
        var offsetMiddle = container.height() - (e.clientY - container.offset().top);

        top.css('bottom', offsetMiddle);
        bottom.css('height', offsetMiddle);
        map2.updateSize();
        map3d.updateSize();
        console.log("Hello2")
    //}).on('mouseup', function (e) {
    }).on('touchend', function (e) {
      
      // stop resizing
      isResizing = false;
      console.log("Hello3")
    });
});





var view = new ol.View({
  center: ol.proj.fromLonLat([18.063240, 59.334591]),
  zoom: 16
  });


var scaleLineControl = new ol.control.ScaleLine({className: 'ol-scale-line', 
target: document.getElementById('scale-line')
});



//////***   COMBINED VIEW, id map2    ***///////////////



  /*** 3dmap placeholder *///

  var view2 = new ol.View({
  center: ol.proj.fromLonLat([18.063240, 59.334591]),
  zoom: 6
  });

  var map3d = new ol.Map({
    controls: ol.control.defaults({
      attributionOptions: /** @type {olx.control.AttributionOptions} */ ({
        collapsible: false
      })
    }).extend([
      scaleLineControl
    ]),
    target: 'map3d',
    layers: [
      new ol.layer.Tile({
        source: new ol.source.OSM()
      })
    ],
    view: view2
  });

  /*** End of placeholder ***/


  var map2 = new ol.Map({
    controls: ol.control.defaults({
      attributionOptions: /** @type {olx.control.AttributionOptions} */ ({
        collapsible: false
      })
    }).extend([
      scaleLineControl
    ]),
    target: 'map2',
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


geolocation.setTracking(true);


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
  map: map2,
  source: new ol.source.Vector({
    features: [accuracyFeature, positionFeature]
  })
});

function myLocation() {
  map2.getView().setCenter(geolocation.getPosition());
  var coordinates = geolocation.getPosition();
  document.getElementById("bottomlabel").innerHTML = coordinates;
  view.setZoom(16);
};

geolocation.on('change', function myLocation() {
  map2.getView().setCenter(geolocation.getPosition());
});

//////***  end of COMBINED VIEW, id map2    ***///////////////