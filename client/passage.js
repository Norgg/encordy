passageFunctions = {};
passageFunctions.div = function() {return $('#' + this.divID);};

passageFunctions.edit = function() {
  if (!this.editing) {
    var passage = this;
    var $content = this.div().find('.passage-content');
    
    var $input = $('<textarea></textarea>');
    $input.val(this.title + "\n" + $content.text());
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
  }
};


passageFunctions.save = function(content) {
    var $content = this.div().find('.passage-content');
    var lines = content.split("\n");
    this.setTitle(lines.shift());
    this.content = lines.join("\n");
    this.editing = false;
    this.refreshLinks(true);
    
    $content.text(this.content);
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
    delete passages[this.title];
    this.title = newTitle;
    passages[this.title] = this;
    var linksFromIdx = passage.linksFrom.length
    while (linksFromIdx > 0) {
      linksFromIdx--;
      this.linksFrom[linksFromIdx].refreshLinks(false);
    }
    this.div().find('.passage-title').text(this.title);
  }
};

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
    passageHtml = passageHtml.replace(/\n/g, '<br/>');
  }

  $('#player-content').html(passageHtml);
};

passageFunctions.remove = function() {
  //Remove any links to this passage.
  var linksFromIdx = this.linksFrom.length;
  while (linksFromIdx > 0) {
    linksFromIdx--;
    this.linksFrom[linksFromIdx].refreshLinks(false);
  }
  this.div().remove();
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
