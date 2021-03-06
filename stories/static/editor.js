$(function() {
  //createPassage('Start', 'Your story will display this passage first. Edit it by clicking it.');  

  $('body').on('click', '.passage-content', function(e) {
    if (!connected) return;
    e.preventDefault();
    e.stopPropagation();
    var title = $(this).parent().find('.passage-title').text();
    var passage = passages[title];
    passage.lock('content');
  });

  $('body').on('click', '.passage-title', function(e) {
    if (!connected) return;
    e.preventDefault();
    e.stopPropagation();
    console.log(this);
    var title = $(this).text();
    
    if (title == "Start") return;
    
    var passage = passages[title];
    if (passage) {
        passage.lock('title');
    }
  });

  $('#new-passage').click(function(e) {
    if (!connected) return;
    newPassageCount++;
    var title = "New passage #" + newPassageCount;
    while (passages[title]) {
        newPassageCount++;
        title = "New passage #" + newPassageCount;
    }
    var passage = createPassage(title, "");
    passage.sendAll();
  });

  $('#edit').click(function(e) {
    $('#custom-style').text('');
    $('#player').hide(100, function() {
      $('#editor,.passage').show(100, function() {
      });
    });
  });

  $('#rename').click(function(e) {
    if (!connected) return;
    e.preventDefault();
    e.stopPropagation();
    var newTitle = prompt("Rename story:", storyTitle);
    if (newTitle) {
        storyTitle = newTitle
        $('.title').text(storyTitle);
        socket.emit('rename_story', storyKey, storyTitle);
    }
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
  /*
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

  $('#export').click(function(e) {
    var data = 'data:Application/octet-stream,' + encodeURIComponent(storyToHTML());
    $(this).attr('href', data);
    $(this).attr('download', storyTitle + '.html');
  });
  */

  $('#help').click(function(e) {
    $('#help-text').toggle(200);
  });
  $('#help-close').click(function(e) {
    $('#help-text').hide(200);
  });
  /*
  $('body').mousedown(function(e) {
    if ($(e.target).attr('class') && $(e.target).attr('class').indexOf("passage") >= 0) return false; 
    mouseDown = true;
  });
  
  $('body').mouseup(function(e) {mouseDown = false;});

  $('body').mousemove(function(e) {
    if ($(e.target).attr('class') && $(e.target).attr('class').indexOf("passage") >= 0) return true; 
    if (mouseDown) {
      e.preventDefault();
      e.stopPropagation();
      if (Math.abs(e.pageX - lastMouse[0]) < 100 && Math.abs(e.pageY - lastMouse[1]) < 100 &&
        Math.abs(e.pageX - lastMouse[0]) > 0 && Math.abs(e.pageY - lastMouse[1]) > 0) {
        $("html,body").animate({scrollLeft: $("body").scrollLeft() + lastMouse[0] - e.pageX}, 0);
        $("html,body").animate({scrollTop: $("body").scrollTop() + lastMouse[1] - e.pageY}, 0);
      }
    }
    lastMouse[0] = e.pageX;
    lastMouse[1] = e.pageY;
  });
  */
});
