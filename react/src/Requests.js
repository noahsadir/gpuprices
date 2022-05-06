/*-------------------------------- *
* Requests.js                      *
* -------------------------------- *
* Helper class which fetches data  *
* from various souces and prepares *
* it for processing.               *
* -------------------------------- */

/*        pain         */

export function JSON_RETRIEVE(jobID, args, REQUEST_LISTENER, testMode){
  if (testMode){
    REQUEST_LISTENER(jobID,true,require('../api/test/' + jobID + '.json'));
    //Retrieve sample data if API is not available
  }else{
    //Make request to API for JSON
    var urlValue = "";
    var fetchDetails = {};

    //Determine URL to send request to and the data to send with it.
    if (jobID == "FETCH_PRICES") {
      urlValue = "../api/fetch_prices.php?interval=" + args.interval.toString() + "&from=" + args.start.toString();
    }

    console.log("fetching data from " + urlValue);
    //Fetch is not as intuitive as you would think
    fetch(urlValue,fetchDetails)
    .then(function(promise) {
      //Get the type of content
      const contentType = promise.headers.get("content-type");

      if (contentType && contentType.indexOf("application/json") !== -1) {
        //Wait for promise to be fulfilled, then return valid JSON
        return promise.json().then(data => {
          REQUEST_LISTENER(jobID,true,data);
        }).catch(function(error) {
          //Notify listener that request failed with error
          REQUEST_LISTENER(jobID,false,reportError("PROMISE_BROKEN"));
          console.log(error);
        });
      } else {
        return promise.text().then(text => {
          //The request worked, but the data is invalid. Should be JSON.
          //Notify listener that request failed with error
          REQUEST_LISTENER(jobID,false,reportError("NOT_JSON"));

        }).catch(function(error) {

          //Notify listener that request failed with error
          REQUEST_LISTENER(jobID,false,reportError("PROMISE_BROKEN"));
          console.log(error);
        });
      }
    })
    .catch(function(error) {
      //Data couldn't be fetched. Probably a network or config error
      REQUEST_LISTENER(jobID,false,reportError("NO_FETCH"));
      console.log(error);
    });
  }
}

//Generates somewhat nice error message
function reportError(type){
  return "Couldn't fetch data: ERROR_" + type;
}
