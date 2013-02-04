from django.db import models
from django.contrib.auth.models import UserManager, User

class Story(models.Model):
    name = models.CharField(max_length=1024)
    user = models.ForeignKey(User)

class Passage(models.Model):
    story = models.ForeignKey(Story)
    title = models.CharField(max_length=1024)
    text = models.TextField(blank=True)
    x = models.IntegerField(default=0, blank=True)
    y = models.IntegerField(default=0, blank=True)
