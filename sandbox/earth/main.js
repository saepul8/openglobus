﻿goog.require('og.Globus');
goog.require('og.layer.XYZ');
goog.require('og.node.SkyBox');
goog.require('og.control.MouseNavigation');
goog.require('og.control.KeyboardNavigation');
goog.require('og.control.Sun');
goog.require('og.control.TouchNavigation');
goog.require('og.LonLat');
goog.require('og.EntityCollection');
goog.require('og.Entity');
goog.require('EarthNavigation');
goog.require('HtmlPointCollection');
goog.require('HtmlPoint');
goog.require('og.GeoImage');


var sun, nav;
var pointCollection;

function plusMinusClick() {
    nav.switchZoomState();
};

function start() {

    //og.shaderProgram.SHADERS_URL = "./shaders/";

    var sat = new og.layer.XYZ("MapQuest Satellite", { isBaseLayer: true, url: "http://otile1.mqcdn.com/tiles/1.0.0/sat/{zoom}/{tilex}/{tiley}.jpg", visibility: true, attribution: '©2014 MapQuest - Portions ©2014 "Map data © <a target="_blank" href="http://www.openstreetmap.org/">OpenStreetMap</a> and contributors, <a target="_blank" href="http://opendatacommons.org/licenses/odbl/"> CC-BY-SA</a>"' });

    var skybox = new og.node.SkyBox({
        "nx": "http://127.0.0.1/og/resources/images/skyboxes/gal/_nx.jpg",
        "px": "http://127.0.0.1/og/resources/images/skyboxes/gal/_px.jpg",
        "py": "http://127.0.0.1/og/resources/images/skyboxes/gal/_py.jpg",
        "ny": "http://127.0.0.1/og/resources/images/skyboxes/gal/_ny.jpg",
        "pz": "http://127.0.0.1/og/resources/images/skyboxes/gal/_pz.jpg",
        "nz": "http://127.0.0.1/og/resources/images/skyboxes/gal/_nz.jpg"
    });

    sun = new og.control.Sun({ autoActivate: true });
    nav = new EarthNavigation({ autoActivate: true });

    nav.events.on("zoomin", null, function () {
        $(".line-v").addClass("active");
        $(".line-h").addClass("active");
    });

    nav.events.on("zoomout", null, function () {
        $(".line-v").removeClass("active");
        $(".line-h").removeClass("active");
        if (pointCollection.selectedPoint) {
            pointCollection.selectedPoint.selected = false;
            pointCollection.hideClickAnimation(pointCollection.selectedPoint);
            pointCollection.selectedPoint = null;
        }
    });

    globus = new og.Globus({
        "target": "globus",
        "name": "Earth",
        "controls": [nav, sun],
        "skybox": skybox,
        "layers": [sat],
        "autoActivated": true
    });

    globus.planet.createDefaultTextures({ color: "#071836" }, { color: "#F4F5F7" });

    sun.sunlight.setDiffuse(new og.math.Vector3(1.2, 1.25, 1.41));
    sun.sunlight.setAmbient(new og.math.Vector3(.2, .2, .6));
    sun.sunlight.setSpecular(new og.math.Vector3(0.0026, 0.0021, 0.002));
    sun.sunlight.setShininess(12);

    createClouds();
    loadPoints();

    globus.planet.camera.setViewAngle(38.0);
    globus.renderer.handler.clock.multiplier = 1800;
    globus.planet.camera.flyLonLat(new og.LonLat(65.96558602541404, 13.316888985461492, 17119745.303455353), null, null, function () {
        globus.planet.camera._numFrames = 60;
    });
    globus.fadeIn(700);
};

function createClouds() {
    var collection = new og.EntityCollection();

    collection.add(new og.Entity({
        sphere: {
            radius: 6378137.00 + 30000,
            color: [1.0, 1.0, 1.0, 0.7],
            src: "clouds5.jpg",
            latBands: 38,
            lonBands: 38
        }
    })).addTo(globus.planet);

    var rot = 0;
    step = 0.008;
    globus.planet.renderer.events.on("draw", null, function () {
        collection._entities[0].shape.orientation = new og.math.Quaternion.yRotation(rot * og.math.RADIANS);
        collection._entities[0].shape.refresh();
        rot -= step;
    });
};

function loadPoints() {

    pointCollection = new HtmlPointCollection();
    globus.renderer.addRenderNode(pointCollection);

    for (var i = 0; i < 5; i++) {
        for (var j = 0; j < 5; j++) {
            (function () {
                var coord = [i * 10, j * 10];
                var point = new HtmlPoint({ lonlat: coord, color: "blue" });
                point.events.on("click", null, function () {
                    nav.stopRotation();
                    nav.currState = 1;
                    $(".line-v").addClass("active");
                    $(".line-h").addClass("active");
                    globus.planet.flyLonLat(og.lonLat(coord[0], coord[1], nav.positionState[1].h));
                });
                pointCollection.add(point);
            }());
        }
    }
};