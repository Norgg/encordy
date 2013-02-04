from socketio.namespace import BaseNamespace
from socketio.mixins import RoomsMixin, BroadcastMixin
import json

class StoryNamespace(BaseNamespace, RoomsMixin, BroadcastMixin):
    def on_passage(self, *args):
        print("yay")
        self.broadcast_event('passage', *args)
