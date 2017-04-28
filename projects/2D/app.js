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


function formShow() {
    document.getElementById("form-appointment").style.display = "block";
    document.getElementById("bottominfo").style.height = "3vh";
    document.getElementById("mySidenav").style.width = "0";
    document.getElementById("mfb-component__wrap").style.paddingBottom = "4vh";
    document.getElementById("scale-line").style.bottom = "4vh";
    document.getElementById("bottomlabel").innerHTML = ""; 
}

/*** Map ***/

proj4.defs("EPSG:3006","+proj=utm +zone=33 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs");

var view = new ol.View({
  projection: ol.proj.get('EPSG:3006'),
  center: [670162.497556056, 6579305.28607494],
  zoom: 15,
  rotation: Math.PI / 6
  });

var scaleLineControl = new ol.control.ScaleLine({className: 'ol-scale-line', 
target: document.getElementById('scale-line')
});

  // var stamenLayer = new ol.layer.Tile({
  //   source: new ol.source.Stamen({
  //     layer: 'terrain'  //http://maps.stamen.com/#terrain/16/59.3315/18.0313
  //   })
  // });

  var map = new ol.Map({
    controls: ol.control.defaults({
      attributionOptions: /** @type {olx.control.AttributionOptions} */ ({
        collapsible: false
      })
    }).extend([
      scaleLineControl
    ]),
    target: 'map',
    layers: [       new ol.layer.Tile({
         source: new ol.source.OSM()
       })],
    view: view
  });
      // Old map
      // new ol.layer.Tile({
      //   source: new ol.source.OSM()
      // })
    


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
  var coordinates = geolocation.getPosition();
  document.getElementById("bottomlabel").innerHTML = coordinates;
  view.setZoom(14);
  console.log(waterLayers.nodeLayer.getVisible());
};

geolocation.on('change:toMyLocation', function myLocation() {
  map.getView().setCenter(geolocation.getPosition());
});


// *****CODE FROM ELLA AND HILDING******

  //Makes HTTP-request to the file, via the python http server.
  //Python http-server is started with: python -m http.server
  function makeRequest (method, url) {
    return new Promise(function (resolve, reject) {
      var xhr = new XMLHttpRequest();
      xhr.open(method, url);
      xhr.onload = function () {
        if (this.status >= 200 && this.status < 300) {
          resolve(xhr.response);
        } else {
          reject({
            status: this.status,
            statusText: xhr.statusText
          });
        }
      };
      xhr.onerror = function () {
        reject({
          status: this.status,
          statusText: xhr.statusText
        });
      };
      xhr.send();
    });
  }


init = function() {
  //Requests from all the different text files.
  //To be implemeted: somehow group them together already in the requests-phase.
  requests = {'gasArc':
  makeRequest('GET', '/arc/gas_arcs'),
  'gasNode':
  makeRequest('GET', '/node/gas_arcs_vertices_pgr'),
  'heatArc':
  makeRequest('GET', '/arc/heat_arcs'),
  'heatNode':
  makeRequest('GET', '/node/heat_nodes'),
  'waterArc':
  makeRequest('GET', '/arc/vatten_arc'),
  'waterNode':
  makeRequest('GET', '/node/vatten_arc_vertices_pgr'),
  'heatConn':
  makeRequest('GET', '/conn/heat_cust'),
  'gasConn':
  makeRequest('GET', '/conn/gas_cust'),
  'waterConn':
  makeRequest('GET', '/conn/vatten_cust'),
  'heatmap': 
  makeRequest('GET', '/heatmap'),
  'repairs': 
  makeRequest('GET', '/repairs'),
  'installations': 
  makeRequest('GET', '/installations'),
  'customers': 
  makeRequest('GET', '/customers')
}
Promise
.props(requests)
.then(function(responses) {
  waterArcs = responses.waterArc
  waterNodes = responses.waterNode
    
    connection = [] 
    data = []
    network = []
    workLayers = []
    
    
    outdata = dataMaker(waterArcs, waterNodes);
    waterLayers = layerMaker(outdata.arcSource, outdata.nodeSource);

    map.addLayer(waterLayers.nodeLayer);
    waterLayers.nodeLayer.setVisible(false);
    map.addLayer(waterLayers.arcLayer);
    waterLayers.arcLayer.setVisible(false);
    console.log("woop")
      //Stores the raw data
    //To access the water layer: waterLayers.waterLayer
    //So put your map-stuff here somewhere

  })
.catch(function (err) {
  console.error('Augh, there was an error!', err.statusText);
  console.error(err);
});
};


function dataMaker(json_arc, json_node){
  var arcSource_in = new ol.source.Vector()
  var nodeSource_in = new ol.source.Vector()
  
  arcSource_in.addFeatures(new ol.format.GeoJSON().readFeatures(JSON.parse(json_arc)))
  nodeSource_in.addFeatures(new ol.format.GeoJSON().readFeatures(JSON.parse(json_node)))
  return {'arcSource': arcSource_in, 'nodeSource':nodeSource_in}
}

