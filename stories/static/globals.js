//TODO: Ew. Clean these up into a single object or something.

var storyTitle = "Encordy";
var passages = {};
var newPassageCount = 0;
var nextPassageID = 0;
var $story = $('#story');
var lastMouse = [0,0];
var mouseDown = false;

var paper = null;
try {
    var paper = Raphael($('#canvas')[0], $(document).width(), $(document).height());
} catch (error) {
    console.log("Error loading Raphael.");
}
$('body').attr('unselectable', 'on')
 .css('user-select', 'none')
 .on('selectstart', false);


// TODO: Especially this socket stuff.
function connect() {
    var sock = io.connect('')
    sock.on('connected', function(data) {
        if (!connected) {
            connected = true;
            console.log('connected.');
            loadStory(data);
            $('.passage').draggable('enable');
        }
    });

    sock.on('passage', function(passageUpdate) {
        console.log("Passage: " + passageUpdate.title, passageUpdate);
        var passage = passages[passageUpdate.title];
        if (passage) {
            if (passageUpdate.content) {
                passage.save(passageUpdate.content);
            } 
        } else {
            if (passageUpdate.content) {
                passage = createPassage(passageUpdate.title, passageUpdate.content);
            } else {
                passage = createPassage(passageUpdate.title, "");
            }
        }

        if (passageUpdate.locked) {
            passages[title].div().addClass('locked');
        }
        
        if (passage && passageUpdate.x && passageUpdate.y) {
            passage.moveTo(passageUpdate.x, passageUpdate.y, true);
        }
    });

    sock.on('delete', function(passage) {
        passages[passage].remove(false);
    });

    sock.on('rename_story', function(title) {
        storyTitle = title;
        $('.title').text(storyTitle);
    });
    sock.emit('connect', storyKey);

    sock.on('disconnect', function(data) {
        connected = false;
        $('.title').text("DISCONNECTED, retrying...");
        socket = null;
        $('.passage').draggable('disable');
        setTimeout(function() {
            socket = connect();
        }, 1000);
    });

    sock.on('grant_lock', function(title, action) {
        console.log("Lock granted on: " + title);
        if (action == 'content') {
            passages[title].edit();
        } else {
            passages[title].editTitle();
        }
    });
    
    sock.on('passage_locked', function(title) {
        console.log("Someone locked: " + title);
        passages[title].div().addClass('locked');
    });
    
    sock.on('passage_unlocked', function(title) {
        console.log("Someone unlocked: " + title);
        passages[title].div().removeClass('locked');
    });

    sock.on('connect_failed', function () {
        $('.title').text("CONNECTION FAILED :(");
    });
    sock.on('error', function () {
        $('.title').text("CONNECTION ERROR :(");
    });

    $(window).on('beforeunload',function(){sock.disconnect();});

    return sock;
}

var connected = false;
var socket = connect();

