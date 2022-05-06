# (Nvidia) GPU Price Tracker

### Track the prices of various graphics cards on eBay

As many may know, graphics card prices skyrocketed throughout 2021 for various reasons.

This web app tracks the average price of eBay auctions ending soonest, which can usually provide a good indicator for what people are willing to pay for these cards.

### How to use

- Visit the website [gpuprices.noahsadir.io](https://gpuprices.noahsadir.io).

- Click on the desired card on the list to view a chart with a timeframe toggle below. It should have an app-like interface which is pretty self-explanatory.

You can install it as an iOS web app too! ```Share``` -> ```Add to Home Screen```

### How the data is collected

The python script runs in the background and scrapes eBay at a specified interval (15 mins default).
To determine the price of cards, the following criteria are used:

- First page of listings sorted by auctions ending soonest
- Average of 10 median prices

These prices are then averaged together to form the final price estimate.

_Note:_ I'm not a statistician. There are certainly better ways to get an accurate price, but I've found that this is the simplest way to get a fairly accurate price.

### Why pick the 10 median prices?

There tends to be significant outliers which affect the data, such as:
- An auction listed with an outrageous starting price with no bids (e.g. $20,000 for a GTX 1050)
- Someone selling mulitple cards at a time (e.g. $10,000 for 4 RTX 3080s)
- A listing for an unrelated or loosely related item (e.g. $50 for a replacement fan)

As such, picking the 10 median cards (out of 50ish listings) seems to be the best way, though it may be a slight underestimate as the auctions that get bid up last minute tend to get thrown out.

Still, I personally find a 5-10% underestimate better than a random 600% spike in the data caused by the aforementioned outliers.

### Limitations

This data is purely for entertainment purposes and to highlight the ridiculous prices that these cards are selling for. They are in no way to be used for making buying decisions and should not be relied on to do so.

Furthermore, it's particularly hard to get the price of a specific variant of a GPU, especially the base models. For example, the cards that show up under the search ```rtx 3060``` may include a mix of the standard 3060 and the 3060 Ti. Also, I've seen non-Ti cards show up under ```rtx 2080 ti``` because the card is listed as ```RTX 2080 (NOT Ti)```. Additionally, cards from different manufacturers (EVGA, MSI, ASUS, etc.) sell at different prices, which may also impact the price quote.

Overall, as mentioned before, this is for entertainment purposes only and serves to give a ballpark estimate rather than a precise price quote. It's best to use the data to observe price trends.
