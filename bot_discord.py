#!/usr/bin/python3
# -*- coding: utf-8 -*-
import os, sys
import json
import discord

# https://discord.com/oauth2/authorize?client_id=1022156371262722189&permissions=67175424&scope=bot

# init vars
file_config = './config.json'
if os.path.isfile(file_config):
    f = open(file_config, 'r')
    conf = json.loads(f.read())
    TOKEN = conf['discord']['BOT_TOKEN']
    start_pxs = conf['discord']['start_pxs']
else:
    print('not_found', file_config)
    sys.exit(0)

# DISCORD
USERS_DIR = './users/'
client = discord.Client()

#----------------------------------------------------------------------- USER PX

def getUserPX(client_id):
    global USERS_DIR

    USER_FILE = USERS_DIR + str(client_id) + '.px'
    if os.path.isfile(USER_FILE):
        f = open(USER_FILE, 'r')
        total = str(f.read())
        f.close()
    else:
        total = 0

    return total


def updateUserPX(client_id):
    global USERS_DIR, start_pxs

    USER_FILE = USERS_DIR + str(client_id) + '.px'
    if not os.path.isfile(USER_FILE):
        f = open(USER_FILE, 'w')
        f.write(str(start_pxs))
        f.close()

    f = open(USER_FILE, 'r')
    cur = int(f.read())
    cur += 1
    f.close()

    f = open(USER_FILE, 'w')
    f.write(str(cur))
    f.close()

#----------------------------------------------------------------------- USER PX

@client.event
async def on_ready():
    game = discord.Game("compter les points")
    await client.change_presence(status=discord.Status.idle, activity=game)
    print('Discord: We have logged in as {0.user}'.format(client))

@client.event
async def on_message(message):
    global USERS_DIR, start_pxs

    if message.author == client.user:
        return

    updateUserPX(message.author.id)
    if message.content.startswith('!place points'):
        print('<1>')
        msg = """```Markdown
# """ + getUserPX(message.author.id) + """ pxs```"""
        await message.channel.send(msg)

    elif message.content.startswith('!place'):
        print('<2>')
        msg = """```Markdown
# Place bot v1```"""
        await message.channel.send(msg)

client.run(TOKEN)
