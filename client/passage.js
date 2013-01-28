passageFunctions = {};
passageFunctions.div = function() {return $('#' + this.divID);};

passageFunctions.edit = function() {
  if (!this.editing) {
    var passage = this;
    var $content = this.div().find('.passage-content');
    
    var $input = $('<textarea></textarea>');
    $input.val(this.title + "\n" + this.content);
    $content.html($input);
    $input.focus();
    passage.editing = true;

    var $saveButton = $('<button>Save</button>');
    $content.append($saveButton);
    $saveButton.click(function(e) {
      e.preventDefault();
      e.stopPropagation();
      passage.save($input.val());
    });
    
    var $resetButton = $('<button class="reset-button">Reset</button>');
    $content.append($resetButton);
    $resetButton.click(function(e) {
      e.preventDefault();
      e.stopPropagation();
      passage.resetInput();
    });
  }
};


passageFunctions.save = function(content) {
    var $content = this.div().find('.passage-content');
    var lines = content.split("\n");
    if (this.setTitle(lines.shift())) {
      this.content = lines.join("\n");
      this.editing = false;
      this.refreshLinks(true);
    
      $content.text(this.content);
    }
};

passageFunctions.refreshLinks = function(create) {
  for (var i in this.links) {
    var link = this.links[i];
    link.linksFrom.splice(link.linksFrom.indexOf(this), 1);
  }
  this.links = [];
  
  pattern = /\[\[(.*?)\]\]/g;
  var match;
  while (match = pattern.exec(this.content)) {
    var title = match[1].split("|")[0]
    if (passages[title]) {
      this.link(passages[title]);
    } else if (create) {
      this.link(createPassage(title, ""));
    }
  }
  this.drawPaths();
};

passageFunctions.setTitle = function(newTitle) {
  if (this.title != newTitle) {
    if (passages[newTitle]) {
      alert("Hey! A passage with that title already exists!");
      return false;
    }
    if (newTitle == "") {
      alert("Oi! You have to give me a title!");
      return false;
    }
    if (this.title == "Start") {
      alert("Nope! Can't rename this, gotta have a place to start.");
      return false;
    }
    delete passages[this.title];
    this.title = newTitle;
    passages[this.title] = this;
    var linksFromIdx = this.linksFrom.length
    while (linksFromIdx > 0) {
      linksFromIdx--;
      this.linksFrom[linksFromIdx].refreshLinks(false);
    }
    this.div().find('.passage-title').text(this.title);
  }
  return true;
};

passageFunctions.resetInput = function() {
  this.div().find('textarea').val(this.title + "\n" + this.content);
}

passageFunctions.drawPaths = function() {
  for (var i in this.paths) {
    this.paths[i].remove();
  }
  for (var i in this.links) {
    var link = this.links[i];
    var pathStr = "M" + (this.x + this.width/2) + "," + (this.y + this.height/2) + " L" + (link.x+link.width/2) + "," + (link.y+link.height/2);
    var path = paper.path(pathStr);
    path.attr('stroke-width', 3)
    this.paths.push(path)
  }
};

passageFunctions.link = function(other) {
  this.links.push(other);
  other.linksFrom.push(this);
  this.drawPaths();
};

passageFunctions.enter = function() {
  var passageHtml = this.content;

  //replace links
  pattern = /\[\[(.*?)\]\]/g;
  var match;
  while (match = pattern.exec(this.content)) {
    var toks = match[1].split("|");
    var title = toks[0];
    var linkText = title;
    if (toks.length > 1) {
      linkText = toks[1];
    }
    if (passages[title]) {
      $a = $('<a class="passage-link"></a>');
      $a.text(linkText);
      $a.attr('href', title);
      passageHtml = passageHtml.replace(match[0], $a.wrap('<p>').parent().html());
      //this.link(passages[title]);
    }
  }
  //passageHtml = passageHtml.replace(/\n/g, '<br/>');

  $('#player-content').html(passageHtml);
};

passageFunctions.remove = function() {
  //Remove any links to this passage.
  for (var i in this.paths) {
    this.paths[i].remove();
  }
  var linksFromIdx = this.linksFrom.length;
  while (linksFromIdx > 0) {
    linksFromIdx--;
    this.linksFrom[linksFromIdx].refreshLinks(false);
  }
  this.div().remove();
  this.links = [];
  delete passages[this.title];
}

function createPassage(title, content) {
  var id = title;
  var divID = "passage-" + nextPassageID++;

  var passage = {};

  if (!$('#' + divID).size()) {
    var $div = $('<div class="passage" id="'+divID+'"></div>');
    var $title = $('<h3 class="passage-title"></h3>');
    $title.text(title);
    var $content = $('<div class="passage-content"></div>');
    $content.text(content);

    $div.html($title);
    $div.append($content);

    $('body').append($div);

    $div.draggable({
      distance: 5,
      scroll: true,
      drag: function() {
        passage.x = $div.offset().left;
        passage.y = $div.offset().top;
        passage.width = $div.width();
        passage.height = $div.height();
        passage.drawPaths();
        for (var i in passage.linksFrom) {
          passage.linksFrom[i].drawPaths();
        }
        if (paper.width != $(document).width() || paper.height != $(document).height()){
          paper.setSize($(document).width(), $(document).height());
        }
      }
    });
    $div.offset({"left": 10, "top": 70});
    passage.x = $div.offset().left;
    passage.y = $div.offset().top;
    passage.width = $div.width();
    passage.height = $div.height();
  }

  passage.content = content;
  passage.title   = title;
  passage.divID   = divID;
  passage.editing = false;
  
  passage.links     = [];
  passage.linksFrom = [];
  passage.paths     = [];
  $.extend(passage, passageFunctions);

  passages[title] = passage;

  return passage;
}

function loadStory(storyString) {
  //Remove existing passages.
  for (var title in passages) {
    passages[title].remove();
  }

  passages = {};
  paper.clear();

  var story = JSON.parse(storyString);
  var loadedPassages = story.passages;

  for (var idx in loadedPassages) {
    var loadedPassage = loadedPassages[idx];
    var passage = createPassage(loadedPassage.title, loadedPassage.content);
    passage.div().offset({'left': loadedPassage.x, 'top': loadedPassage.y});
    passage.x = loadedPassage.x;
    passage.y = loadedPassage.y;
    passages[passage.title] = passage;
  }
  for (var title in passages) {
    passages[title].refreshLinks();
  }
  paper.setSize($(document).width(), $(document).height());
  
  storyTitle = story.title;
  $('.title').text(storyTitle);
}

function storyToJSON() {
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

  var story = {
    title: storyTitle,
    passages: passagesToSave
  };
  return JSON.stringify(story);
}
