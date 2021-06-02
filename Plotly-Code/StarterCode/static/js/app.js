var createdMap = false;
var myMap;
var myMarker;
var selectedCity;

function init() {

  var dropdownMenu = d3.select("#selDataset");
  var dropdownMenu2 = d3.select("#selDataset2");
  d3.json("StarterCode/static/js/data/house_by_city.json").then((data) => {

    var sampleNames = data;
    sampleNames.forEach((sample) => {

      dropdownMenu.append("option").text(sample.city).property("value", sample.city);
      dropdownMenu2.append("option").text(sample.city).property("value", sample.city);
  
    });

   

    var defaultSample = sampleNames[0].city;
    selectedCity = sampleNames[0].city;
    var defaultZip= sampleNames[0].zip;
 
    
    metaData(defaultSample);
    renderMap(defaultZip)
    createChart(defaultSample);
  });


}



function metaData(sample) {
  d3.json("StarterCode/static/js/data/house_by_city.json").then((data) => {
    var outputArray = data.filter(sampleObject => sampleObject.city === sample);
    var PANEL = d3.select("#sample-metadata");
    PANEL.html("");
    Object.entries(outputArray[0]).forEach(([key, value]) => {
      PANEL.append("h5").text(`${key.toUpperCase()}: ${value}`);

    });
   renderMap(outputArray[0].zip)
  });

}

// //  // Function to create horizontal bar chart
function createChart(sample) {
  d3.json("StarterCode/static/js/data/WA_housing_for_predicting_cleaned.json").then((data) => {
    // var samples = data;
    var outputArray = data.filter(sampleObject => sampleObject.city === sample);
    var price = [];
    var sqrft=[];
    outputArray.forEach((user) => {
      price.push(user.price);
      sqrft.push(user.sqft_living);
    });

    

    var bedroomX = [];//[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    var bedroomY = [];//[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    var bedroomsTags = [];
   
    for (var i = 0; i < 11; i++) {
      bedroomX.push(i);
      bedroomY.push(0);
      bedroomsTags.push(i + " bedroom houses");
    }

    outputArray.forEach(house => {
      bedroomY[house.bedrooms]++;
    });

    var minSize = 5;
    var maxSize = 25;
    var minBNumber = Math.min.apply(Math, bedroomY);
    var maxBNumber = Math.max.apply(Math, bedroomY);
    var scaledRange = maxSize - minSize;
    var realRange = maxBNumber - minBNumber;
    var scaledBedrooms = [];

    for (var i = 0; i < bedroomY.length; i++) {
      var val = (bedroomY[i] - minBNumber) * scaledRange / realRange + minSize;
      scaledBedrooms.push(val);
    }

    // box plot
    var boxData = [{
      type: "box",
      y: price,
      boxpoints: 'all',
      pointpos: -1.8
    }];
    var barlayout = {
      title: "Boxplot of home prices",
      height: 300,
      width: 300,
      margin: { t: 50, l: 100 },
    };
    Plotly.newPlot("box", boxData, barlayout);

    //Bubble chart
    var trace1 = {
      x: bedroomX,
      y: bedroomY,
      text: bedroomsTags,
      mode: "markers",
      marker: {
        color: 'rgb(rgb(217, 152, 182))',
        opacity: 1,
        size: scaledBedrooms,
      }
    };
    var data = [trace1];
    var layout = {
      title: "Number of bedrooms in a house",
      showlegend: false,
      height: 300,
      width: 300,
      margin: { t: 50, l: 100 },
      xaxis: {
        title: {
          text: "Bedrooms"
        }
      },
      yaxis: {
        title: {
          text: "Total number of houses"
        }
      }
    };
    Plotly.newPlot("bubble", data, layout);


    // scatter plot area

    var scatterTrace = {
      x: sqrft,
      y: price,
      mode: "markers",
      type: "scatter"
    }
    var scatterlayout = {
      title: "Price Vs Area sqft",
      xaxis: {
        title: {
          text: "Lot area"
        }
      },
      yaxis: {
        title: {
          text: "Price"
        }
      },
      height: 300,
      width: 300,
      margin: { t: 50, l: 100 },
    }
    var scatterData = [scatterTrace];

    Plotly.newPlot("scatter", scatterData, scatterlayout);


  });
}

