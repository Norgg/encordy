passages = {};
newPassageCount = 0;
paper = Raphael($('#story')[0], 500, 500);
paper.path("M0,0L50,50");

function createPassage(title, content) {
  var id = title.toLowerCase().replace(/[^a-z0-9]/g, "");

  var passage = {};

  if (!$('#' + id).size()) {
    var $div = $('<div class="passage" id="'+id+'"></div>');
    var $title = $('<h3 class="passage-title"></h3>');
    $title.text(title);
    var $content = $('<div class="passage-content"></div>');
    $content.text(content);

    $div.html($title);
    $div.append($content);

    $('#story').append($div);

    $div.draggable({
      distance: 10,
      stop: function() {
        passage.x = $div.offset().left;
        passage.y = $div.offset().top;
      }
    });
    $div.offset({"left": 10, "top": 70});
  }

  passage.x       = 0;
  passage.y       = 0;
  passage.content = content;
  passage.title   = title;
  passage.id      = id;
  passage.div     = function() {return $('#' + this.id);};
  passage.editing = false;
  passage.edit    = function() {
    if (!this.editing) {
      var passage = this;
      var $content = this.div().find('.passage-content');
      
      var $input = $('<textarea></textarea>');
      $input.val($content.text());
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

  passage.save    = function(content) {
      this.editing = false;
      this.content = content;
      $content.text(this.content);
  };
  
  passage.links   = [];

  passages[id] = passage;
  return passage;
}

$(function() {
  createPassage('Start', 'Your story will display this passage first. Edit it by clicking it.');  

  $('body').on('click', '.passage', function(e) {
    e.preventDefault();
    e.stopPropagation();
    var title = $(this).find('.passage-title').text();
    var id = title.toLowerCase().replace(/[^a-z0-9]/g, "");
    console.log(id);
    var passage = passages[id];
    passage.edit();
  });

  $('#new-passage').click(function(e) {
    newPassageCount++;
    createPassage("New passage #" + newPassageCount, "");
  });
});
