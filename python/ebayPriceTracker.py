import requests
import argparse
import re
import os
from datetime import datetime

parser = argparse.ArgumentParser(description='Retrieve average price of item on eBay')
parser.add_argument('-n', '--name',default="",help="**REQUIRED** Item name")
args = parser.parse_args()

itemName = args.name
#"gtx 1050ti"
URL = 'https://www.ebay.com/sch/i.html?_from=R40&_nkw=' + itemName.replace(" ","+") + '&_sacat=0&rt=nc&LH_BIN=1'
response = requests.get(URL)
#only fetch options chain if response has status code 200 (success)
if response.status_code == 200:
    #print(str(response.content))
    html = str(response.content)
    splitPrices = html.split("<span class=s-item__price>")
    priceAvg = 0
    pricesCount = 0
    for price in splitPrices:
        dollarRemoved = price.split("$")
        if len(dollarRemoved) > 1:
            priceString = dollarRemoved[1].split("<")[0].replace(",","")
            if priceString.replace(".","").isnumeric():
                priceAvg += float(priceString)
                pricesCount += 1

    print("Avg price of " + itemName + ": $" + str(round(priceAvg / pricesCount,2)))
else:
    print("An error occurred: HTTP_" + str(response.status_code))
