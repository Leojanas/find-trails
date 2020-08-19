//This is the javascript to run the find trails app
//Written by Leo Janas
"use strict";

let searchLocation = '';
let lat = 0;
let long = 0;
let loc = '';

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

//function to render the results page

//function to remove results that don't meet search terms (they can't all be narrowed down using the API query)

//function to access the hiking project API to retrieve results

//function to generate the query for the hiking access API based on search terms and coordinates
function hikingQuery(lat,long){
    console.log(lat);
    console.log(long);
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
        long= responseJson.results[0].geometry.location.lng;
        hikingQuery(lat,long);
    });
    
}

//function to render the search screen based on the type of search chosen
function renderSearch(location){
    if (location === 'address'){
        $('#main-form').html(`
            <div>
            <label for="address">Street Address:</label>
            <input type="text" id="address">
            <br>
            <label for="city">City:</label>
            <input type="text" id="city">
            <label for="state">State:</label>
            <input type="text" id="state" maxlength="2" placeholder="CA">
            <label for="zip">Zip Code:</label>
            <input type="text" id="zip" maxlength="5" placeholder="12345">
            <br>
            <label for="distance">Maximum distance to trailhead:</label>
            <input type="text" id="distance">
            <br>
            <label for="max-length">Maximum length of hike:</label>
            <input type="text" id="max-length">
            <label for="min-length">Minimum length of hike:</label>
            <input type="text" id="min-length">
            </div>
            <button id="new-search">New Search</button>
            <button id="submit">Search</button>`
        )
    }else if(location === 'city'){
        $('#main-form').html(`
            <div>
            <label for="city">City:</label>
            <input type="text" id="city">
            <label for="state">State:</label>
            <input type="text" id="state" maxlength="2" placeholder="CA">
            <br>
            <label for="distance">Maximum distance to trailhead:</label>
            <input type="text" id="distance">
            <br>
            <label for="max-length">Maximum length of hike:</label>
            <input type="text" id="max-length">
            <label for="min-length">Minimum length of hike:</label>
            <input type="text" id="min-length">
            </div>
            <button id="new-search">New Search</button>
            <button id="submit">Search</button>`
        )
    }else if(location === 'zip'){
        $('#main-form').html(`
            <div>
            <label for="zip">Zip Code:</label>
            <input type="text" id="zip" maxlength="5" placeholder="12345">
            <br>
            <label for="distance">Maximum distance to trailhead:</label>
            <input type="text" id="distance">
            <br>
            <label for="max-length">Maximum length of hike:</label>
            <input type="text" id="max-length">
            <label for="min-length">Minimum length of hike:</label>
            <input type="text" id="min-length">
            </div>
            <button id="new-search">New Search</button>
            <button id="submit">Search</button>`
        )
    }
    loc = location;
    watchSearch();
}

//function to render the detailed info screen
function renderInfo(){

}
//function for what to do on search submission
function clickSearch(){
    event.preventDefault();
    fetchGeocoding(loc);
}
//function for what to do on new search
function clickNewSearch(){
    event.preventDefault();
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