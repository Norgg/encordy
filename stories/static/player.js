$(function() {
  var play = function() {
    var $customStyle = $('#custom-style');
    if (passages['<<css>>']) {
      $customStyle.text(passages['<<css>>'].content);
    }
    $('#editor,.passage').hide(100, function() {
      $('#player').show(100, function() {
        passages['Start'].enter();
      });
    });
  }

  if (window.location.hash.indexOf('#play:') == 0) {
    $('#editor').hide();
    loadStory(atob(window.location.hash.slice(6)));
    play();
  }
  if (window.location.hash.indexOf('#edit:') == 0) {
    loadStory(atob(window.location.hash.slice(6)));
  }

  /*$('#play').click(function(e) {
    e.preventDefault();
    play();
  });*/

  $('#restart').click(function(e) {
    e.preventDefault();
    passages['Start'].enter();
  });

  /*$('#player').on('click', '.passage-link', function(e) {
    e.preventDefault();
    passages[$(e.target).attr('href')].enter();
  });*/
});
