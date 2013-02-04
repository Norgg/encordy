from django.db import models
from django.contrib.auth.models import User
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
    
class Passage(models.Model):
    story = models.ForeignKey(Story, related_name="passages")
    title = models.CharField(max_length=1024)
    content = models.TextField(blank=True)
    x = models.IntegerField(default=0, blank=True)
    y = models.IntegerField(default=0, blank=True)

    def as_dict(self):
        return dict(
            title   = title,
            content = content,
            x       = x,
            y       = y
        )

    def json(self):
        return json.dumps(self.as_dict())
