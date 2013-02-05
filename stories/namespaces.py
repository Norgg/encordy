from socketio.namespace import BaseNamespace
from socketio.mixins import RoomsMixin, BroadcastMixin
import json

class StoryNamespace(BaseNamespace, RoomsMixin, BroadcastMixin):
    def on_passage(self, story, passage):
        print(passage)
        self.emit_to_room(story, 'passage', passage)

    def on_connect(self, story):
        print(story)
        self.join(story)
        self.emit('connected')
        self.emit('passage', {"title": "lol", "content" : "I love horses.", "x": 100, "y": 100})

