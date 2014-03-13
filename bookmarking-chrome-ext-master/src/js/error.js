
window._error = function(e) {

  var $div = $(window.document.createElement('div'));

  $div.css({
    width: '100px',
    height: '100px',
    background: 'pink',
    position: 'fixed',
    top: 0,
    left: 0
  });

  $div.text(e);

  // $d.append($div);

  $('body').append($div);

  setTimeout(function() {
    $div.hide('slow', function() {
      $div.remove();
    });
  }, 1000);


}
