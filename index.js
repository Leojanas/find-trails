//This is the javascript to run the find trails app
//Written by Leo Janas
"use strict";

let submission = {};
let directions = [];

//function to render the main page on a 'Start Over' click
function generateMain(){
    return  `<div class="container">
        <button class="item" id="select-address">Full Address</button>
        <button class="item" id="select-city">City</button>
        <button class="item" id="select-zip">Zip Code</button>
        </div>
        <div class="container">
        <button id="help">Help</button>
        </div>`;
}

//function to display the main page on a 'Start Over' click
function renderMain(html){
    $('#main-form').off('click', '#submit', clickSearch)
    $('#main-form').off('click', '#new-search', clickNewSearch)
    $('#main-form').html(generateMain());
}

//function to render the map directions for each trail
function renderMaps(results,directions){
    for(let i=0; i<results.length; i++){
        let directionsRenderer = new google.maps.DirectionsRenderer();
        let map = new google.maps.Map(document.getElementById(`map${i}`));
        directionsRenderer.setMap(map);
        directionsRenderer.setDirections(directions[i]);
    }
}

//function to generate result list item html
function generateResult(result, direction, i){
    return `
    <li>
        <div class="container">
            <div class="item desktop">
                <img src="${result.imgSmall}" alt="No picture available" >
                <p>${result.name}</p>
            </div>
            <div class="item description large">
                <h3>${result.name}</h3>
                <p>${result.summary}</p>
                <p><b>Total length:</b> ${result.length} miles</p>
                <p><b>Elevation Gain:</b> ${result.ascent} feet</p>
                <p><b>Driving Distance to Trailhead:</b> ${direction.routes[0].legs[0].distance.text} </p>
                <a href=${result.url} target="_blank">More Information</a>
            </div>
            <br>
            <div class="item map" id="map${i}">
            </div>
        </div>
        <hr>
    </li>`
}

//function to render the results page
function renderResults(results,directions){
    $('#results').removeClass('hidden');
    $('#results-list').empty();
    for(let i=0; i<results.length; i++){
        if(i<submission.numberOfResults){
            $('#results-list').append(generateResult(results[i], directions[i], i));
        }else{
            results = results.slice(0,(submission.numberOfResults));
            directions = directions.slice(0, (submission.numberOfResults));
        }
    }
    renderMaps(results,directions);
}

//function to remove long drive distances
function removeLongDrives(results, directions){
    let finalResults = [];
    let finalDirections = [];
    for(let i=0; i<results.length; i++){
        if(directions[i].routes[0].legs[0].distance.value <= (submission.distance*1609)){
            finalResults.push(results[i]);
            finalDirections.push(directions[i]);
        }
    }
    renderResults(finalResults, finalDirections);
}

//function to get driving distance to trailhead
function fetchDrivingDirections(results, submission){
    directions = [];
   let directionsService = new google.maps.DirectionsService();
   callDirections(0, results, 0);
   }

//function to retrieve directions data   
function callDirections(i,results, wait){
    let start = `${submission.lat},${submission.long}`;
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
            if((i+1)<results.length){
                setTimeout( ()=>{
                    callDirections(i+1, results, 50);
                }, wait);
            }else{
                removeLongDrives(results,directions);                    
            }
        }else if(status == 'OVER_QUERY_LIMIT'){
            setTimeout( ()=> {
                callDirections(i, results, 200);
            }, 500);
        }
    })
}

//function to remove results that don't meet search terms (they can't all be narrowed down using the API query)
function parseResults(rawResults){
    let results1 = [];
    let results2 = [];
    let results3 = [];
    if (submission.maxLength){
        for(let i=0; i<rawResults.trails.length; i++){
            if (rawResults.trails[i].length <= submission.maxLength){
                results1.push(rawResults.trails[i]);
            }
        }
    }else {
        for(let i=0; i<rawResults.trails.length; i++){
            results1.push(rawResults.trails[i]);
        }
    }
    if(submission.maxClimb){
        for(let i=0; i<results1.length; i++){
            if (results1[i].ascent <= submission.maxClimb){
                results2.push(results1[i]);
            }
        }
    }else {
        results2 = results1;
    } 
    if(submission.minClimb){
        for(let i=0; i<results2.length; i++){
            if (results2[i].ascent >= submission.minClimb){
                results3.push(results2[i]);
            }
        }
    }else{
        results3 = results2;
    }
    if(results3.length == 0){
        renderErrorScreen('No results found. Please increase number of results or broaden search parameters and try again.');
    }else{
        fetchDrivingDirections(results3);
    } 
}

