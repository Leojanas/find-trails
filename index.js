//This is the javascript to run the find trails app
//Written by Leo Janas
"use strict";

let searchLocation = '';
let lat = 0;
let long = 0;
let loc = '';
let searchTrails = '';
let results = [];
let directions = [];
let finalResults = [];
let finalDirections = [];
let distance = 0;
let numberOfResults = 10;
//function to render the error screen for invalid search

//function to render the main page on a 'New Search' click
function renderMain(){
    $('#main-form').off('click', '#submit', clickSearch)
$('#main-form').off('click', '#new-search', clickNewSearch)
    $('#main-form').html(
        `<div class="group">
        <button class="item" id="select-address">Full Address</button>
        <button class="item" id="select-city">City</button>
        <button class="item" id="select-zip">Zip Code</button>
    </div>
    <button id="info">More Info</button>`
    )
}
//function to render the map directions for each trail
/*function renderMaps(results,directions){
    for(let i=0; i<results.length; i++){
        let directionsRenderer = new google.maps.DirectionsRenderer();
        let center = new google.maps.LatLng(40.7068354, -111.8036197);
        let mapOptions = {
            zoom: 7,
            center: center
        };
        let map = new google.maps.Map($(`#map0`),mapOptions);
        directionsRenderer.setMap(map);
        directionsRenderer.setDirections(directions[i]);
        console.log('map rendered');
    }
}*/

//function to render the results page
function renderResults(results,directions){
    $('#results').removeClass('hidden');
    $('#results-list').empty();
    for(let i=0; i<results.length; i++){
        if(i<numberOfResults){
        $('#results-list').append(`<li><h3>${results[i].name}</h3>
        <div class="item">
        <p>${results[i].summary}</p>
        <p>Total length: ${results[i].length} miles</p>
        <p>Elevation Gain: ${results[i].ascent} feet</p>
        <p>Driving Distance to Trailhead: ${directions[i].routes[0].legs[0].distance.text} </p>
        <a href=${results[i].url} target="_blank">More Information</a>
        </div>
        <div class="item" id="map${i}">
        <p>Map Here</p>
        </div>
        </li>`)
        }else{
            results = results.slice(0,(numberOfResults-1));
            directions = directions.slice(0, (numberOfResults-1));
        }
    }
    //renderMaps(results,directions);
}
//function to remove long drive distances
function removeLongDrives(results, directions){
    console.log('removeLongDrives ran')
    finalResults = [];
    finalDirections = [];
    for(let i=0; i<results.length; i++){
        if(directions[i].routes[0].legs[0].distance.value <= (distance*1609)){
            finalResults.push(results[i]);
            finalDirections.push(directions[i]);
        }
    }
    console.log(finalResults);
    console.log(finalDirections);
    renderResults(finalResults, finalDirections);
}

//function to get driving distance to trailhead
function fetchDrivingDirections(results){
    console.log('fetchDrivingDirections ran');
    directions = [];
   let directionsService = new google.maps.DirectionsService();
   callDirections(0, results, 0);
   }
   
   function callDirections(i,results, wait){
        console.log('callDirections began');
        let start = `${lat},${long}`;
        let end = `${results[i].latitude},${results[i].longitude}`
        let directionsService = new google.maps.DirectionsService();
        let request = {
            origin: start,
            destination: end,
            travelMode: 'DRIVING',
            unitSystem: google.maps.UnitSystem.IMPERIAL
            }
        directionsService.route(request, function(routeResult, status){
            if( status == 'OK'){
                    directions.push(routeResult);
                    console.log('directions ran')
                    if((i+1)<results.length){
                        setTimeout( ()=>{
                            callDirections(i+1, results, 0);
                        }, wait);
                    }else{
                    removeLongDrives(results,directions)                    }
                }else if(status == 'OVER_QUERY_LIMIT'){
                    console.log(status);
                    setTimeout( ()=> {
                       callDirections(i, results, 200);
                    }, 500);
                }else{
                    console.log('other response');
                }
        })
    }

