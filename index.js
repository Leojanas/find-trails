//This is the javascript to run the find trails app
//Written by Leo Janas



//function to render the error screen for invalid search

//function to render the main page on a 'New Search' click
function renderMain(){
    $('#main-form').html(
        `<div class="group">
        <button class="item" id="address">Full Address</button>
        <button class="item" id="city">City</button>
        <button class="item" id="zip">Zip Code</button>
    </div>
    <button id="info">More Info</button>`
    )
}

//function to render the results page

//function to remove results that don't meet search terms (they can't all be narrowed down using the API query)

//function to access the hiking project API to retrieve results

//function to generate the query for the hiking access API based on search terms and coordinates

//function to access the google geocoding API to retrieve coordinates for the search

//function to render the search screen based on the type of search chosen
function renderSearch(location){
    watchSearch();
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
            <button id="submit">Search</button>
            `
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
            <button id="submit">Search</button>
            `
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
            <button id="submit">Search</button>
            `
        )
    }


}

//function to render the detailed info screen
function renderInfo(){

}
//watchSearch function to see when a full search is submitted
function watchSearch(){
$('#main-form').on('click', '#submit', function(event){
    event.preventDefault();
    console.log('Search submitted');
})
$('#main-form').on('click', '#new-search', function(event){
    event.preventDefault();
    renderMain();
    console.log('New search clicked');
})
}

//watchMain function to see which button is clicked on the main screen
function watchMain(){
$('#main-form').on('click','#address', function(event) {
    event.preventDefault();
    let location = 'address'
    renderSearch(location);
    console.log('Address selected');
})
$('#main-form').on('click','#city', function(event){
    event.preventDefault();
    let location = 'city'
    renderSearch(location);
    console.log('City selected');
})
$('#main-form').on('click','#zip', function(event){
    event.preventDefault();
    let location = 'zip'
    renderSearch(location);
    console.log('Zip selected');
})
$('#main-form').on('click','#info', function(event){
    event.preventDefault();
    renderInfo();
    console.log('Info selected');
})
}

//call watchMain on document ready
$(watchMain);