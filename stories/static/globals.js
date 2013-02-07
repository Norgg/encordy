//TODO: Ew. Clean these up into a single object or something.

var storyTitle = "Encordy";
var passages = {};
var newPassageCount = 0;
var nextPassageID = 0;
var $story = $('#story');
var lastMouse = [0,0];
var mouseDown = false;

paper = Raphael($('#canvas')[0], $(document).width(), $(document).height());

$('body').attr('unselectable', 'on')
 .css('user-select', 'none')
 .on('selectstart', false);


// TODO: Especially this socket stuff.
var socket = io.connect('', {})
var connected = false;
socket.on('connected', function(data) {
    connected = true;
    console.log('connected.');
    for (var title in passages) {
        passages[title].refreshLinks(false);
    }
});

socket.on('passage', function(data) {
    console.log("Passage: " + data.title, data);
    var passageUpdate = data;
    var passage = passages[passageUpdate.title];
    if (passage) {
        if (passageUpdate.content) {
            passage.save(passageUpdate.title + "\n" + passageUpdate.content);
        } 
    } else {
        if (passageUpdate.content) {
            passage = createPassage(passageUpdate.title, passageUpdate.content)
        } else {
            passage = createPassage(passageUpdate.title, "")
        }
    }
    
    if (passage && passageUpdate.x && passageUpdate.y) {
        passage.moveTo(passageUpdate.x, passageUpdate.y);
    }
});

socket.on('delete', function(passage) {
    passages[passage].remove();
});

socket.on('rename_story', function(title) {
    storyTitle = title;
    $('.title').text(storyTitle);
});
socket.emit('connect', storyKey);
