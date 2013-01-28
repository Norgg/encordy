$(function() {
  $('#play').click(function(e) {
    $('#editor,.passage').hide(100, function() {
      $('#player').show(100, function() {
        passages['Start'].enter();
      });
    });
  });

  $('#player').on('click', '.passage-link', function(e) {
    e.preventDefault();
    passages[$(e.target).attr('href')].enter();
  });
});
