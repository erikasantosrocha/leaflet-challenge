// Create the tileLayer that will be the background of the map
let basemap = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  });

// Create the tileLayer for the satellite map
let satellite = L.tileLayer('https://tiles.stadiamaps.com/tiles/alidade_satellite/{z}/{x}/{y}{r}.{ext}', {
	minZoom: 0,
	maxZoom: 20,
	attribution: '&copy; CNES, Distribution Airbus DS, © Airbus DS, © PlanetObserver (Contains Copernicus Data) | &copy; <a href="https://www.stadiamaps.com/" target="_blank">Stadia Maps</a> &copy; <a href="https://openmaptiles.org/" target="_blank">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
	ext: 'jpg'
});

// Create the map
let myMap = L.map("map",{
    center:[40,-80],
    zoom: 3
})

basemap.addTo(myMap);

// Create the layers for tectonicPlates and earthquakes
let tectonicPlates = new L.LayerGroup();
let earthquakes = new L.LayerGroup();

let baseMaps = {
    "Current Earthquakes": basemap, 
    "Satellite": satellite
}

let overlays = {
    "Earthquakes": earthquakes,
    "Tectonic Plates": tectonicPlates
}

L.control.layers(baseMaps, overlays).addTo(myMap)

// Set the url to the geoJson file
url = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson"

// Call the geoJson url
d3.json(url).then(function(data){

//Get the color based on earthquake depth
function markerColor(d) {
    return d > 90  ? '#d73027' :
           d > 70  ? '#fc8d59' :
           d > 50  ? '#fee08b' :
           d > 30   ? '#d9ef8b' :
           d > 10   ? '#91cf60' :
           d > -10   ? '#1a9850' :
                      '#FFFFFF';
}

//Get the radius based on magnitude
function markerSize(m){
    if (m === 0){
        return 1;
    }
    return m*5;
}

//Add GeoJSON layer to the map once the file is loaded
L.geoJson(data,{
    onEachFeature: function(features, layer){
        layer.bindPopup(`Magnitude: ${features.properties.mag}`);
    },
//Turn each feature into a cicleMarker on the map
    pointToLayer: function(feature, latlng){
        return L.circleMarker(latlng,{
            radius: markerSize(feature.properties.mag),
            fillColor: markerColor(feature.geometry.coordinates[2]),
            color: "grey",
            weight: 0.4,
            fillOpacity: 0.8
        });
    }
}).addTo(earthquakes);
earthquakes.addTo(myMap);

// Create the legend.
let legend = L.control({ position: "bottomright" });
legend.onAdd = function() {
    let div = L.DomUtil.create("div", "info legend")
    let grades = [-10, 10, 30, 50, 70, 90];
    let labels = [];
    let legendInfo = "<h5>Magnitude</h5>";

    for (let i = 0; i < grades.length; i++) {
        div.innerHTML +=
            '<i style="background-color: ' + markerColor(grades[i]+1) + '"></i> ' +
            grades[i] + (grades[i+1] ? '&ndash;' + grades[i+1] + '<br>' : '+');
    }    

    return div;
    };

// Add the legend to the map
    legend.addTo(myMap);

// Add boundaries for tectonicPlates and include in the map
d3.json("https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json").then(function(plateData){
    L.geoJson(plateData,{
        color: 'orange'
    }).addTo(tectonicPlates)
    tectonicPlates.addTo(myMap)
})

});