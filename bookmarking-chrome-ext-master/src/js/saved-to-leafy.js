
var $div = $(window.document.createElement('div'));
var $span = $(window.document.createElement('span'));

$div.css({
  position: 'fixed',
  top: 0,
  width: '100%',
  height: '20px',
  background: '#d32626',
  'text-align': 'center',
  '-webkit-transition': 'all 0.2s ease',
          'transition': 'all 0.2s ease',
  '-webkit-transform': 'translate3d(0, -50px, 0)',
     '-moz-transform': 'translate3d(0, -50px, 0)',
      '-ms-transform': 'translate3d(0, -50px, 0)',
       '-o-transform': 'translate3d(0, -50px, 0)'
});
$span.css({
  color: 'white',
  'font-family': 'Helvetica Neue',
  'font-weight': '200'
});

$div.append($span);
$span.text('Saved!');

$('body').before($div);
$div.css({
  '-webkit-transform': 'translate3d(0, 0, 0)',
     '-moz-transform': 'translate3d(0, 0, 0)',
      '-ms-transform': 'translate3d(0, 0, 0)',
       '-o-transform': 'translate3d(0, 0, 0)'
});

setTimeout(function() {
  $div.css({
    '-webkit-transform': 'translate3d(0, -50px, 0)',
       '-moz-transform': 'translate3d(0, -50px, 0)',
        '-ms-transform': 'translate3d(0, -50px, 0)',
         '-o-transform': 'translate3d(0, -50px, 0)'
  });
  setTimeout(function() {
    $div.remove();
  }, 1000);
}, 2000);


