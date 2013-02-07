passageFunctions = {};
passageFunctions.div = function() {return $('#' + this.divID);};

passageFunctions.edit = function() {
    if (!this.editing) {
        var passage = this;
        var $content = this.div().find('.passage-content');

        var $input = $('<textarea class=".passage-textarea"></textarea>');
        $input.val(this.content);
        $content.html($input);
        $input.focus();
        $input.click(function(e) {e.stopPropagation();});
        passage.editing = true;

        var $saveButton = $('<button>Save</button>');
        $content.append($saveButton);
        $saveButton.click(function(e) {
            e.preventDefault();
            e.stopPropagation();
            if (passage.save($input.val())) {
                console.log("Sending post-save update.");
                passage.sendAll();
            };
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

passageFunctions.editTitle = function() {
    if (!this.editingTitle) {
        var passage = this;
        var $title = this.div().find('.passage-title');

        var $titleInput=$('<input class=".title-input"/>');
        $titleInput.val(this.title)
        $title.html($titleInput);
        $titleInput.focus();
        
        var saveTitle = function(e) {
            e.preventDefault();
            e.stopPropagation();
            if (passage.setTitle($titleInput.val())) {
                console.log("Sending post-title change update.");
                passage.sendAll();
            };
            $title.text(passage.title);
            passage.editingTitle = false;
        };

        $titleInput.keypress(function(e) {
            if (e.keyCode == 13) {
                saveTitle(e);
            }
        });


        var $saveButton = $('<button>Save</button>');
        $title.append($saveButton);
        $saveButton.click(saveTitle);

        passage.editingTitle = true;
    }
}


passageFunctions.save = function(content) {
    console.log("Saving.");
    var $content = this.div().find('.passage-content');
    this.content = content;
    $content.text(this.content);
    this.editing = false;
    this.refreshLinks(true);
    return true;
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
        var createThis = create;
        var toks = match[1].split("|")
        var title = toks[0];
        if (toks.length > 1) {
            title = toks.slice(1).join("|");
        }
        if (title.match(/https?:/)) {
            createThis = false;
        }
        if (passages[title]) {
            this.link(passages[title]);
        } else if (createThis) {
            var newPassage = createPassage(title, "");
            this.link(newPassage);
            newPassage.moveTo(this.x + 230 + (10*this.links.length), this.y, false);
            newPassage.sendAll();
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
            return false;
        }
        if (this.title == "Start") {
            alert("Nope! Can't rename this, gotta have a place to start.");
            return false;
        }
        delete passages[this.title];
        socket.emit('delete', storyKey, this.title);

        this.title = newTitle;
        passages[this.title] = this;
        //Need to refresh links for everything, in case the new title was linked to by something else.
        //TODO: Probably need to speed this up.
        for (var title in passages) {
            passages[title].refreshLinks(false);
        }
        this.div().find('.passage-title').text(this.title);
    }
    return true;
};

passageFunctions.resetInput = function() {
    this.div().find('textarea').val(this.title + "\n" + this.content);
}

passageFunctions.moveTo = function(x, y, animate) {
    var $div = this.div();
    if (animate) {
        $div.animate({left: x, top: y}, 100);
    } else {
        $div.offset({left: x, top: y});
    }
    this.x = x;
    this.y = y;
    this.width = $div.width();
    this.height = $div.height();
    this.drawPaths();
    for (var i in this.linksFrom) {
        this.linksFrom[i].drawPaths();
    }
}

passageFunctions.drawPaths = function() {
    if (!paper) return;

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
    delete passages[this.title];
    console.log("Removing passage " + this.title);
    
    //Remove any links to this passage.
    for (var i in this.paths) {
        this.paths[i].remove();
    }
    var linksFromIdx = this.linksFrom.length;
    while (linksFromIdx > 0) {
        linksFromIdx--;
        this.linksFrom[linksFromIdx].refreshLinks(false);
    }
    socket.emit('delete', storyKey, this.title);
    this.div().remove();
    this.links = [];
}

passageFunctions.sendPos = function(save) {
    if (connected) {
        socket.emit('passage', storyKey, {title: this.title, x: this.x, y: this.y, save: save});
    };
}

passageFunctions.sendContent = function() {
    if (connected) {
        socket.emit('passage', storyKey, {title: this.title, content: this.content, save: true});
    };
}

passageFunctions.sendAll = function() {
    if (connected) {
        socket.emit('passage', storyKey, {title: this.title, content: this.content, x: this.x, y: this.y, save: true});
    };
}

function createPassage(title, content) {
    var id = title;
    var divID = "passage-" + nextPassageID++;

    var passage = {};
    $.extend(passage, passageFunctions);
    
    passage.content = content;
    passage.title   = title;
    passage.divID   = divID;
    passage.editing = false;
    
    passage.links     = [];
    passage.linksFrom = [];
    passage.paths     = [];

    passages[title] = passage;

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
                if (paper && (paper.width != $(document).width() || paper.height != $(document).height())) {
                    paper.setSize($(document).width(), $(document).height());
                }
                if ($('body').width() != $(document).width() || $('body').height != $(document).height()) {
                    $('body').height($(document).height());
                    $('body').width($(document).width());
                }
                //passage.sendPos(false);
            },
            stop: function() {
                console.log("Sending pos update.");
                passage.x = $div.offset().left;
                passage.y = $div.offset().top;
                passage.sendPos(true);
            }
        });
        passage.moveTo(10 + 20*newPassageCount, 70 + 20*newPassageCount, false);
    }
    
    //Need to refresh links for everything, as per renaming.
    //It's a rare case that something else would link to a new passage, but need to check regardless.
    //TODO: Optimise this.
    for (var title in passages) {
        passages[title].refreshLinks(false);
    }

    console.log('Created passage.');
    //passage.sendAll();
    return passage;
}

