console.log("settingsparser.js running");
var settingsparsercounter = 0;
setInterval(function() {
  if (settingsparsercounter < 25) {
    chrome.extension.sendMessage({type:"parserNeedsTabNames", text:"parser needs any existing tab names"},function(response){
      if (response !== null) {
        var originaltabnames = response; 
        var newprimary = 'Primary';
        $('.rc').each(function() {
          var div = $(this);
          var divtext = div.text();
          //console.log("divtext: " + divtext);
          //for each particular tab name, see if it has a match
          for (var i = 0; i < originaltabnames.length; i++) {
            //store Primary tab's rename (if it exists)
            if (originaltabnames[i].originaltab == 'Primary') {
              newprimary = originaltabnames[i].userinput;
            }
            if (divtext == originaltabnames[i].originaltab) {
              div.text(originaltabnames[i].userinput);
              //console.log("trying to swap " + divtext + " with " + originaltabnames[i].userinput);
              break;
            }
            //if the "Include starred in Primary" option has been selected, change it
            else if (divtext == "Include starred in Primary") {
              div.text("Include starred in " + newprimary);
            }
          }
        });
      }
      settingsparsercounter++;
    });
  }
}, 100);
