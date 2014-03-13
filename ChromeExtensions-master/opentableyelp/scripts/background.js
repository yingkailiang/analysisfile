console.log("background.js running");

$.get('http://api.yelp.com/v2/search?term=food&location=San+Francisco', function(responseText) {
    console.log("ran query");
    alert(responseText);
});
