import requests
import argparse
import re
import os
import time
from datetime import datetime

items = ['gtx 1050','gtx 1050 ti','gtx 1060','gtx 1070','gtx 1070 ti','gtx 1080','gtx 1080 ti','gtx 1660','gtx 1660 super','gtx 1660 ti','rtx 2060','rtx 2070','rtx 2070 super','rtx 2080','rtx 2080 super','rtx 2080 ti','rtx 3060','rtx 3060 ti','rtx 3070','rtx 3080','rtx 3090']
interval = 30
test = False

def priceOfItem(itemName):
    URL = 'https://www.ebay.com/sch/i.html?_from=R40&_nkw=' + itemName.replace(" ","+") + '&_sacat=0&LH_Auction=1&_sop=1'
    response = requests.get(URL)
    #only fetch options chain if response has status code 200 (success)
    if response.status_code == 200:
        #print(str(response.content))
        html = str(response.content)
        splitPrices = html.split("<span class=s-item__price>")
        priceAvg = 0
        pricesCount = 0
        priceArr = []
        priceValue = 0
        for price in splitPrices:
            dollarRemoved = price.split("$")
            if len(dollarRemoved) > 1:
                priceString = dollarRemoved[1].split("<")[0].replace(",","")
                if priceString.replace(".","").isnumeric():
                    priceArr.append(float(priceString))
                    priceAvg += float(priceString)
                    pricesCount += 1

        priceArr = sorted(priceArr)
        if (len(priceArr) < 5):
            priceValue = priceAvg
        else:
            for priceIndex in range(0,len(priceArr)):
                if priceIndex == int(len(priceArr) / 2):
                    priceValue = (priceArr[priceIndex - 2] + priceArr[priceIndex - 1] + priceArr[priceIndex] + priceArr[priceIndex + 1] + priceArr[priceIndex + 2]) / 5

        print("Avg price of " + itemName + ": $" + str(round(priceValue,2)))
        return '"' + itemName + '":' + str(round(priceValue,2))
    return '"' + itemName + '":0'

lastHour = -1
lastMinute = -1
while 1 == 1:
    time.sleep(1)
    if ((datetime.now().minute % interval == 0) and (lastMinute % interval != 0)) or test:
        test = False
        lastHour = datetime.now().hour
        lastMinute = datetime.now().minute
        timestamp = str(round(time.time() * 1000))
        output = '{"' + timestamp + '":{'
        print("\033c")
        print("     SCANNING     ")
        print("------------------")
        for name in items:
            output += priceOfItem(name) + ','
        output = output[:-1]
        output += '}}'
        file = open("prices/" + timestamp + ".json", "w")
        file.write(output)
        file.close()
    elif datetime.now().second == 0:
        print("\033c")
        lastMinString = str(lastMinute)
        if lastMinute == 0:
            lastMinString = "00"
        print("Last scan: " + str(lastHour) + ":" + lastMinString)
        print("")
