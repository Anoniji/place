#!/usr/bin/env python

import os
import sys
import json
import time
import datetime
import glob
import asyncio
import websockets
import compress_json

import gevent
from gevent import monkey
monkey.patch_all()


# init vars
file_config = './config.json'
if os.path.isfile(file_config):
    f = open(file_config, 'r')
    config = f.read()
    conf = json.loads(config)

    ws_host = conf['place']['host']
    ws_port = conf['place']['port']

    trace = conf['place']['trace']
    compress = conf['place']['compress']
    start_pxs = conf['place']['start_pxs']
    delta_pxs = conf['place']['delta_pxs']
    saveL_pxs = conf['place']['saveL_pxs']
    modes = conf['place']['modes']
    wip = conf['place']['wip']
else:
    print('not_found', file_config)
    sys.exit(0)


pos = 0
places = {}
users = {}
clients = set()


def unique(lst):
    ulist = []
    for x in lst:
        if x not in ulist:
            ulist.append(x)

    return ulist

def save_places():
    global places, trace, saveL_pxs, compress

    while(True):
        if trace:
            print('backup>')

        for place, data in places.items():
            if data['writing']:
                if 'change' in data:
                    try:
                        if compress:
                            compress_json.dump(data, './json/' + str(place).upper() + '.json.gz')
                        else:
                            f = open('./json/' + str(place).upper() + '.json', 'w')
                            f.write(json.dumps(data))
                            f.close()

                        del places[place]['change']

                    except Exception as e:
                        print('save_places_error:', place, e)

        time.sleep(saveL_pxs)


def save_users():
    global users, trace

    while(True):
        if trace:
            print('backup>')

        for user, data in users.items():
            if 'change' in data:
                try:
                    f = open('./users/' + str(data['user']).upper() + '.px', 'w')
                    f.write(str(data['pxs']))
                    f.close()

                    del data['change']

                except Exception as e:
                    print('save_users_error:', data['user'], e)

        time.sleep(10)


def getUserPX(client_id):
    if os.path.isfile('./users/' + str(client_id) + '.px'):
        f = open('./users/' + str(client_id) + '.px', 'r')
        return f.read()
    else:
        f = open('./users/' + str(client_id) + '.px', 'w')
        f.write(str(start_pxs))
        f.close()
        return str(start_pxs)


async def handler(websocket, path):
    global trace, places, users, clients, wip, modes, pos, delta_pxs, guests

    if trace:
        print('new_client>')

    clients.add(websocket)
    client_id = pos
    pos += 1

    try:
        while(True):
            msg = await websocket.recv()
            # print(f'From Client: {msg}')

            if msg.startswith("list"):

                placelist = []
                for file in sorted(glob.glob("./json/*")):
                    placelist.append(os.path.basename(file).replace('.json', '').replace('.gz', ''))

                placelist = str(unique(placelist))
                await websocket.send('place_list;' + placelist)

            elif msg.startswith("init"):
                tag, user = msg.split(';')
                user = str(user).upper()
                userPx = getUserPX(user)
                users[client_id] = {
                    'user': user,
                    'pxs': int(userPx)
                }
                await websocket.send('user_px;' + userPx)

                if wip:
                    await websocket.send('wip')

            elif msg.startswith("load"):
                tag, user, session = msg.split(';')
                if session.strip() == '':
                    await websocket.send('place_error;Empty Session')
                    continue

                elif client_id not in users:
                    await websocket.send('place_error;Unidentified client')
                    continue

                elif session in places:
                    await websocket.send('place_data;' + json.dumps(places[session]))
                    continue

                else:
                    if session not in places:
                        places[session] = {}

                    file_session = './json/' + str(session).upper() + '.json'
                    file_session_gz = './json/' + str(session).upper() + '.json.gz'

                    if os.path.isfile(file_session_gz):
                        if trace:
                            print('from_gz')
                        content = compress_json.load(file_session_gz)
                        if content == '':
                            content = r'{}'

                        places[session] = content
                        await websocket.send('place_data;' + wip + ';' + json.dumps(content))

                    elif os.path.isfile(file_session):
                        if trace:
                            print('from_json')
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
                            places[session]['change'] = True
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
                px_price = 1
                if session in places:
                    if places[session]["mode"] == "time":
                        if poss in places[session]["data"]:
                            last_update = places[session]["data"][poss]['last_update']
                            last_update = datetime.datetime.strptime(
                                last_update, '%a, %d %b %Y %H:%M:%S %Z')
                            get_dtnow = datetime.datetime.utcnow()
                            dt_diff = (get_dtnow - last_update).total_seconds()
                            if dt_diff <= delta_pxs:
                                await websocket.send('place_error;The pixel is not yet available')
                                continue

                    elif places[session]["mode"] == "price":
                        if poss in places[session]['data']:
                            px_price = places[session]['data'][poss]['price']

                        if (users[client_id]['pxs'] - px_price) <= 0:
                            await websocket.send('place_error;No point')
                            continue

                        users[client_id]['pxs'] = users[client_id]['pxs'] - px_price
                        users[client_id]['change'] = True
                        await websocket.send('user_px;' + str(users[client_id]['pxs']))

                    if not places[session]['writing']:
                        await websocket.send('place_error;Read-only Place')
                    else:
                        try:
                            places[session]['change'] = True
                            places[session]['data'][poss] = json.loads(data)
                            places[session]['data'][poss]['price'] = px_price + 1
                            for ws in clients:
                                if ws != websocket:
                                    await ws.send('new_px;' + user + ';' + session + ';' + poss + ';' + json.dumps(
                                        places[session]['data'][poss]))

                        except Exception as e:
                            await websocket.send('place_error;' + str(e))
                else:
                    await websocket.send('place_error;Not found')

            elif msg.startswith("remove"):
                tag, user, session, poss = msg.split(';')
                if session in places:
                    if user != places[session]['creator']:
                        await websocket.send('place_error;You are not the creator')
                    elif not places[session]['writing']:
                        await websocket.send('place_error;Read-only Place')
                    else:
                        try:
                            places[session]['change'] = True
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
                            places[session]['change'] = True
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
                            places[session]['change'] = True
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
                            else:
                                places[session]['change'] = True
                                places[session]['mode'] = mode
                                for ws in clients:
                                    await ws.send('mode_change;' + user + ';' + session + ';' + mode)

                        except Exception as e:
                            await websocket.send('place_error;' + str(e))
                else:
                    await websocket.send('place_error;Not found')

    except Exception:
        if trace:
            print('client_disconnect>')

    finally:
        clients.remove(websocket)
        if client_id in users:
            del users[client_id]

gevent.spawn(save_places)
gevent.spawn(save_users)

start_server = websockets.serve(handler, ws_host, ws_port)
asyncio.get_event_loop().run_until_complete(start_server)
asyncio.get_event_loop().run_forever()
