$(function() {
  createPassage('Start', 'Your story will display this passage first. Edit it by clicking it.');  

  $('body').on('click', '.passage', function(e) {
    e.preventDefault();
    e.stopPropagation();
    var title = $(this).find('.passage-title').text();
    var passage = passages[title];
    passage.edit();
  });

  $('#new-passage').click(function(e) {
    newPassageCount++;
    createPassage("New passage #" + newPassageCount, "");
  });

  $('#edit').click(function(e) {
    $('#player').hide(100, function() {
      $('#editor,.passage').show(100, function() {
      });
    });
  });
});
