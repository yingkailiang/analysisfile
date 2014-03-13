/*
 * <div class="aKz" data-tooltip-align="t,l" id=":2y" style-"-webkit-user-select: none;" data-tooltip="Person-to-person conversations and messages that don't appear in other tabs.">Primary</div>

 <div class="aKz" data-tooltip-align="t,l" id=":2z" style-"-webkit-user-select: none;" data-tooltip="Messages from social networks, media-sharing sites, online dating services, and other social websites.">Social</div>

 <div class="aKz" data-tooltip-align="t,l" id=":30" style="-webkit-user-select: none;" data-tooltip="Deals, offers, and other marketing emails.">Promotions</div>

 <div class="Kj-JD-Jl"><button name="save" class="J-at1-auR J-at1-atl">Save</button><button name="cancel">Cancel</button></div>  is the save button


/* all code below is injected into the gmail inbox page */
    
var ksumparserscriptrunning = true;
var parseroriginaltabnames = [];

function tabPair(originaltab, userinput) {
  this.originaltab = originaltab;
  this.userinput = userinput;
}

tabPair.prototype.toString = function() {
  return "Original tab: " + originaltab + ", user input: " + userinput;
};

var numparserruns = 0;
var numsends = 0;
var gottenoriginaltabs = false;

/* dynamic gmail page, so adding/removing tabs results in inconsistent element id's, etc. Keeping track of the
 * id's until they become stable should determine when the update is 'finished' */
var firstiterationids = []; //element id's of first tab iteration
var seconditerationids = []; //element id's of second tab iteration
var numiterations = 1; //number of iterations
var goodidcompares = 0; //number of times firstiterationids = seconditerationids
var numcheckedboxes = 0; //number of checked boxes from clicking '+'