//function to access the hiking project API to retrieve results
function fetchHikingProject(searchTrails){
    fetch(searchTrails)
    .then(response => response.json())
    .then(responseJson => {
        parseResults(responseJson);
    })
    .catch(e => renderErrorScreen('Error from the hiking project:' + e));
}

//function to generate the query for the hiking access API based on search terms and coordinates
function hikingQuery(){
    const hikingBaseURL = `https://www.hikingproject.com/data/get-trails?lat=${submission.lat}&lon=${submission.long}`;
    let searchTrails = hikingBaseURL;
    if(submission.distance){
        searchTrails = searchTrails + `&maxDistance=${submission.distance}`
    }
    if(submission.minLength){
        searchTrails= searchTrails + `&minLength=${submission.minLength}`
    }
    searchTrails = searchTrails + `&maxResults=${parseInt(submission.numberOfResults)+12}&key=200873164-ce2a4395cd4f81c2c04e802eba112f8d`;
    fetchHikingProject(searchTrails, submission);
}

//function to access the google geocoding API to retrieve coordinates for the search
function fetchGeocoding(submission){
    let string = '';
    let searchLocation = '';
    const mapsBaseUrl = 'https://maps.googleapis.com/maps/api/geocode/json?';
    if (submission.location === 'address'){
        let string = submission.address +' '+ submission.city +' '+ submission.state +' '+ submission.zip;
        searchLocation = encodeURIComponent(string);
    }else  if (submission.location === 'city'){
        let string = submission.city +' '+ submission.state;
        searchLocation = encodeURIComponent(string);
    }else  if (submission.location === 'zip'){
        let string = submission.zip;
        searchLocation = encodeURIComponent(string);
    }
    const mapsURL = mapsBaseUrl + 'address=' + searchLocation + '&key=AIzaSyCvS2cO3sDJcmoHQn0h46ITWIlhczMMsU4';
    fetch(mapsURL)
    .then(response => response.json())
    .then(responseJson => {
        submission.lat = responseJson.results[0].geometry.location.lat;
        submission.long = responseJson.results[0].geometry.location.lng;
        hikingQuery();
    })
    .catch(e => renderErrorScreen('Error from geocoding:'+ e));
}
//function to generate optional fields (this part of the form is used for every search type)
function generateOptionalFields(){
return `<br>
<fieldset>
    <legend>Optional Fields:</legend>
    <label class="left-label" for="number">Number of Results:</label>
    <input type="number" id="number" placeholder="10" min="0" max="50" value="10">
    <br>
    <label class="left-label" for="distance">Maximum distance to trailhead:</label>
    <input type="number" id="distance" value="20" min="0" max="50" placeholder="20">
    <label for="distance">miles</label>
    <br>
    <label class="left-label" for="max-length">Maximum length of hike:</label>
    <input type="number" id="max-length" min="0" max="100">
    <label for="max-length">miles</label>
    <br>
    <label class="left-label" for="min-length">Minimum length of hike:</label>
    <input type="number" id="min-length" min="0" max="100">
    <label for="min-length">miles</label>
    <br>
    <label class="left-label" for="max-climb">Maximum Elevation Gain:</label>
    <input type="number" id="max-climb" min="0" max="10000">
    <label for="max-climb">feet</label>
    <br>
    <label class="left-label" for="min-climb">Minimum Elevation Gain:</label>
    <input type="number" id="min-climb" min="0" max="10000">
    <label for="min-climb">feet</label>
</fieldset>
<div class="container bottom">
    <button class="item" id="submit" type="submit">Search</button>
    <button class="item" id="new-search">Start Over</button>
</div>`
}

//function to generate address search
function generateAddressSearch(){
    return `
    <fieldset>
        <legend>Required Fields:</legend>
        <label for="address">Street Address:</label>
        <input type="text" id="address" required>
        <br>
        <label for="city">City:</label>
        <input type="text" id="city" required>
        <div class="lines">
            <label for="state">State:</label>
            <input type="text" id="state" maxlength="2" required>
            <label for="zip">Zip:</label>
            <input type="number" id="zip" min= "0" placeholder="12345" required>
        </div>
    </fieldset>
    `
}

//function to generate city search
function generateCitySearch(){
return `
<fieldset>
    <legend>Required Fields:</legend>
    <label for="city">City:</label>
    <input type="text" id="city" required>
    <div class="lines">
        <label for="state">State:</label>
        <input type="text" id="state" maxlength="2" required>
    </div>
</fieldset>`
}

//function to generate zip code search
function generateZipSearch(){
    return `<fieldset>
    <legend>Required Fields:</legend>
    <label for="zip">Zip Code:</label>
    <input type="number" id="zip" min= "0" placeholder="12345" required>
    <br>
</fieldset>`
}

