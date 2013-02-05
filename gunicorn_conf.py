#!python
from os import environ
from gevent import monkey
monkey.patch_all()

bind = "0.0.0.0:8000"
workers = 1 # fine for dev, you probably want to increase this number in production
worker_class = "socketio.sgunicorn.GeventSocketIOWorker"

def pre_fork(server, worker):
    # avoids starting the policy server for every single worker
    if environ.get('POLICY_SERVER', None) is None:
        environ['POLICY_SERVER'] = 'true'
        worker.policy_server = True
