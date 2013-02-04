from django.conf.urls import patterns, include, url

import views

with_key = patterns('',
    url('^/edit/$', views.edit_story, name='edit_story'),
    url('^/play/$', views.play_story, name='play_story'),
    url('^.json$', views.json_story, name='json_story'),
)

urlpatterns = patterns('',
    url(r'^(?P<key>\w{1,20})', include(with_key))
)
