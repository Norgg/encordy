from socketio.namespace import BaseNamespace
from socketio.mixins import RoomsMixin, BroadcastMixin
from models import Story, Passage
import json

#TODO: Don't need to send story key for anything except connect, just keep it in the session.
class StoryNamespace(BaseNamespace, RoomsMixin, BroadcastMixin):
    def on_lock(self, story_key, passage_title, action):
        passage = Passage.objects.get(story__key = story_key, title=passage_title)
        if (not passage.locked) or passage_title in self.session['locks']:
            passage.locked = True
            passage.save()
            self.emit('grant_lock', passage_title, action)
            self.emit_to_room(story_key, 'passage_locked', passage_title)
            self.session['locks'].add(passage_title)
            print("Locked: %s" % passage_title)
        else:
            print("Lock denied")
            self.emit('deny_lock', passage_title)

    def on_passage(self, story_key, passage_update):
        print(passage_update)
        
        story = Story.objects.get(key=story_key)
        passage, created = Passage.objects.get_or_create(title=passage_update['title'], story=story)
        
        changed = False
        if 'x' in passage_update and 'y' in passage_update:
            if passage.x != passage_update['x'] or passage.y != passage_update['y']:
                passage.x = passage_update['x']
                passage.y = passage_update['y']
                changed = True
        
        if 'content' in passage_update:
            if passage.content != passage_update['content']:
                if passage.title not in self.session['locks'] and not created:
                    self.emit('deny_edit', passage.title)
                    return
                passage.content = passage_update['content']
                changed = True
            if passage.locked:
                passage.locked = False
                changed = True
                self.session['locks'].remove(passage.title)
                self.emit_to_room(story_key, 'passage_unlocked', passage.title)
                print("Unlocked: %s" % passage.title)

        if changed:
            self.emit_to_room(story_key, 'passage', passage_update)
            if passage_update['save']:
                passage.save()

    def on_connect(self, story_key):
        print(story_key)
        self.session['story_key'] = story_key
        self.session['locks'] = set()
        self.join(story_key)
        
        story = Story.objects.get(key=story_key)
        #for passage in story.passages.all():
        #    print(passage.title)
        #    self.emit('passage', passage.as_dict())
        #self.emit('rename_story', story.title)
        self.emit('connected', story.json())

    def on_reconnect(self, story_key):
        on_connect(self, story_key)
    
    def on_delete(self, story_key, passage_title):
        print("Deleting %s" % passage_title)
        passage = Passage.objects.get(story__key = story_key, title=passage_title)
        if passage.title not in self.session['locks']:
            self.emit('deny_delete', passage.title)
        self.emit_to_room(story_key, 'delete', passage.title)
        passage.delete()

    def on_rename_story(self, story_key, title):
        print("Renaming to %s" % title)
        story = Story.objects.get(key=story_key)
        story.title = title
        story.save()
        self.emit_to_room(story_key, 'rename_story', title)

    def recv_disconnect(self):
        print("Connection lost, unlocking passages.")
        for passage in Passage.objects.filter(story__key=self.session['story_key'], title__in=self.session['locks']):
            print("Unlocked: %s " % passage.title)
            self.emit_to_room(self.session['story_key'], 'passage_unlocked', passage.title)
            passage.locked = False
            passage.save()
