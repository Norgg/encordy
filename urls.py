from django.conf.urls import patterns, include, url
import stories.views

from django.contrib import admin
admin.autodiscover()

urlpatterns = patterns('',
    url(r'^$', stories.views.home, name='home'),
    url(r'^story/', include('stories.urls')),

    url(r'^admin/doc/', include('django.contrib.admindocs.urls')),
    url(r'^admin/', include(admin.site.urls)),
    url(r'^static/(?P<path>.*)$', 'django.views.static.serve', dict(document_root='static')),
    url(r'^socket\.io', stories.views.socket, name='socketio_service'),
)
