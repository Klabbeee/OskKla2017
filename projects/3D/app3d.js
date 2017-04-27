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


/// <reference types="@argonjs/argon" />
/// <reference types="three" />
// grab some handles on APIs we use
var Cesium = Argon.Cesium;
var Cartesian3 = Argon.Cesium.Cartesian3;
var ReferenceFrame = Argon.Cesium.ReferenceFrame;
var JulianDate = Argon.Cesium.JulianDate;
var CesiumMath = Argon.Cesium.CesiumMath;
// set up Argon
var app = Argon.init();


// Tell argon what local coordinate system you want.  The default coordinate
// frame used by Argon is Cesium's FIXED frame, which is centered at the center
// of the earth and oriented with the earth's axes.  
// The FIXED frame is inconvenient for a number of reasons: the numbers used are
// large and cause issues with rendering, and the orientation of the user's "local
// view of the world" is different that the FIXED orientation (my perception of "up"
// does not correspond to one of the FIXED axes).  
// Therefore, Argon uses a local coordinate frame that sits on a plane tangent to 
// the earth near the user's current location.  This frame automatically changes if the
// user moves more than a few kilometers.
// The EUS frame cooresponds to the typical 3D computer graphics coordinate frame, so we use
// that here.  The other option Argon supports is localOriginEastNorthUp, which is
// more similar to what is used in the geospatial industry
app.context.setDefaultReferenceFrame(app.context.localOriginEastUpSouth);


// set up THREE.  Create a scene, a perspective camera and an object
// for the user's location
var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera();
var userLocation = new THREE.Object3D;
scene.add(camera);
scene.add(userLocation);


// In this demo, we are  rendering the 3D graphics with WebGL, 
// using the standard WebGLRenderer
var renderer = new THREE.WebGLRenderer({
    alpha: true,
    logarithmicDepthBuffer: true
})
;renderer.setPixelRatio(window.devicePixelRatio);
app.view.element.appendChild(renderer.domElement);


// We put some elements in the index.html, for convenience. 
// var locationElement = document.getElementById("location");


// All geospatial objects need to have an Object3D linked to a Cesium Entity.
// We need to do this because Argon needs a mapping between Entities and Object3Ds.
//
// Here, we will position a cube near our starting location.  This geolocated object starts without a
// location, until our reality is set and we know the location.  Each time the reality changes, we update
// the cube position.
// This code creates a 1m cube with a wooden cylinder texture on it, 
// that we will attach to the geospatial object when we create it.
var cylinderGeoObject = new THREE.Object3D();
var cylinder = new THREE.Object3D();
var loader = new THREE.TextureLoader();

var geometry = new THREE.CylinderBufferGeometry( 1, 1, 4, 20 );
var material = new THREE.MeshBasicMaterial({ color: 0xFFFFFF });
var mesh = new THREE.Mesh(geometry, material);
cylinder.add(mesh)

cylinderGeoObject.add(cylinder);
var cylinderGeoEntity = new Argon.Cesium.Entity({
    name: "I have a cylinder",
    position: Cartesian3.ZERO,
    orientation: Cesium.Quaternion.IDENTITY
});


// the updateEvent is called each time the 3D world should be
// rendered, before the renderEvent.  The state of your application
// should be updated here.

var cylinderInit = false;
app.updateEvent.addEventListener(function (frame) {
    // get the position and orientation (the "pose") of the user
    // in the local coordinate frame.
    var userPose = app.context.getEntityPose(app.context.user);
    // assuming we know the user's pose, set the position of our 
    // THREE user object to match it
    if (userPose.poseStatus & Argon.PoseStatus.KNOWN) {
        userLocation.position.copy(userPose.position);
    }
    else {
        // if we don't know the user pose we can't do anything
        return;
    }
    // the first time through, we create a geospatial position for
    // the cylinder somewhere near us 
    if (!cylinderInit) {
        var defaultFrame = app.context.getDefaultReferenceFrame();
        // set the cylinder's position to 10 meters away from the user.
        // First, clone the userPose postion, and add 10 to the X
        var cylinderPos = userPose.position.clone();
        cylinderPos.x += 10;
        // set the value of the cylinder Entity to this local position, by
        // specifying the frame of reference to our local frame
        cylinderGeoEntity.position.setValue(cylinderPos, defaultFrame);
        // orient the cylinder according to the local world frame
        cylinderGeoEntity.orientation.setValue(Cesium.Quaternion.IDENTITY);
        // now, we want to move the cylinder's coordinates to the FIXED frame, so
        // the cylinder doesn't move if the local coordinate system origin changes.
        if (Argon.convertEntityReferenceFrame(cylinderGeoEntity, frame.time, ReferenceFrame.FIXED)) {
            scene.add(cylinderGeoObject);
            cylinderInit = true;
        }
    }


    // get the local coordinates of the local cylinder, and set the THREE object
    var cylinderPose = app.context.getEntityPose(cylinderGeoEntity);
    cylinderGeoObject.position.copy(cylinderPose.position);
    cylinderGeoObject.quaternion.copy(cylinderPose.orientation);
    // rotate the cylinderes at a constant speed, independent of frame rates     
    // to make it a little less boring
    cylinder.rotateY(3 * frame.deltaTime / 10000);
});




// renderEvent is fired whenever argon wants the app to update its display
app.renderEvent.addEventListener(function () {
    // set the renderers to know the current size of the viewport.
    // This is the full size of the viewport, which would include
    // both views if we are in stereo viewing mode
    var viewport = app.view.getViewport();
    renderer.setSize(viewport.width, viewport.height);

});