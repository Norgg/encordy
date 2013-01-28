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

  $('#save').click(function(e) {
    var passagesToSave = [];

    for (passageID in passages) {
      passage = passages[passageID];
      savePassage = {};
      savePassage.title = passage.title;
      savePassage.content = passage.content;
      savePassage.x = passage.x;
      savePassage.y = passage.y;
      passagesToSave.push(savePassage);
    }

    var data = 'data:Application/octet-stream,' + encodeURIComponent(JSON.stringify(passagesToSave));
    
    console.log(data);
    //document.location = data;
    $(this).attr('href', data);
    $(this).attr('download', storyTitle + '.json');
  });

  //Load from drag/dropped file.
  document.body.addEventListener('drop', function(e) {
    e.preventDefault();
    e.stopPropagation();
    var files = e.dataTransfer.files;

    console.log(files);

    if (files.length > 0) {
      var reader = new FileReader();
      reader.onloadend = function(e) {
        //Remove existing passages.
        for (var title in passages) {
          passages[title].remove();
        }

        var loadedPassages = JSON.parse(e.target.result);
        for (var idx in loadedPassages) {
          var loadedPassage = loadedPassages[idx];
          var passage = createPassage(loadedPassage.title, loadedPassage.content);
          passage.div().offset({'left': loadedPassage.x, 'top': loadedPassage.y});
          passage.x = loadedPassage.x;
          passage.y = loadedPassage.y;
          passages[passage.title] = passage;
        }
      };
      reader.readAsText(files[0]);
    }
  }, false);
  document.body.addEventListener('dragover', function(e) {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = 'open';
  }, false);
});