//function to render the search screen based on the type of search chosen
function renderSearch(){
    if (submission.location === 'address'){
        $('#main-form').html(generateAddressSearch());
        $('#main-form').append(generateOptionalFields());
    }else if(submission.location === 'city'){
        $('#main-form').html(generateCitySearch());
        $('main-form').append(generateOptionalFields());
    }else if(submission.location === 'zip'){
        $('#main-form').html(generateZipSearch());
        $('#main-form').append(generateOptionalFields());
    }
    watchSearch();
}

//function to render the detailed info screen
function renderInfo(){
    $('#info-screen').removeClass('hidden');
    $('#results').addClass('hidden');
    $('#info-screen').on('click', '#new-search', clickNewSearch);
}

//function to display an error screen for an invalid submission
function renderErrorScreen(message){
    $('#error-message').text(message);
    $('#error').removeClass('hidden');
    $('#results').addClass('hidden');
}

//function to check for invalid submissions
function checkForErrors(submission){
    if((parseInt(submission.numberOfResults) < 0)|(parseInt(submission.distance) < 0)|(parseInt(submission.maxLength) < 0)|(parseInt(submission.minLength) < 0)|(parseInt(submission.maxClimb) < 0)|(parseInt(submission.minClimb) < 0)){
        renderErrorScreen('You cannot enter negative numbers.');
    }else if(parseInt(submission.minLength) > parseInt(submission.maxLength)){
        renderErrorScreen('Invalid Search: Maximum length is smaller than minimum length.')
    }else if(parseInt(submission.minClimb) > parseInt(submission.maxClimb)){
        renderErrorScreen('Invalid Search: Maximum elevation gain is smaller than minimum elevation gain.')
    }else if(submission.location == 'address'){
        if((submission.address == "")||(submission.city == "")||(submission.state == "")||(submission.zip == "")){
            renderErrorScreen('Please fill out all required address fields.');
        }else{
            $('#results-list').empty();
            $('#results').removeClass('hidden');
            $('#results-list').append(
                `<li>
                <p>Searching for Results...</p></li>
                `
            );
            fetchGeocoding(submission);
        } 
    }else  if(submission.location == 'city'){
        if((submission.city == "")||(submission.state == "")){
            renderErrorScreen('Please fill out all required fields.');
        }else{
            $('#results-list').empty();
            $('#results').removeClass('hidden');
            $('#results-list').append(
                `<li>
                <p>Searching for Results...</p></li>
                `
            );
            fetchGeocoding(submission);
        } 
    }else  if(submission.location == 'zip'){
        if(submission.zip == ""){
            renderErrorScreen('Please provide a valid zip code.');
        }else{
            $('#results-list').empty();
            $('#results').removeClass('hidden');
            $('#results-list').append(
                `<li>
                <p>Searching for Results...</p></li>
                `
            );
            fetchGeocoding(submission);
        } 
    } 
}

//function for what to do on search submission
function clickSearch(){
    event.preventDefault();
    let temp = {
        "address": $('#address').val(),
        "city": $('#city').val(),
        "state": $('#state').val(),
        "zip": $('#zip').val(),
        "distance": $('#distance').val(),
        "numberOfResults": $('#number').val(),
        "maxLength": $('#max-length').val(),
        "minLength": $('#min-length').val(),
        "maxClimb": $('#max-climb').val(),
        "minClimb": $('#min-climb').val()
    };
    submission = {...submission,...temp}
    $('#error').addClass('hidden');
    $('#info-screen').addClass('hidden');
    $('#results').addClass('hidden');
    checkForErrors(submission);  
}

//function for what to do on new search
function clickNewSearch(){
    event.preventDefault();
    $('#info-screen').addClass('hidden');
    $('#results').addClass('hidden');
    $('#error').addClass('hidden');
    renderMain();
}

//watchSearch function to listen for search submissions
function watchSearch(){
$('#main-form').on('click', '#submit', clickSearch);
$('#main-form').on('click', '#new-search', clickNewSearch);
}

//watchMain function to see which button is clicked on the main screen
function watchMain(){
$('#main-form').on('click','#select-address', function(Event) {
    Event.preventDefault();
    submission.location = 'address';
    renderSearch();
})
$('#main-form').on('click','#select-city', function(Event){
    Event.preventDefault();
    submission.location = 'city';
    renderSearch();
})
$('#main-form').on('click','#select-zip', function(Event){
    Event.preventDefault();
    submission.location = 'zip';
    renderSearch();
})
$('#main-form').on('click','#help', function(Event){
    Event.preventDefault();
    renderInfo();
})
}

//call watchMain on document ready
$(watchMain);