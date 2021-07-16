import requests
import argparse
import re
import os
import time
from datetime import datetime

# Set up command line arguments
parser = argparse.ArgumentParser(description='Retrieve prices of items on eBay')
parser.add_argument('-i', '--interval',default=15, type=int,help="Interval (in minutes) to scan prices")
parser.add_argument('-t', '--test',default="false",help="Toggle test mode")
args = parser.parse_args()

# Make sure items file exists
if not os.path.isfile("items.txt"):
    print("Error reading items.txt")
    quit()

# Read lines of file and give error if no items exist
items = open("items.txt", "r").read().split("\n")
if len(items) <= 1:
    print("Please add items to scan in items.txt")
    quit()

# Last line may be empty; omit if so
if items[-1] == "":
    items = items[:-1]

interval = 15
test = False

if args.interval is not None:
    interval = args.interval
    print("Scanning w/ interval " + str(interval))
else:
    print("Interval not specified; default 15")

if args.test == "true":
    test = True
    print("Test mode enabled")
else:
    print("Test mode NOT enabled")

# Store last fetch time
lastHour = -1
lastMinute = -1

# Works without a problem, but not really the most accurate way to get price of sold items, as these auctions may
# have quite a bit of bidding to go. From personal observation (at least for graphics cards), the prices are deflated
# by roughly 10-20%. Thus, it's better to use this data to observe trends rather than gather a quote.
def priceOfItem(itemName):
    URL = 'https://www.ebay.com/sch/i.html?_nkw=' + itemName.replace(" ","+") + '&_sacat=0&LH_Auction=1&_sop=1'
    response = requests.get(URL)

    #only fetch options chain if response has status code 200 (success)
    if response.status_code == 200:
        # Get HTML of webpage and split at each price element
        html = str(response.content)
        splitPrices = html.split("<span class=s-item__price>")

        priceAvg = 0 # Stores average of every single price
        pricesCount = 0
        priceArr = [] # Used for finding median price
        priceValue = 0
        for price in splitPrices:
            # splitPrices should contain a bunch of HTML, but we can split at the dollar sign to get the item price.
            dollarRemoved = price.split("$")

            # Only parse data if there is text to parse (length <= 1 would indicate a parse issue)
            if len(dollarRemoved) > 1:
                # Ignore everything after price value (which should be followed by an element closing tag)
                priceString = dollarRemoved[1].split("<")[0].replace(",","")

                # Make sure price collected is an actual number
                if priceString.replace(".","").isnumeric():
                    priceArr.append(float(priceString))
                    priceAvg += float(priceString) # Not really necessary; more for debugging purposes
                    pricesCount += 1

        # Calculate average and 9 median prices
        if pricesCount > 0:
            priceAvg = priceAvg / pricesCount

            # Sort array in ascending order to find median
            priceArr = sorted(priceArr)

            # Get the raw average if 9 prices can't be fetched (last resort; shouldn't happen)
            # This may lower the quality of the data. If you'd rather have missing data points, return None instead
            if (len(priceArr) < 10):
                priceValue = priceAvg
            else:
                # Find midpoint of the array and get 4 values from each side plus the mid value itself,
                # then divide by 9
                midpointIndex = int(len(priceArr) / 2)
                priceValue = 0

                for priceIndex in range(midpointIndex - 4, midpointIndex + 5):
                    priceValue += priceArr[priceIndex]

                priceValue /= 9

            print("Avg price of " + itemName + ": $" + str(round(priceValue,2)) + " or $" + str(round(priceAvg,2)))
            return '"' + itemName + '":' + str(round(priceValue,2))
    return None

# Should run forever (if 1 != 1, we have a problem)
while 1 == 1:
    # Sleep for one second
    time.sleep(1)

    # Fetch data at every nth minute of each hour.
    # Works fine for numbers < 60 that are divisible by 60 (1, 2, 3, 4, 5, 6, 10, 12, 15, 20, 30)
    if ((datetime.now().minute % interval == 0) and (lastMinute != datetime.now().minute)) or (test == True):
        test = False
        # store the last minute and hour to prevent multiple scans during that minute
        lastHour = datetime.now().hour
        lastMinute = datetime.now().minute

        timestamp = str(round(time.time() * 1000))

        # Create JSON object with one item that has the current time as its key
        output = '{"' + timestamp + '":{'
        print("\033c")
        print("     SCANNING     ")
        print("------------------")
        successCount = 0
        for name in items:
            # Get price of each item in the list
            price = priceOfItem(name)

            # Add price to list if it exists
            if price is not None:
                output += price + ','
                successCount += 1
            else:
                print("error fetching " + name)

        # Only create a file if price for at least one item was successfully fetched
        if successCount > 0:
            output = output[:-1] # Remove last comma
            output += '}}' # Close JSON

            # make a 'prices' directory if it doesn't exist
            os.makedirs(os.path.dirname("prices/" + timestamp + ".json"), exist_ok=True)

            # Write JSON string to file
            file = open("prices/" + timestamp + ".json", "w")
            file.write(output)
            file.close()
    elif datetime.now().second == 0:
        # Don't fetch prices now, but display last scan date
        print("\033c")
        lastMinString = str(lastMinute)
        if lastMinute == 0:
            lastMinString = "00"
        elif lastMinute < 10:
            lastMinString = "0" + str(lastMinute)
        print("Last scan: " + str(lastHour) + ":" + lastMinString)
        print("")
