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

  $('#rename').click(function(e) {
    e.preventDefault();
    e.stopPropagation();
    storyTitle = prompt("Rename story:", storyTitle);
    $('.title').text(storyTitle);
  });

  $('#save').click(function(e) {
    var data = 'data:Application/octet-stream,' + encodeURIComponent(storyToJSON());
    
    console.log(data);
    //document.location = data;
    $(this).attr('href', data);
    $(this).attr('download', storyTitle + '.json');
  });

  var load = function(files) {
    if (files.length > 0) {
      var reader = new FileReader();
      reader.onloadend = function(e) {
        loadStory(e.target.result);
      };
      reader.readAsText(files[0]);
    }
  };

  //Load from drag/dropped file.
  document.body.addEventListener('drop', function(e) {
    e.preventDefault();
    e.stopPropagation();
    var files = e.dataTransfer.files;
    load(files);
  }, false);

  document.body.addEventListener('dragover', function(e) {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = 'open';
  }, false);

  $('#load').click(function(e) {
    e.preventDefault();
    e.stopPropagation();
    $('#loadInput').trigger('click');
  });

  $('#loadInput').change(function(e) {
    e.preventDefault();
    e.stopPropagation();
    var files = e.target.files;
    load(files);
  });

  $('#share').mouseover(function(e) {
    $('#share').attr('href', '#play:' + btoa(storyToJSON()));
  });
});
