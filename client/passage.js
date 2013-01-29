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

    if (passage.title != "Start") {
      var $deleteButton = $('<button class="delete-button">Delete</button>');
      $content.append($deleteButton);
      $deleteButton.click(function(e) {
        e.preventDefault();
        e.stopPropagation();
        if (confirm("Delete passage?")) passage.remove();
      });
    }
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
      var newPassage = createPassage(title, "");
      newPassage.x = this.x + 230 + (10 * this.links.length);
      newPassage.y = this.y;
      newPassage.div().offset({left: newPassage.x, top: newPassage.y});
      this.link(newPassage);
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
  for (var i in this.links) {
    var link = this.links[i];
    var pathAttrs = [
      'M', (this.x + this.width/2), (this.y + this.height/2),
      'L', (link.x+link.width/2),   (link.y+link.height/2)
    ]

    if (i < this.paths.length) {
      this.paths[i].attr({path: pathAttrs});
    } else {
      var pathStr = pathAttrs.join(" ");
      var path = paper.path(pathStr);
      path.attr('stroke-width', 3)
      this.paths.push(path)
    }
  }
  while (this.paths.length > this.links.length) {
    this.paths.pop().remove();
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
    }
  }

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
  var passagesToSave = {};

  for (passageID in passages) {
    passage = passages[passageID];
    savePassage = {};
    savePassage.title = passage.title;
    savePassage.content = passage.content;
    savePassage.x = passage.x;
    savePassage.y = passage.y;
    passagesToSave[passage.title] = savePassage;
  }

  var story = {
    title: storyTitle,
    passages: passagesToSave
  };
  return JSON.stringify(story);
}

function storyToHTML() {
  var $html = $('<html></html>');
  var $style = $('<style>body { font-family: sans-serif; background: #544; padding: 0px; margin: 0px; color: white; font-size: 1.1em; white-space: pre-wrap; } #header { margin: 0px; padding: 10px; width: 100%; font-size: 2em; border-bottom: 1px solid white; background: #445; } #player { width: 500px; margin: 10px; } a { color: #ccc; } </style>');
  var $jquery = $('<script src="http://ajax.googleapis.com/ajax/libs/jquery/1.9.0/jquery.min.js"></script>');
  var $passages = $('<script>passages=' + storyToJSON() + '.passages;</script>');
  var $enter = $('<script>enter=' + passageFunctions.enter + '</script>');
  $html.append($style);
  $html.append($jquery);
  $html.append($passages);
  $html.append($enter);

  var $body = $('<body></body>');

  var $header = $('<div id="header"></div>');
  $header.text(storyTitle);
  var $player = $('<div id="player"><div id="player-content"></div></div>');
  $body.append($header);
  $body.append($player);

  $html.append($body);
  
  var $init = $('<script>for (var i in passages) { passages[i].enter = enter; }; passages["Start"].enter(); $("#player").on("click", ".passage-link", function(e) { e.preventDefault(); passages[$(e.target).attr("href")].enter(); });</script>');
  $body.append($init);

  return $html.wrap('<p>').parent().html();
}
