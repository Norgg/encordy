from django.shortcuts import render
from django.http import HttpResponse
from django.contrib.auth.models import User

from socketio import socketio_manage
from namespaces import StoryNamespace
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

        Passage.objects.create(story=story, title="Start", content="Your story will display this passage first. Edit it by clicking it.", x=10, y=70)

    return render(request, 'edit.html', dict(story=story))

def play_story(request, key=None):
    story = Story.objects.get(key=key)
    return HttpResponse(story.to_html())

def json_story(request, key=None):
    json = Story.objects.get(key=key).json()
    return HttpResponse(json, content_type="application/json")

def socket(request):
    socketio_manage(request.environ, namespaces={'': StoryNamespace}, request=request)
    return {}