function layerMaker(arcSource, nodeSource){
  arcLayer = new ol.layer.Vector({
    source: arcSource,
    style: styleFunction('arc', 'water', false),
  visible: true,
    type: 'arc'
  })

  nodeLayer = new ol.layer.Vector({
    source: nodeSource,
    style: styleFunction('node', 'water', false),
  visible:true,
    type: 'node'
  })
  
  // console.log(waterLayers.arcLayer)
  return {'arcLayer': arcLayer, 'nodeLayer':nodeLayer}
  }
  
  //StyleShit
  
  var gas = {
 'connection': new ol.style.Style({
  image: new ol.style.Circle({
   fill: new ol.style.Fill({
    color: '#D500F9'
  }),
   radius: 5
 })
}),
 'arc': new ol.style.Style({
  stroke: new ol.style.Stroke({
    color: '#D500F9',
    width: 2
  })
}),
 'node': new ol.style.Style({
  text: new ol.style.Text({
    text: '\uf0e7 ',
    font: 'normal 35px FontAwesome',
    textBaseline: 'Bottom',
    fill: new ol.style.Fill({
      color: '#D500F9',
    })
  })   
})};
   //Visual settings for heating
   var heating = {
     'connection': new ol.style.Style({
      image: new ol.style.Circle({
       fill: new ol.style.Fill({
        color: 'black'
      }),
       radius: 5
     })
    }),

     'arc': new ol.style.Style({
      stroke: new ol.style.Stroke({
        color: 'black',
        lineDash: [5,1,5],
        width: 2
      })
    }),
     'node': new ol.style.Style({
       text: new ol.style.Text({
        text: '\uf0e7',
        font: 'normal 35px FontAwesome',
        textBaseline: 'Bottom',
        stroke: new ol.style.Stroke({
          color: 'rgba(255, 140, 0, 0.6)',
          width: 8}),
        fill: new ol.style.Fill({
          color: 'black',
        })
      })   
     })};

     var brokenHeating = {
       'connection': new ol.style.Style({
        image: new ol.style.Circle({
         fill: new ol.style.Fill({
          color: 'black'
        }),
         radius: 5,
         stroke: new ol.style.Stroke({
          color: 'rgba(255, 140, 0, 0.6)',
          width: 10})
       })
      }),

       'arc': new ol.style.Style({
        stroke: new ol.style.Stroke({
          color: 'black',
          lineDash: [5,1,5],
          width: 4
        })
      }),
       'node': new ol.style.Style({
         text: new ol.style.Text({
          text: '\uf0e7',
          font: 'normal 35px FontAwesome',
          textBaseline: 'Bottom',
          stroke: new ol.style.Stroke({
            color: 'rgba(255, 140, 0, 0.6)',
            width: 8}),
          fill: new ol.style.Fill({
            color: 'black',
          })
        })   
       })};

   //Visual settings for water
   var water = {
     'connection': new ol.style.Style({
      image: new ol.style.Circle({
       fill: new ol.style.Fill({
        color: '#2196F3'
      }),
       radius: 5
     })
    }),
     'arc': new ol.style.Style({
      stroke: new ol.style.Stroke({
        color: '#2196F3',
        lineDash: [5,5],
        width: 3
      })
    }),
     'node': new ol.style.Style({
       text: new ol.style.Text({
        text: '\uf0e7 ',
        font: 'normal 35px FontAwesome',
        textBaseline: 'Bottom',
        fill: new ol.style.Fill({
          color: '#2196F3'}),
        stroke: new ol.style.Stroke({
          color: 'rgba(255, 140, 0, 0.6)',
          width: 8}),
      })   
     })};

     var brokenWater = {
       'connection': new ol.style.Style({
        image: new ol.style.Circle({
         fill: new ol.style.Fill({
          color: '#2196F3'
        }),
         radius: 5,
         stroke: new ol.style.Stroke({
          color: 'rgba(255, 140, 0, 0.6)',
          width: 10})
       })
      }),
       'arc': new ol.style.Style({
        stroke: new ol.style.Stroke({
          color: '#2196F3',
          lineDash: [8,8],
          width: 4
        })
      }),
       'node': new ol.style.Style({
         text: new ol.style.Text({
          text: '\uf0e7 ',
          font: 'normal 35px FontAwesome',
          textBaseline: 'Bottom',
          fill: new ol.style.Fill({
            color: '#2196F3'}),
          stroke: new ol.style.Stroke({
            color: 'rgba(255, 140, 0, 0.6)',
            width: 8}),
        })   
       })};

       var customerStyle = new ol.style.Style({
         text: new ol.style.Text({
          text: '\uf007',
          font: 'normal 20px FontAwesome',
          textBaseline: 'Bottom',
          fill: new ol.style.Fill({
            color: '#FFFFFF',
          }),
          stroke: new ol.style.Stroke({
            color: '#000000',
            width: 2}),
        })   
       })

       var styles = {'heating':heating, 'gas':gas, 'water':water}
       var brokenStyles = {'heating':brokenHeating, 'water':brokenWater}


   //Takes the type of network and the object to visualize as input.
   var styleFunction = function(visualize, network_type, broken) {
    if(broken==true){
      return brokenStyles[network_type][visualize];
    }else{
      return styles[network_type][visualize];
    }
    
  };

function nodeOnClick()  {
    console.log("woop")
    if (waterLayers.nodeLayer.getVisible() == false){ 
      waterLayers.nodeLayer.setVisible(true);
     }
     else{
      waterLayers.nodeLayer.setVisible(false);
     }
}

function arcOnClick()  {
  console.log("woop")
  if (waterLayers.arcLayer.getVisible() == false){
  waterLayers.arcLayer.setVisible(true);
  }else{
  waterLayers.arcLayer.setVisible(false);
  }
};


init();