//function to remove results that don't meet search terms (they can't all be narrowed down using the API query)
function parseResults(rawResults){
    let results1 = [];
    let results2 = [];
    let results3 = [];
    if ($('#max-length').val()){
        for(let i=0; i<rawResults.trails.length; i++){
            if (rawResults.trails[i].length <= $('#max-length').val()){
                results1.push(rawResults.trails[i]);
            }
        }
    }else {
        for(let i=0; i<rawResults.trails.length; i++){
                results1.push(rawResults.trails[i]);
            }
    }
    if($('#max-climb').val()){
        for(let i=0; i<results1.length; i++){
            if (results1[i].ascent <= $('#max-climb').val()){
                results2.push(results1[i]);
            }
        }
    }else {
        results2 = results1;
    } 
    if($('#min-climb').val()){
        for(let i=0; i<results2.length; i++){
            if (results2[i].ascent >= $('#min-climb').val()){
                results3.push(results2[i]);
            }
        }
    }else{
        results3 = results2;
    }
    fetchDrivingDirections(results3); 
}

//function to access the hiking project API to retrieve results
function fetchHikingProject(searchTrails){
    fetch(searchTrails)
    .then(response => response.json())
    .then(responseJson => {
        console.log(responseJson);
        parseResults(responseJson);
    })
    .catch(e => console.log('Error Hiking Project' + e));
    
}

//function to generate the query for the hiking access API based on search terms and coordinates
function hikingQuery(lat,long){
    const hikingBaseURL = `https://www.hikingproject.com/data/get-trails?lat=${lat}&lon=${long}`;
    searchTrails = hikingBaseURL;
    if($('#distance').val()){
        searchTrails = searchTrails + `&maxDistance=${$('#distance').val()}`
    }
    if($('#min-length').val()){
        searchTrails= searchTrails + `&minLength=${$('#min-length').val()}`
    }
    searchTrails = searchTrails + `&maxResults=${parseInt($('#number').val())+10}&key=200873164-ce2a4395cd4f81c2c04e802eba112f8d`;
    fetchHikingProject(searchTrails);
    
    
}

//function to access the google geocoding API to retrieve coordinates for the search
function fetchGeocoding(location){
    let string = '';
    const mapsBaseUrl = 'https://maps.googleapis.com/maps/api/geocode/json?';
    if (location === 'address'){
        let string = $('#address').val() +' '+ $('#city').val() +' '+ $('#state').val() +' '+ $('#zip').val();
        searchLocation = encodeURIComponent(string);
    }else  if (location === 'city'){
        let string = $('#city').val() +' '+ $('#state').val();
        searchLocation = encodeURIComponent(string);
    }else  if (location === 'zip'){
        let string = $('#zip').val();
        searchLocation = encodeURIComponent(string);
    }
    const mapsURL = mapsBaseUrl + 'address=' + searchLocation + '&key=AIzaSyCvS2cO3sDJcmoHQn0h46ITWIlhczMMsU4';
    fetch(mapsURL)
    .then(response => response.json())
    .then(responseJson => {
        lat = responseJson.results[0].geometry.location.lat;
        long = responseJson.results[0].geometry.location.lng;
        hikingQuery(lat,long);
    })
    .catch(e => console.log('Error'));
    
}

