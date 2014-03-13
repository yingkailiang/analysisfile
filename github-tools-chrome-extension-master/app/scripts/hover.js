
window.registerHoverHandler = function(element, onenter, onleave) {
  var sheduledOut = 0;
  var sheduledIn = 0;
  var inside = false;
  var onmove = function() {
    if (sheduledOut) {
      clearTimeout(sheduledOut);
      sheduledOut = 0;
      return;
    }
    if (sheduledIn)
      return;
    if (inside)
      return;
    sheduledIn = setTimeout(function() {
      sheduledIn = 0;
      inside = true;
      onenter();
    }, 1);
  };
  var onout = function() {
    if (sheduledIn) {
      clearTimeout(sheduledIn);
      sheduledIn = 0;
      return;
    }
    if (sheduledOut)
      return;
    sheduledOut = setTimeout(function() {
      sheduledOut = 0;
      inside = false;
      onleave();
    }, 1);
  };
  element.addEventListener('mousemove', onmove);
  element.addEventListener('mouseout', onout);
};
