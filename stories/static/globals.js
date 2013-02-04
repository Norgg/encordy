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