function loadStory(story) {
    //Remove existing passages.
    for (var title in passages) {
        passages[title].remove();
    }

    passages = {};
    if (paper) paper.clear();
    
    if (typeof story == "string") {
        story = JSON.parse(story);
    }
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
        passages[title].refreshLinks(false);
    }
    if (paper) paper.setSize($(document).width(), $(document).height());
    
    storyTitle = story.title;
    $('.title').text(storyTitle);
}

function storyToHTML() {
    var $html = $('<html></html>');
    var $style = $('<style>body { font-family: sans-serif; background: #544; padding: 0px; margin: 0px; color: white; font-size: 1.1em; white-space: pre-wrap; } #header { margin: 0px; padding: 10px; width: 100%; border-bottom: 1px solid white; background: #445; } #player { width: 500px; margin: 10px; } a { color: #ccc; } </style>');
    var $customStyle = $('<style></style>');
    if (passages['<<css>>']) {
      $customStyle.text(passages['<<css>>'].content);
    }
    var $jquery = $('<script src="http://ajax.googleapis.com/ajax/libs/jquery/1.9.0/jquery.min.js"></script>');
    var $passages = $('<script>passages=' + storyToJSON() + '.passages;</script>');
    var $enter = $('<script>enter=' + passageFunctions.enter + '</script>');
    $html.append($style);
    $html.append($customStyle);
    $html.append($jquery);
    $html.append($passages);
    $html.append($enter);

    var $body = $('<body></body>');

    var $header = $('<div id="header"></div>');
    var $title = $('<h1></h1>');
    $title.text(storyTitle);
    $header.append($title);

    var $restart = $('<a id="restart" href="javascript: void(0);">Restart</a> ');
    $header.append($restart);
    $header.append(" ");
    var $edit = $('<a id="edit">Edit</a>');
    $edit.attr('href', location.protocol + "//" + location.host + location.pathname + '#edit:' + btoa(storyToJSON()));
    $header.append($edit);

    var $player = $('<div id="player"><div id="player-content"></div></div>');
    $body.append($header);
    $body.append($player);

    $html.append($body);
    
    var $init = $('<script>for (var i in passages) { passages[i].enter = enter; }; passages["Start"].enter(); $("#player").on("click", ".passage-link", function(e) { e.preventDefault(); passages[$(e.target).attr("href")].enter(); }); $("#restart").click(function(e) { passages["Start"].enter(); });</script>');
    $body.append($init);

    return $html.wrap('<p>').parent().html();
}
