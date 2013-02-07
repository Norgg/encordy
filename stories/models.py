from django.db import models
from django.contrib.auth.models import User
from twee.lib.tiddlywiki import TiddlyWiki
import json

class Story(models.Model):
    title = models.CharField(max_length=1024, default="New Story")
    owner = models.ForeignKey(User, related_name="stories", null=True)
    key = models.CharField(max_length=256)

    def save(self, *args, **kwargs):
        return super(Story, self).save(*args, **kwargs)

    def as_dict(self):
        return dict(
            title    = self.title, 
            passages = dict([(passage.title, passage.dict()) for passage in self.passages.all()])
        )
    
    def json(self):
        return json.dumps(self.as_dict())

    def to_tw(self):
        return """:: StoryTitle
%s

%s""" % (self.title, "\n\n".join([passage.to_tw() for passage in self.passages.all()]))

    def to_html(self):
        tw = TiddlyWiki()
        tw.addTwee(self.to_tw())
        return "%s%s%s" % (
            open('twee/targets/sugarcane/header.html').read(),
            tw.toHtml(),
            '</div></html>'
        )
    
class Passage(models.Model):
    story = models.ForeignKey(Story, related_name="passages")
    title = models.CharField(max_length=1024)
    content = models.TextField(blank=True)
    x = models.IntegerField(default=0, blank=True)
    y = models.IntegerField(default=0, blank=True)

    def as_dict(self):
        return dict(
            title   = self.title,
            content = self.content,
            x       = self.x,
            y       = self.y
        )

    def json(self):
        return json.dumps(self.as_dict())

    def to_tw(self):
        if self.title == "Start":
            tw_title = ":: Start [bookmark]"
        else:
            tw_title = ":: %s" % self.title
        return "%s\n%s" % (tw_title, self.content)
