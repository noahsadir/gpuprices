import requests
import argparse
import re
import os
import time
from datetime import datetime

items = ['gtx 1050','gtx 1050 -ti','gtx 1050 ti','gtx 1060','gtx 1070','gtx 1070 -ti','gtx 1070 ti','gtx 1080','gtx 1080 -ti','gtx 1080 ti','gtx 1660','gtx 1660 -ti -super','gtx 1660 super','gtx 1660 ti','rtx 2060','rtx 2070','rtx 2070 -super','rtx 2070 super','rtx 2080','rtx 2080 -ti -super','rtx 2080 super','rtx 2080 ti','rtx 3060','rtx 3060 -ti','rtx 3060 ti','rtx 3070','rtx 3080','rtx 3090']
interval = 15
attempts = 0
test = True

# Works without a problem, but not really the most accurate way to get price of sold items, as these auctions may
# have quite a bit of bidding to go. From personal observation (at least for graphics cards), the prices are deflated
# by roughly 10-20%.
def priceOfItem(itemName):
    URL = 'https://www.ebay.com/sch/i.html?_nkw=' + itemName.replace(" ","+") + '&_sacat=0&LH_Auction=1&_sop=1'
    #URL = 'https://www.google.com'
    response = requests.get(URL)
    #only fetch options chain if response has status code 200 (success)
    if response.status_code == 200:
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

        if pricesCount > 0:
            priceAvg = priceAvg / pricesCount
            priceArr = sorted(priceArr)
            if (len(priceArr) < 10):
                priceValue = priceAvg
            else:
                for priceIndex in range(0,len(priceArr)):
                    if priceIndex == int(len(priceArr) / 2):
                        priceValue = (priceArr[priceIndex - 4] + priceArr[priceIndex - 3] + priceArr[priceIndex - 2] + priceArr[priceIndex - 1] + priceArr[priceIndex] + priceArr[priceIndex + 1] + priceArr[priceIndex + 2] + priceArr[priceIndex + 3] + priceArr[priceIndex + 4]) / 9

            print("Avg price of " + itemName + ": $" + str(round(priceValue,2)) + " or $" + str(round(priceAvg,2)))
            return '"' + itemName + '":' + str(round(priceValue,2))
    return None

# Doesn't work particulary well. Constantly gets captcha'd and has occasional parse issues.
# Ebay probably doesn't want this page to be scraped and definitely monitors for such activity.
def priceSold(itemName):
    global attempts
    #URL = 'https://www.ebay.com/sch/i.html?_nkw=' + itemName.replace(" ","+") + '&_in_kw=1&_ex_kw=ti&_sacat=0&LH_Sold=1&_udlo=&_udhi=&LH_Auction=1&_samilow=&_samihi=&_sadis=15&_stpos=30152&_sargn=-1%26saslc%3D1&_salic=1&_sop=12&_dmd=1&_ipg=50&LH_Complete=1&_fosrp=1'
    URL = 'https://www.ebay.com/sch/i.html?_nkw=' + itemName.replace(" ","+") + '&_in_kw=1&_ex_kw=&_sacat=0&LH_Sold=1&_udlo=&_udhi=&LH_Auction=1&_samilow=&_samihi=&_sadis=15&_stpos=30152&_sargn=-1%26saslc%3D1&_salic=1&_sop=12&_dmd=1&_ipg=50&LH_Complete=1&_fosrp=1'
    #URL = 'https://www.google.com'
    response = requests.get(URL)
    #only fetch options chain if response has status code 200 (success)
    if response.status_code == 200:
        #print(str(response.content))
        html = str(response.content)
        #file = open("prices/item.html", "w")
        #file.write(str(response.content))
        #file.close()
        splitPrices = html.split('class="bold bidsold">')
        if len(splitPrices) < 5 and attempts < 15:
            attempts += 1
            return priceSold(itemName)
        attempts = 0
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

        if pricesCount > 0:
            priceAvg = priceAvg / pricesCount
            priceArr = sorted(priceArr)
            if (len(priceArr) < 10):
                priceValue = priceAvg
            else:
                for priceIndex in range(0,len(priceArr)):
                    if priceIndex == int(len(priceArr) / 2):
                        priceValue = (priceArr[priceIndex - 4] + priceArr[priceIndex - 3] + priceArr[priceIndex - 2] + priceArr[priceIndex - 1] + priceArr[priceIndex] + priceArr[priceIndex + 1] + priceArr[priceIndex + 2] + priceArr[priceIndex + 3] + priceArr[priceIndex + 4]) / 9

            print("Sale price of " + itemName + ": $" + str(round(priceValue,2)) + " or $" + str(round(priceAvg,2)))
            return '"sold_' + itemName + '":' + str(round(priceValue,2))
    return None

lastHour = -1
lastMinute = -1
while 1 == 1:
    time.sleep(1)
    if ((datetime.now().minute % interval == 0) and (lastMinute != datetime.now().minute)) or (test == True):
        test = False
        lastHour = datetime.now().hour
        lastMinute = datetime.now().minute
        timestamp = str(round(time.time() * 1000))
        output = '{"' + timestamp + '":{'
        print("\033c")
        print("     SCANNING     ")
        print("------------------")
        successCount = 0
        for name in items:
            price = priceOfItem(name)
            salePrice = priceSold(name)
            if price is not None:
                output += price + ','
                output += salePrice + ','
                successCount += 1
            else:
                print("error fetching " + name)
        if successCount > 0:
            output = output[:-1]
            output += '}}'
            os.makedirs(os.path.dirname("prices/" + timestamp + ".json"), exist_ok=True)
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
