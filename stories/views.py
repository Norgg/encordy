from django.shortcuts import render
from django.http import HttpResponse
from django.contrib.auth.models import User

from socketio import socketio_manage
from namespaces import StoryNamespace
from models import Story, Passage

def home(request):
    key = User.objects.make_random_password(10)
    while Story.objects.filter(key=key).count() > 0:
        print("Trying new key")
        key = User.objects.make_random_password(11)
        
    return render(request, 'index.html', dict(key=key))

def edit_story(request, key):
    story, created = Story.objects.get_or_create(key=key)
    
    new_key = User.objects.make_random_password(10)
    while Story.objects.filter(key=new_key).count() > 0:
        print("Trying new key")
        new_key = User.objects.make_random_password(11)
    
    if created:
        if request.user.is_authenticated():
            story.owner = request.user
        story.key = key
        story.save()

        Passage.objects.create(story=story, title="Start", content="Your story will display this passage first. Edit it by clicking it.", x=10, y=70)

    return render(request, 'edit.html', dict(story=story, new_key=new_key))

def play_story(request, key):
    story = Story.objects.get(play_key=key)
    return HttpResponse(story.to_html())

def json_story(request, key):
    json = Story.objects.get(key=key).json()
    return HttpResponse(json, content_type="application/json")

def socket(request):
    socketio_manage(request.environ, namespaces={'': StoryNamespace}, request=request)
    return {}