/* constantly re-parse the page in short intervals to keep track of live updates to the tabs */
setInterval(function() {
  //console.log("parser.js runs: " + numparserruns);

  if (numparserruns == 0) {
  //if (gottenoriginaltabs == false) {
    //console.log("running getOriginalTabLinks()");
    getOriginalTabLinks();
  }
  else {
    insertLocalOrignalTabNames();
  }

  var tabRenamer = function() {
    //var documenturl = document.URL;
    //console.log("document url: " + documenturl); //document url: https://mail.google.com/mail/u/0/#inbox

    //this array stores the names of the tabs
    var tabnames = [];
    //this array stores the tooltip text of the tabs
    var tabtooltips = [];

    //console.log("numiterations: " + numiterations);

    function iterateThroughTabs() {
      //use tooltips, since classes are unstable/change sometimes
      $('div[data-tooltip-align="t,l"]').each(function() {
        //check that selection is an actual tab via custom selector of 'data-tooltip'
        if ($(this).attr('data-tooltip') !== undefined && $(this).attr('style') == "-webkit-user-select: none;") {
          var div = $(this);
          //console.log("div class: " + $(this).attr("class"));
          //if ($(this).attr("style") == "-webkit-user-select: none;") {
          //console.log(div.attr('text'));
          //console.log("tab text: " + div.text());
          if (div.text().length > 0 && div.attr('id') !== undefined) {
            var html = $(this)[0].outerHTML;
            //console.log("iterateThroughTabs found html: " + html);
            var tabpair = new tabPair();
            tabnames.push(div.text());
            //console.log("tab description: " + div.attr('data-tooltip'));
            tabtooltips.push(div.attr('data-tooltip'));
            //if odd number of iterations
            if ((numiterations % 2) !== 0) {
              firstiterationids.push(div.attr('id'));
            }
            //if even number of iterations
            else {
              seconditerationids.push(div.attr('id'));
            }
          }
        }
        //}
      });
    }
    iterateThroughTabs();
    //console.log("tabnames length after iterateThroughTabs: " + tabnames.length);
    //console.log("tooltips length after scan: " + tabtooltips.length);

    function sendTabs() {
      for (var i = 0; i < tabnames.length; i++) {
        //console.log("tabnames " + i + ": " + tabnames[i]);
      }
      //tabnames only contains the names of the tabs on the page - nothing else
      for (var i = 0; i < tabnames.length; i++) {
        var name = tabnames[i];
        chrome.extension.sendMessage({type:"sentTabName", text:name},function(reponse){});
      }
    };
    /*for (var i = 0; i < firstiterationids.length; i++) {
      console.log("firstiterationids[" + i + "]: " + firstiterationids[i]);
    }
    for (var j = 0; j < seconditerationids.length; j++) {
      console.log("seconditerationids[" + j + "]: " + seconditerationids[j]);
      }*/

    //even number of iterations, so the two arrays are full
    if (numiterations % 2 == 0) {
      //console.log("goodidcompares: " + goodidcompares);
      //console.log(firstiterationids.length + ", " + seconditerationids.length);
      
      //if the number of good id compares is greater than 4, reset to 0
      if (goodidcompares > 4) {
        goodidcompares = 0;
      }
      //if the iteration arrays are equivalent
      else if (iterationIDsMatch() == true) {
        goodidcompares++;
      }
      //streak of identical iteration arrays broken, so reset counter as page is not yet stable
      else {
        goodidcompares = 0;
      }
    }

    var tabsmatchoriginal = false;
    //console.log("tabnames length: " + tabnames.length + ", parseroriginaltabnameslength: " + parseroriginaltabnames.length);
    //# current tabs in inbox can be <= max # tabs, but cannot be greater than under any circumstances
    if (tabnames.length > 1 && tabnames.length <= parseroriginaltabnames.length) {
      tabsmatchoriginal = true;
      for (var i = 0; i < tabnames.length; i++) {
        //console.log("comparing " + tabnames[i] + " with " + parseroriginaltabnames[i].userinput);
        if (tabnames[i] !== parseroriginaltabnames[i].userinput) {
          tabsmatchoriginal = false;
          break;
        }
      }
    }

    /*if (numparserruns == 0) {
      chrome.extension.sendMessage({type:"incomingTabNames", text:"refreshed batch of tab names following"}, function(response){});
      sendTabs();
    }*/

    /* if the tabs have stabilized in the dynamic page such that the same ids have been found 4 tab iterations in
     * a row, a succesful send to the background hasn't yet occured, and the original existing tabs (if any) have arrived from 
     * background, finally send out the tab names. The gottenoriginaltabs and tabs match original checks occur down here since the javascript code 
     * doesn't wait for getOriginalTabLinks to complete and inject before iterating through tabs due to a sent
     * message in getOriginalTabs() */
    //console.log("goodidcompares: " + goodidcompares + ", numsends: " + numsends + ", gottenoriginaltabs: " + gottenoriginaltabs + ", tabsmatchoriginal: " + tabsmatchoriginal);
    if (goodidcompares == 4 && numsends == 0 && gottenoriginaltabs == true && tabsmatchoriginal == true) {
      //console.log("numcheckedboxes: " + numcheckedboxes + ", firstierationids: " + firstiterationids.length);
      //if the user has yet to click on the '+' tab
      if (numcheckedboxes == 0) {
        //console.log("parser starting sending of new batch of sent tabs");
        chrome.extension.sendMessage({type:"incomingTabNames", text:"refreshed batch of tab names following"}, function(response){});
        sendTabs();
        numsends++;
        //console.log("parser sent latest batch of tabs");
        chrome.extension.sendMessage({type:"parserSentAllTabNames", text:"all parsed tab names sent"}, function(response){});
      }
      //if the number of checked boxes from '+' is equal to the number of tabs found on the page
      else if (numcheckedboxes == firstiterationids.length) {
        //console.log("parser starting sending of new batch of sent tabs");
        chrome.extension.sendMessage({type:"incomingTabNames", text:"refreshed batch of tab names following"}, function(response){});
        sendTabs();
        numsends++;
        //console.log("parser sent latest batch of tabs");
        chrome.extension.sendMessage({type:"parserSentAllTabNames", text:"all parsed tab names sent"}, function(response){});
      }
      goodidcompares = 0;
    }
    //clear id's from iteration
    if ((numiterations % 2) == 0) {
      firstiterationids = [];
      seconditerationids = [];
    }
  };
  tabRenamer();
  numparserruns++;
  numiterations++;
}, 100); 

var iterationIDsMatch = function() {
  if (firstiterationids.length !== seconditerationids.length) {
    return false;
  }
  else {
    var mismatchcount = 0;
    for (var i = 0; i < firstiterationids.length; i++) {
      //console.log("comparing " firstiterationids[i] + " with + " seconditerationids[i]);
      if (firstiterationids[i] !== seconditerationids[i]) {
        mismatchcount++;
      }
    }
    if (mismatchcount == 0) {
      return true;
    }
    else {
      return false;
    }
  }
}

chrome.extension.onRequest.addListener(function(message,sender,sendResponse){
  /* parser receives this from background.js */
  if (message.type == "displayTabNames") {
    submitted = true;
    var tabs = message.array;
    for (var i = 0; i < tabs.length; i++) {
      //console.log("parser found replacement for: " + tabs[i].originaltab + " with " + tabs[i].userinput);
    //console.log("running off of local original tabs");
      //iterate through all current tabs and check to replace
      //$('.aKz').each(function() {
      $('div[data-tooltip-align="t,l"]').each(function() {
        if ($(this).text() === tabs[i].originaltab) {
          $(this).text(tabs[i].userinput);
        }
      })
    }
    //send changed tabs to background for future reference
    chrome.extension.sendMessage({type:"storeNewTabs", array:tabs}, function(response){});
    numparserruns = 0;
    numiterations = 0;
    numsends = 0;
    }
});

/* Inbox link clicked */
$('.aio').click(function() {
  if ($(this).text() == "Inbox") {
    //console.log("Inbox, so reset parser");
    numparserruns = 0;
    numiterations = 0;
    numsends = 0;
    goodidcompares = 0;
    gottenoriginaltabs = false;
  }
});