//function to render the search screen based on the type of search chosen
function renderSearch(location){
    if (location === 'address'){
        $('#main-form').html(`
            <div>
            <p>Required Fields:</p>
            <label for="address">Street Address:</label>
            <input type="text" id="address" required>
            <br>
            <label for="city">City:</label>
            <input type="text" id="city" required>
            <label for="state">State:</label>
            <input type="text" id="state" maxlength="2" placeholder="CA" required>
            <label for="zip">Zip Code:</label>
            <input type="text" id="zip" maxlength="5" placeholder="12345" required>
            <br>
            <p>Optional Fields:</p>
            <label for="number">Number of Results</label>
            <input type="text" id="number" placeholder="10">
            <br>
            <label for="distance">Maximum distance to trailhead:</label>
            <input type="text" id="distance" width="60px">
            <label for="distance">miles</label>
            <br>
            <label for="max-length">Maximum length of hike:</label>
            <input type="text" id="max-length" width="60px">
            <label for="max-length">miles</label>
            <br>
            <label for="min-length">Minimum length of hike:</label>
            <input type="text" id="min-length" width="60px">
            <label for="min-length">miles</label>
            <br>
            <label for="max-climb">Maximum Elevation Gain:</label>
            <input type="text" id="max-climb" width="60px">
            <label for="max-climb">feet</label>
            <br>
            <label for="min-climb">Minimum Elevation Gain:</label>
            <input type="text" id="min-climb" width="60px">
            <label for="min-climb">feet</label>
            </div>
            <button id="submit" type="submit">Search</button>
            <button id="new-search">Start Over</button>`
        )
    }else if(location === 'city'){
        $('#main-form').html(`
            <div>
            <p>Required Fields:</p>
            <label for="city">City:</label>
            <input type="text" id="city" required>
            <label for="state">State:</label>
            <input type="text" id="state" maxlength="2" placeholder="CA" required>
            <br>
            <p>Optional Fields:</p>
            <label for="number">Number of Results</label>
            <input type="text" id="number" placeholder="10">
            <br>
            <label for="distance">Maximum distance to trailhead:</label>
            <input type="text" id="distance width="60px">
            <label for="distance">miles</label>
            <br>
            <label for="max-length">Maximum length of hike:</label>
            <input type="text" id="max-length" width="60px">
            <label for="max-length">miles</label>
            <br>
            <label for="min-length">Minimum length of hike:</label>
            <input type="text" id="min-length" width="60px">
            <label for="min-length">miles</label>
            <br>
            <label for="max-climb">Maximum Elevation Gain:</label>
            <input type="text" id="max-climb" width="60px">
            <label for="max-climb">feet</label>
            <br>
            <label for="min-climb">Minimum Elevation Gain:</label>
            <input type="text" id="min-climb" width="60px">
            <label for="min-climb">feet</label>
            </div>
            <button id="submit" type="submit">Search</button>
            <button id="new-search">Start Over</button>`
        )
    }else if(location === 'zip'){
        $('#main-form').html(`
            <div>
            <p>Required Fields:</p>
            <label for="zip">Zip Code:</label>
            <input type="text" id="zip" maxlength="5" placeholder="12345" required>
            <br>
            <p>Optional Fields:</p>
            <label for="number">Number of Results</label>
            <input type="text" id="number" placeholder="10">
            <br>
            <label for="distance">Maximum distance to trailhead:</label>
            <input type="text" id="distance" width="60px">
            <label for="distance">miles</label>
            <br>
            <label for="max-length">Maximum length of hike:</label>
            <input type="text" id="max-length" width="60px">
            <label for="max-length">miles</label>
            <br>
            <label for="min-length">Minimum length of hike:</label>
            <input type="text" id="min-length" width="60px">
            <label for="min-length">miles</label>
            <br>
            <label for="max-climb">Maximum Elevation Gain:</label>
            <input type="text" id="max-climb" width="60px">
            <label for="max-climb">feet</label>
            <br>
            <label for="min-climb">Minimum Elevation Gain:</label>
            <input type="text" id="min-climb" width="60px">
            <label for="min-climb">feet</label>
            </div>
            <button id="submit" type="submit">Search</button>
            <button id="new-search">Start Over</button>`
        )
    }
    loc = location;
    watchSearch();
}

//function to render the detailed info screen
function renderInfo(){
    $('#info-screen').removeClass('hidden');
    $('#results').addClass('hidden');
    $('#info-screen').on('click', '#new-search', clickNewSearch);

}
//function for what to do on search submission
function clickSearch(){
    event.preventDefault();
    distance = $('#distance').val();
    numberOfResults = $('#number').val();
    $('#results-list').empty();
    fetchGeocoding(loc);
}
//function for what to do on new search
function clickNewSearch(){
    event.preventDefault();
    $('#info-screen').addClass('hidden');
    $('#results').addClass('hidden');
    renderMain();
}

//watchSearch function to listen for search submissions
function watchSearch(){
$('#main-form').on('click', '#submit', clickSearch)
$('#main-form').on('click', '#new-search', clickNewSearch)
}

//watchMain function to see which button is clicked on the main screen
function watchMain(){
$('#main-form').on('click','#select-address', function(event) {
    event.preventDefault();
    const location = 'address';
    renderSearch(location);
})
$('#main-form').on('click','#select-city', function(event){
    event.preventDefault();
    const location = 'city';
    renderSearch(location);
})
$('#main-form').on('click','#select-zip', function(event){
    event.preventDefault();
    const location = 'zip';
    renderSearch(location);
})
$('#main-form').on('click','#info', function(event){
    event.preventDefault();
    renderInfo();
})
}

//call watchMain on document ready
$(watchMain);