// //  //create function init


//Function to show data for new sample
function optionChanged() {
  //create a variable to reference the dropdown where test subject can be changed
  var menuOption = d3.select("#selDataset");
  //create variable to select value for whatever user puts into this field
  var userSelection = menuOption.property("value");
  //run metadata and create chart function fors the new user choice
  metaData(userSelection);
  createChart(userSelection);

};


function renderMap(selectedzip) {
  console.log(selectedzip)
  d3.json("StarterCode/static/js/data/WA_zip_codes.json").then((data) => {
    var latlngArray = data.filter(sampleObject => sampleObject.Zip == selectedzip);
    latitude = latlngArray[0].Latitude;
    longitude = latlngArray[0].Longitude;

    if (createdMap) {
      myMap.panTo(new L.LatLng(latitude, longitude));
      myMarker.setLatLng([latitude, longitude]);
      return;
    }

    createdMap = true;

    myMap = L.map("map", {
      center: [latitude, longitude],
      zoom: 12
    });

    
    myMarker = L.marker([latitude, longitude]).addTo(myMap);
    
    L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
      // attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
      tileSize: 512,
      maxZoom: 18,
      zoomOffset: -1,
      id: "mapbox/streets-v11",
      accessToken: API_KEY
    }).addTo(myMap); 
  }
  )};

  function PredictedPrice() {

    x_coeff = [-0.1582603 ,  0.1684592 ,  0.73594325,  0.05301133,  0.20591209, 0.06586005];
    y_intercept = [1.62994199e-16];
    //["bedrooms","bathrooms","sqft_living","condition","age_of_house","city_encoder"]
    //["bedrooms","bathrooms","sqft_living","condition","age_of_house","city_encoder"]
    var menuOption = d3.select("#selDataset2");
    var userSelection = menuOption.property("value");

    selectedCity = userSelection;
    var sqft = document.getElementById("uiSqft").value;
    var bhk = getBHKValue();
    var bathrooms = getBathValue();
    var condition = getConditionValue();
    var age = document.getElementById("uiAge").value;
    var city_encoder = 10

    console.log(selectedCity);
    console.log(bhk);
    console.log(bathrooms);
    console.log(condition);
    console.log(sqft);
    console.log(age);

    var estPrice = d3.select("#EstimatedPrice");
    //console.log(estPrice);
    price = Math.round(x_coeff[0]*bhk + x_coeff[1]*bathrooms + sqft*x_coeff[2] + condition*x_coeff[3] + age * x_coeff[4] + city_encoder*x_coeff[5]+ y_intercept[0])*1000 
    estPrice.innerHTML = "<h2> " + price.toString() + "  </h2>";
    estPrice.text(price);
  
  }

  function getBathValue() {
    var uiBathrooms = document.getElementsByName("uiBathrooms");
    for(var i in uiBathrooms) {
      if(uiBathrooms[i].checked) {
          return parseInt(i)+1;
      }
    }
    return -1; // Invalid Value
  }

  function getBHKValue() {
    var uiBHK = document.getElementsByName("uiBHK");
    for(var i in uiBHK) {
      if(uiBHK[i].checked) {
          return parseInt(i)+2;
      }
    }
    return -1; // Invalid Value
  }

  function getConditionValue() {
    var uiBHK = document.getElementsByName("uiCondition");
    for(var i in uiBHK) {
      if(uiBHK[i].checked) {
          return parseInt(i)+1;
      }
    }
    return -1; // Invalid Value
  }

init();