//save button clicked
$(document).on('click','.J-at1-auR.J-at1-atl',function() {
  chrome.extension.sendMessage({type:"updatedTabs", text:"save button clicked"},function(reponse){});
  //reset the counter to re-parse the new tabs after the page is dynamically settled
  numparserruns = 0;
  numiterations = 0;
  numsends = 0;
  goodidcompares = 0;
  gottenoriginaltabs = false;
  //reset checks for new check
  numcheckedboxes = 0;
  //count number of checked boxes (excluding include starred in primary)
  $('.C7').each(function() {
    //if a checkbox is found
    if ($(this).find('.aIZ .T-Jo').attr('aria-checked') == 'true') {
      //if corresponding div is not 'Include starred...'
      var targettext = $(this).find('.C6 .rc').text();
      if (targettext.indexOf('Include starred in') == -1) {
        numcheckedboxes++;
      }
    }
  });
  //console.log("found " + numcheckedboxes + " tabs");
});


/* when the '+' sign is clicked to add/remove tabs, handle window that opens */
$(document).on('click', '.aKj.aVc', function() {
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
          else if (divtext.indexOf("Include starred in") !== -1) {
            //console.log("replacing primary with " + newprimary);
            div.text("Include starred in " + newprimary);
          }
        }
      });
    }
  });
});

//manual click on "Configure Inbox" on right
$(document).on('click', '.J-N-Jz', function() {
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
          //store Primary tab's rename (if it exists) for re-injection below
          if (originaltabnames[i].originaltab == 'Primary') {
            newprimary = originaltabnames[i].userinput;
          }
          //if text in configuration option corresponds to one of Primary, social, etc. etc.
          if (divtext == originaltabnames[i].originaltab) {
            div.text(originaltabnames[i].userinput);
            //console.log("trying to swap " + divtext + " with " + originaltabnames[i].userinput);
            break;
          }
          //if the "Include starred in " option has been selected, change it
          else if (divtext.indexOf("Include starred in") !== -1) {
            //console.log("replacing primary with " + newprimary);
            div.text("Include starred in " + newprimary);
          }
        }
      });
    }
  });
});

//click on "Inbox" tab in settings
$(document).on('click', '.f0.ou', function() {
  if ($(this).text() == 'Inbox') {
    numparserruns = 0;
    numiterations = 0;
    numsends = 0;
    goodidcompares = 0;
    gottenoriginaltabs = false;
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
            else if (divtext.indexOf("Include starred in") !== -1) {
              div.text("Include starred in " + newprimary);
            }
          }
        });
      }
    });
  }
});

/* retrieve originaltabnames[] from background and inject the latest user input into the page */
function getOriginalTabLinks() {
  //parser gets existing tab names from background (if any) and injects into page
  chrome.extension.sendMessage({type:"parserNeedsTabNames", text:"parser needs any existing tab names"},function(response){
    if (response !== null) {
      var numreplacements = 0;
      var numattempts = 0;
      //store local copy of original names
      parseroriginaltabnames = response;
      while (numreplacements == 0 && numattempts < 20) {
        var tabstoinject = [];
        tabstoinject = response; //pointer to array sent from background
        for (var i = 0; i < tabstoinject.length; i++) {
          //console.log("parser found replacement for: " + tabstoinject[i].originaltab + " with " + tabstoinject[i].userinput);
          //iterate through all current tabs and check to replace
          $('div[data-tooltip-align="t,l"]').each(function() {
            //console.log("parser looking at " + $(this).text() + " and comparing it to " + tabstoinject[i].originaltab + " to inject " + tabstoinject[i].userinput);
            if ($(this).text() === tabstoinject[i].originaltab) {
              $(this).text(tabstoinject[i].userinput);
              numreplacements++;
            }
          })
        }
        //only true down here to account for asynchronous execution
        gottenoriginaltabs = true;
        numattempts++;
      }
    }
  });
}

function insertLocalOrignalTabNames() {
  var numreplacements = 0;
  var numattempts = 0;
  while (numreplacements == 0 && numattempts < 20) {
    for (var i = 0; i < parseroriginaltabnames.length; i++) {
      //console.log("parser found replacement for: " + parseroriginaltabnames[i].originaltab + " with " + parseroriginaltabnames[i].userinput);
      //iterate through all current tabs and check to replace
      $('div[data-tooltip-align="t,l"]').each(function() {
        //console.log("parser looking at " + $(this).text() + " and comparing it to " + parseroriginaltabnames[i].originaltab + " to inject " + parseroriginaltabnames[i].userinput);
        if ($(this).text() === parseroriginaltabnames[i].originaltab) {
          $(this).text(parseroriginaltabnames[i].userinput);
          numreplacements++;
        }
      })
    }
    //only true down here to account for asynchronous execution
    gottenoriginaltabs = true;
    numattempts++;
  }
}
