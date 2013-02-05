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

var socket = io.connect('', {})
var connected = false;
socket.on('connected', function(data) {
    connected = true;
    console.log('connected.');
});

socket.on('passage', function(data) {
    //console.log("Passage: ", data);
    var passageUpdate = data;
    var passage = passages[passageUpdate.title];
    if (passageUpdate.content) {
        if (passage) {
            passage.save(passageUpdate.title + "\n" + passageUpdate.content);
        } else {
            passage = createPassage(passageUpdate.title, passageUpdate.content)
        }
    }
    
    if (passage && passageUpdate.x && passageUpdate.y) {
        passage.moveTo(passageUpdate.x, passageUpdate.y);
    }
});
socket.emit('connect', storyKey);
