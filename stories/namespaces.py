from socketio.namespace import BaseNamespace
from socketio.mixins import RoomsMixin, BroadcastMixin
from models import Story, Passage
import json

class StoryNamespace(BaseNamespace, RoomsMixin, BroadcastMixin):
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
                passage.content = passage_update['content']
                changed = True

        if changed and passage_update['save']:
            passage.save()

        self.emit_to_room(story_key, 'passage', passage_update)

    def on_connect(self, story_key):
        print(story_key)
        self.join(story_key)
        
        story = Story.objects.get(key=story_key)
        #for passage in story.passages.all():
        #    print(passage.title)
        #    self.emit('passage', passage.as_dict())
        #self.emit('rename_story', story.title)
        self.emit('connected', story.json())
    
    def on_delete(self, story_key, passage):
        print("Deleting %s" % passage)
        self.emit_to_room(story_key, 'delete', passage)
        Passage.objects.get(story__key = story_key, title=passage).delete()

    def on_rename_story(self, story_key, title):
        print("Renaming to %s" % title)
        story = Story.objects.get(key=story_key)
        story.title = title
        story.save()
        self.emit_to_room(story_key, 'rename_story', title)

