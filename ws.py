#!/usr/bin/env python

import os
import json
import asyncio
import websockets

import gevent
from gevent import monkey
monkey.patch_all()
import time


# init vars
modes = ['free', 'time', 'price']
places = {}
clients = set()
wip = "F" # T (True)/F (False)


def save_places():
    global places

    while(True):
        # print('backup>')
        for place, data in places.items():
            try:
                f = open('./json/' + str(place).upper() + '.json', 'w')
                f.write(json.dumps(data))
                f.close()

            except Exception as e:
                print(place, e)

        time.sleep(60)


async def handler(websocket, path):
    global places, clients, wip, modes

    print('new_client>')
    clients.add(websocket)
    try:
        while(True):
            msg = await websocket.recv()
            # print(f'From Client: {msg}')

            if msg.startswith("load"):
                tag, user, session = msg.split(';')
                if session in places:
                    await websocket.send('place_data;'+ wip + ';' + json.dumps(places[session]))

                else:
                    if session not in places:
                        places[session] = {}

                    file_session = './json/' + str(session).upper() + '.json'
                    if os.path.isfile(file_session):
                        f = open(file_session, 'r')
                        content = f.read()

                        if content == '':
                            content = r'{}'

                        content = json.loads(content)
                        places[session] = content

                        await websocket.send('place_data;' + wip + ';' + json.dumps(content))

                    else:
                        places[session]['width'] = 100
                        places[session]['height'] = 100
                        places[session]['creator'] = str(user)
                        places[session]['writing'] = True
                        places[session]['mode'] = modes[0]
                        places[session]['data'] = {}
                        await websocket.send('place_create;' + session)

            elif msg.startswith("size"):
                tag, user, session, width, height = msg.split(';')
                try:
                    if session in places:
                        if user != places[session]['creator']:
                            await websocket.send('place_error;You are not the creator')
                        elif int(width) < places[session]['width'] or int(height) < places[session]['height']:
                            await websocket.send('place_error;Invalid size')
                        elif not places[session]['writing']:
                            await websocket.send('place_error;Read-only Place')
                        else:
                            places[session]['width'] = int(width)
                            places[session]['height'] = int(height)

                            for ws in clients:
                                await ws.send('new_size;' + session + ';' + width + ';' + height)
                    else:
                        await websocket.send('place_error;Not found')

                except Exception as e:
                    await websocket.send('place_error;' + str(e))

            elif msg.startswith("add"):
                tag, user, session, poss, data = msg.split(';')
                if session in places:
                    if not places[session]['writing']:
                        await websocket.send('place_error;Read-only Place')
                    else:
                        try:
                            places[session]['data'][poss] = json.loads(data)
                            for ws in clients:
                                if ws != websocket:
                                    await ws.send('new_px;' + user + ';' + session + ';' + poss + ';' + data)

                        except Exception as e:
                            await websocket.send('place_error;' + str(e))
                else:
                    await websocket.send('place_error;Not found')

            elif msg.startswith("remove"):
                tag, user, session, poss = msg.split(';')
                if session in places:
                    if not places[session]['writing']:
                        await websocket.send('place_error;Read-only Place')
                    else:
                        try:
                            del places[session]['data'][poss]
                            for ws in clients:
                                if ws != websocket:
                                    await ws.send('del_px;' + user + ';' + session + ';' + poss)

                        except Exception as e:
                            await websocket.send('place_error;' + str(e))
                else:
                    await websocket.send('place_error;Not found')

            elif msg.startswith("clear"):
                tag, user, session = msg.split(';')
                if session in places:
                    if user != places[session]['creator']:
                        await websocket.send('place_error;You are not the creator')
                    elif not places[session]['writing']:
                        await websocket.send('place_error;Read-only Place')
                    else:
                        try:
                            places[session]['data'] = {}
                            for ws in clients:
                                await ws.send('del_all_px;' + user + ';' + session)

                        except Exception as e:
                            await websocket.send('place_error;' + str(e))
                else:
                    await websocket.send('place_error;Not found')

            elif msg.startswith("writing"):
                tag, user, session, write = msg.split(';')
                if session in places:
                    if user != places[session]['creator']:
                        await websocket.send('place_error;You are not the creator')
                    else:
                        try:
                            if write == "T":
                                places[session]['writing'] = True
                            else:
                                places[session]['writing'] = False

                            for ws in clients:
                                await ws.send('write_change;' + user + ';' + session + ';' + write)

                        except Exception as e:
                            await websocket.send('place_error;' + str(e))
                else:
                    await websocket.send('place_error;Not found')

            elif msg.startswith("mode"):
                tag, user, session, mode = msg.split(';')
                if session in places:
                    if user != places[session]['creator']:
                        await websocket.send('place_error;You are not the creator')
                    elif not places[session]['writing']:
                        await websocket.send('place_error;Read-only Place')
                    else:
                        try:
                            if mode not in modes:
                                await websocket.send('place_error;Mode not exist')

                            places[session]['mode'] = mode
                            for ws in clients:
                                await ws.send('mode_change;' + user + ';' + session + ';' + mode)

                        except Exception as e:
                            await websocket.send('place_error;' + str(e))
                else:
                    await websocket.send('place_error;Not found')

    except Exception:
        print('client_disconnect>')

    finally:
        clients.remove(websocket)

gevent.spawn(save_places)

start_server = websockets.serve(handler, 'localhost', 5358)
asyncio.get_event_loop().run_until_complete(start_server)
asyncio.get_event_loop().run_forever()
