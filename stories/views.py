from django.shortcuts import render
from django.http import HttpResponse
from django.contrib.auth.models import User

from models import Story, Passage

def home(request):
    return render(request, 'index.html')

def edit_story(request, key=None):
    story, created = Story.objects.get_or_create(key=key)
    if created:
        if request.user.is_authenticated():
            story.owner = request.user
        story.key = key
        story.save()
    return render(request, 'edit.html', dict(story=story))

def play_story(request, key=None):
    story = Story.objects.get(key=key)
    return render(request, 'play.html', dict(story=story))

def json_story(request, key=None):
    json = Story.objects.get(key=key).json()
    return HttpResponse(json, content_type="application/json")
    
