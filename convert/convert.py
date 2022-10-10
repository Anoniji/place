#!/usr/bin/python3
# -*- coding: utf-8 -*-

import json
import datetime
import argparse
from PIL import Image
from colorama import init
from colorama import Fore, Style
init()


def rgb2hex(r, g, b):
    return '#{:02x}{:02x}{:02x}'.format(r, g, b)


def params_print(key):
    '''
    Color cmd
    '''
    values = {
        'INFO': Style.BRIGHT + Fore.CYAN,
        'OK': Style.BRIGHT + Fore.GREEN,
        'WARNING': Style.BRIGHT + Fore.YELLOW,
        'FAIL': Style.BRIGHT + Fore.RED,
        'DEFAULT': Style.BRIGHT + Fore.WHITE,
        'END': Style.RESET_ALL,
    }
    return values.get(key, Style.RESET_ALL)


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('-f', '--file', type=str, required=True)

    args = parser.parse_args()
    colorfile = args.file

    print(params_print('INFO'))


    print(r"  _____  _                  _                            _            ")
    print(r" |  __ \| |                (_)                          | |           ")
    print(r" | |__) | | __ _  ___ ___   _ _ __ ___  _ __   ___  _ __| |_ ___ _ __ ")
    print(r" |  ___/| |/ _` |/ __/ _ \ | | '_ ` _ \| '_ \ / _ \| '__| __/ _ \ '__|")
    print(r" | |    | | (_| | (_|  __/ | | | | | | | |_) | (_) | |  | ||  __/ |   ")
    print(r" |_|    |_|\__,_|\___\___| |_|_| |_| |_| .__/ \___/|_|   \__\___|_|   ")
    print(r"                                       | |                            ")
    print(r"                                       |_|                            " + params_print('END'))


    print('File: ' + colorfile)

    image = Image.open(colorfile)
    pixels = image.convert('RGB').load()
    width, height = image.size
    data = {}
    date = str(datetime.datetime.now().strftime("%d/%m/%Y %H:%M:%S"))

    print('SIZE: ' + str(width) + '/' + str(height))
    print('-' * 46)

    for x in range(width):
        for y in range(height):
            r, g, b = pixels[x, y]
            data[str(x) + "-" + str(y)] = {
                "color": rgb2hex(r, g, b),
                "user": "",
                "price": 1,
                "last_update": date
            }

    f = open('convert.json', 'wb')
    f.write(json.dumps(data).encode())
    f.close()
