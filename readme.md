# GPU Price Tracker

### Track the prices of various graphics cards on eBay

As many may know, demand for graphics cards has skyrocketed and supply shortages have led to them being out of stock nearly everywhere, causing scalpers to list cards on eBay at incredibly marked up prices.

This web app tracks the average price of eBay auctions ending soonest, which can usually provide a good indicator for what people are willing to pay for these cards.

### How the data is collected

The python script runs in the background and scrapes eBay at a specified interval (15 mins default).
To determine the price of cards, the following criteria are used:

- First page of listings
- Sorted by auctions ending soonest
- Average of 10 median prices

These prices are then averaged together to form the final price estimate.
Note: I'm not a statistician. There are certainly better ways to get an accurate price, but I've found that this is the simplest way to get a fairly accurate price.

#### Why pick the 10 median prices?

There tends to be significant outliers which affect the data, such as:
- An auction listed with an outrageous starting price with no bids (e.g. $20,000 for a GTX 1050)
- Someone selling mulitple cards at a time (e.g. $10,000 for 4 RTX 3080s)
- A listing for an unrelated or loosely related item (e.g. $50 for a replacement fan)

As such, picking the 10 median cards (out of 50ish listings) seems to be the best way, though it may be a slight underestimate as the auctions that get bid up last minute tend to get thrown out.

Still, I personally find a 5-10% underestimate better than a random 600% overestimate caused by the aforementioned outliers.
