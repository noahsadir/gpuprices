/*
-----------------------------
           App.js
  Created on March 23, 2021
-----------------------------
*/

import logo from './logo.svg';
import backButton from './res/arrow_back_white_24dp.svg';
import githubLogo from './res/github.svg';
import './App.css';
import React from "react";
import {JSON_RETRIEVE} from './Requests';
import { Line } from 'react-chartjs-2'

var itemDisplayInfo = require('./itemDisplayInfo.json');
var isTestMode = false;
var priceInterval = 3600000;

/**
 * Main object and "starting" point of the app.
 *
 * Currently set up so that custom child elements
 * (NavigationBar, ItemList, ItemView, etc.) should
 * propogate important variables and events to their parent.
 */
export default class App extends React.Component {
  constructor(props) {
      super(props);
      this.state = {
        didFetchData: false,
        selectedItem: null,
        data: null,
      }
  }

  render() {
    //List item selected; save its value for later reference
    const itemSelected = (item) => {
      this.setState({selectedItem: item});
    }

    //Back button was selected (mobile), deselect item from list
    const navigationBackSelected = () => {
      this.setState({selectedItem: null});
    }

    //Price data not yet retrieved; fetch asynchronously
    if (this.state.didFetchData == false) {
      JSON_RETRIEVE("FETCH_PRICES", {interval: priceInterval, start: 0}, (type, success, data) => {
        if (success) {
          this.setState({data: data, didFetchData: true});
        }
      }, isTestMode); //Will fetch dummy if isTestMode is true
    }

    //UI code
    return (
      <div className="App" style={{display: "flex", flexFlow: "column"}}>
        <div id="navigation-container" style={{display: "flex", flexGrow: 1, height: 64, maxHeight: 64, minHeight: 64}}>
          <NavigationBar onBack={navigationBackSelected} selectedItem={this.state.selectedItem}/>
        </div>
        <div id="main-content-container" style={{display: "flex", flexGrow: 1, maxHeight: "calc(100vh - 64px)"}}>
          <div id="item-list-container" class={(this.state.selectedItem == null) ? "content-active" : "content-inactive"} style={{flex: "1 0 0"}}>
            <ItemList displayInfo={itemDisplayInfo} onSelect={itemSelected} selectedItem={this.state.selectedItem}/>
          </div>
          <div id="item-view-container" class={(this.state.selectedItem == null) ? "content-inactive" : "content-active"} style={{visibility: (this.state.selectedItem == null) ? "hidden" : "visible", flex: "2 0 0"}}>
            <ItemView data={this.state.data} displayInfo={itemDisplayInfo} selectedItem={this.state.selectedItem}/>
          </div>
        </div>
      </div>
    );
  }
}

/**
 * Displays generic app info and navigation controls, depending
 * on app state and window size.
 *
 * @param onBack the function which should be called when the back button is pressed
 * @param selectedItem the item currently selected by the ItemList
 */
class NavigationBar extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {

    //Pass back button function call to parent object
    const handleBackButtonClick = (event) => {
        this.props.onBack(); //Call parent function
    }

    //UI code
    return (
      <div id="navigation-bar" style={{display: "flex", height: 64, backgroundColor: '#000004', width: "100%"}}>
        <div id="back-button-container" class={(this.props.selectedItem == null) ? "content-inactive" : "content-active"} style={{display: "none", flexGrow: 1, minWidth: 64, maxWidth: 64, minHeight: 64, maxHeight: 64, padding: 0, margin: 0}}>
          <button id="back-button" class="icon-button" onClick={handleBackButtonClick}>
            <img src={backButton}/>
          </button>
        </div>
        <div id="item-view-title-container" class={(this.props.selectedItem == null) ? "content-inactive" : "content-active"} style={{display: "none", flexFlow: "column", flexGrow: 1, padding: 8, margin: 0}}>
          <p id="item-view-title" style={{height: 48, textAlign: "center", paddingRight: 64, lineHeight: "48px", margin: 0, fontSize: 20, fontWeight: 600}}>Overview</p>
        </div>
        <div id="title-container" class={(this.props.selectedItem == null) ? "content-active" : "content-inactive"} style={{display: "flex", flexFlow: "column", flexGrow: 1, padding: 8, margin: 0}}>
          <p id="title" style={{height: 32, lineHeight: "32px", margin: 0, paddingLeft: 8, fontSize: 24, fontWeight: 600}}>NVIDIA Price Tracker</p>
          <p id="subtitle" style={{height: 14, lineHeight: "14px", margin: 0, paddingLeft: 8, fontSize: 14}}>by Noah Sadir</p>
        </div>
        <div id="source-button-container" class={(this.props.selectedItem == null) ? "content-active" : "content-inactive"} style={{display: "flex", flexGrow: 1, minWidth: 64, maxWidth: 64, minHeight: 64, maxHeight: 64, padding: 0, margin: 0}}>
          <a class="icon-button" target="_blank" href="https://github.com/noahsadir/gpuprices/"><img style={{filter: "invert(100%)", width: 32, height: 32, padding: 8}} src={githubLogo}/></a>
        </div>
      </div>
    );
  }
}

/**
 * Displays a list of available items to get data for.
 *
 * @param onSelect the function which should be called when the selection changes
 * @param displayInfo a JSON object containing background info on the item with format
 *                    {@code { "item_1_name":{"name":"Fancy Name","company":"Example Inc.","msrp":700},"item_2_name"...}}
 * @param selectedItem the item currently selected (or at least should be)
 */
class ItemList extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {

    //Pass function call to parent, but only if the item clicked was not the one currently selected.
    const itemClicked = (event) => {
      //Only run select action if different item is selected
      if (this.props.selectedItem != event.target.id) {
        this.setState({selectedItem: event.target.id});
        this.props.onSelect(event.target.id); //Call parent function
      }
    }

    //Replace displayInfo with empty object if null
    var displayInfo = (this.props.displayInfo == null) ? {} : this.props.displayInfo;
    var listItems = [];

    //Go through every object in list and create a new list item with the appropriate metadata
    for (var itemKey in displayInfo) {
      listItems.push(
        <div id="list-item-container" class={(itemKey == this.props.selectedItem) ? "list-item-selected" : "list-item"} id={itemKey} onClick={itemClicked} style={{width: "auto", height: 36, padding: 8, margin: 8, marginLeft: 16, borderRadius: 8}}>
          <p class="list-item-title" id={itemKey} style={{height: 20, lineHeight: "20px", margin: 0, paddingLeft: 8, fontSize: 20, fontWeight: 600}}>{displayInfo[itemKey].name}</p>
          <p class="list-item-subtitle" id={itemKey} style={{height: 12, lineHeight: "14px", margin: 0, paddingLeft: 8, fontSize: 12}}>{"MSRP: $" + displayInfo[itemKey].msrp}</p>
        </div>
      );
    }

    //UI code
    return (
      <div id="item-list" style={{display: "block", overflowY: "scroll", overflowX: "hidden", width: "100%", height: "100%"}}>
        {listItems}
      </div>
    );
  }
}

/**
 * Main view for item details. Includes item data and price chart.
 *
 * @param data the price data
 * @param displayInfo a JSON object containing background info on the item with format
 *                    {@code { "item_1_name":{"name":"Fancy Name","company":"Example Inc.","msrp":700},"item_2_name"...}}
 * @param selectedItem the item currently selected
 */
class ItemView extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedTimeframe: "1d",
    }
  }

  render() {

    var companyName = "NULL";
    var itemName = "Item";
    var lastPrice = 0;
    var itemMsrp = 0;

    //Set display values for metadata
    if (this.props.displayInfo != null && this.props.selectedItem != null) {
      companyName = (this.props.displayInfo[this.props.selectedItem].company != null) ? this.props.displayInfo[this.props.selectedItem].company : "Company";
      itemName = (this.props.displayInfo[this.props.selectedItem].name != null) ? this.props.displayInfo[this.props.selectedItem].name : "Item Name";
      itemMsrp = (this.props.displayInfo[this.props.selectedItem].msrp != null) ? this.props.displayInfo[this.props.selectedItem].msrp : 0;
    }

    var pricePlotArray = [];
    var chartData = [];

    //Convert JSON price data into 2D array of [x,y] values for plotting on chart
    for (var dateKey in this.props.data) {
      if (this.props.data[dateKey][this.props.selectedItem] != null) {
        pricePlotArray.push([parseInt(dateKey), this.props.data[dateKey][this.props.selectedItem]]);
      }
    }

    //Set up data in a format which can be more easily processed
    //NOTE: Each {label:..., data:...} object represents a single series
    var inputData = [
      {
        label: itemName,
        data: pricePlotArray
      }
    ];

    var timeAgoForPrevious = 0;
    //Process data in each series
    for (var key in inputData) {

      var dataForSet = [];
      var color = '#7953d2'; //Line color of chart
      if (inputData[key].color != null) {
        color = inputData[key].color;
      }

      //Set up data in form accepted by ChartJS
      var dataSet = {
        label: inputData[key].label,
        data: dataForSet,
        pointRadius: 1,
        fill: false,
        backgroundColor: color,
        borderColor: color
      };

      //Convert human-readable timeframe string into milliseconds
      var timeframeConversion = {
        "1d": 86400000,
        "1w": 604800000,
        "1m": 2592000000,
        "3m": 7776000000,
        "1y": 31536000000,
        "5y": 157680000000
      }

      var movingAvgConversion = {
        "1d": 6,
        "1w": 6,
        "1m": 12,
        "3m": 18,
        "1y": 24,
        "5y": 48
      }

      var maximumTimeAgo = timeframeConversion[this.state.selectedTimeframe];
      var movingAvgValue = movingAvgConversion[this.state.selectedTimeframe];

      //Convert 2D array of points into JSON object, but only include data within desired timeframe
      var previousPrices = [];
      for (var index in inputData[key].data) {
        var itemDate = inputData[key].data[index][0]; //x-value
        var itemPrice =  inputData[key].data[index][1]; //y-value
        var timeAgo = (new Date()).getTime() - itemDate; //time elapsed (in milliseconds) since data point was recorded
        var changeInTime = timeAgoForPrevious - timeAgo;
        timeAgoForPrevious = timeAgo;

        if (changeInTime > priceInterval * 10) {
          previousPrices = [];
        }

        //Maintain an array of prices from the last 6 hours to calculate moving avg
        previousPrices.push(itemPrice);
        if (previousPrices.length > movingAvgValue) {
          previousPrices.shift();
        }

        //Get avg of array values
        var averagePrice = 0;
        for (var priceIndex in previousPrices) {
          averagePrice += previousPrices[priceIndex];
        }
        averagePrice /= previousPrices.length;

        //Exclude data older than the value specified by timeAgo
        if (timeAgo < maximumTimeAgo && previousPrices.length >= movingAvgValue && index % (movingAvgValue / 6) == 0) {
          dataForSet.push({x: itemDate, y: averagePrice});
        }

      }

      //Set last y-value (price) in point array as the last recorded price for the item.
      if (inputData[key] != null) {
        if (inputData[key].data != null && inputData[key].data.length > 0) {
          lastPrice = inputData[key].data[inputData[key].data.length - 1][1];
        }
      }

      chartData.push(dataSet);
    }

    //Change saved timeframe value when a new timeframe is selected
    const handleTimeframeSelectChange = (value) => {
      this.setState({selectedTimeframe: value});
    }

    //UI code
    return (
      <div id="item-view" style={{display: "flex", flexFlow: "column", padding: 16, height: "calc(100% - 32px)", width: "calc(100% - 32px)"}}>
        <p id="company-name-label" style={{flexGrow: 1, maxHeight: 16, lineHeight: "16px", fontSize: 16, margin: 0, padding: 0}}>{companyName.toUpperCase()}</p>
        <p id="item-name-label" style={{flexGrow: 1, maxHeight: 32, lineHeight: "32px", fontSize: 32, margin: 0, marginTop: 8, padding: 0, fontWeight: 600}}>{itemName}</p>
        <p id="item-price-label" style={{flexGrow: 1, maxHeight: 32, lineHeight: "32px", fontSize: 32, margin: 0, marginTop: 8, padding: 0}}>{"$" + lastPrice.toFixed(2)}</p>
        <p id="msrp-label" style={{flexGrow: 1, maxHeight: 16, lineHeight: "16px", fontSize: 16, margin: 0, marginTop: 8, padding: 0}}>{"MSRP: $" + itemMsrp.toString()}</p>
        <div id="chart-container" style={{flex:"1 0 0px", maxHeight: "75vw", paddingTop: 32, paddingBottom: 32, display: "flex",height:0}}>
          <PriceChart data={chartData}/>
        </div>
        <div id="timeframe-select-container" style={{flexGrow: 1, maxHeight: 32, height: 32}}>
          <TimeframeSelect onChange={handleTimeframeSelectChange} selectedItem={this.state.selectedTimeframe}/>
        </div>
      </div>
    );
  }
}

/**
 * Display price-over-time chart with the provided data points.
 *
 * @param data the data to display. Must be in format:
 *             [{x: price_dollars_1, y: time_millis_1},{x: price_dollars_2, y: time_millis_2},{x: price_dollars_3, y: time_millis_3},...]
 */
class PriceChart extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {

    //Set up and configure chart data & display options
    const data = {
      datasets: this.props.data
    };

    const options = {
      legend: {
        display: false,
      },
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        yAxes: [
          {
            ticks: {
              beginAtZero: false,
            },
          },
        ],
        xAxes: [
          {
            type: 'time',
            position: 'bottom'
          }
        ],
      },
    };

    return (
      <div id="chart-parent" style={{flex: "1 0 0px", width: 1, display: "flex"}}>
        <Line height={null} width={null} data={data} options={options} />
      </div>
    );
  }
}

/**
 * Allows user to select a variety of timeframes. Primarily useful for
 * time-based charts or tables (e.g. stock data)
 *
 * @param onChange the function to be called when the timeframe is changed, such as by user selection. A string representing the timeframe is passed to this function.
 * @param selectedItem the timeframe which is currently selected
 */
class TimeframeSelect extends React.Component {
  constructor(props) {
    super(props);

  }

  render() {
    const handleTimeframeButtonClick = (event) => {
      if (this.props.onChange != null && this.props.selectedItem != event.target.value) {
        this.props.onChange(event.target.value);
      }
    }

    //UI code
    return (
      <div style={{display: "flex", height: "100%"}}>
        <CenteredFlex contentStyle={{flex: "2 0 0"}} style={{flex: "1 0 0"}}>
          <TimeframeButton selectedItem={this.props.selectedItem} value="1d" onClick={handleTimeframeButtonClick}/>
        </CenteredFlex>
        <CenteredFlex contentStyle={{flex: "2 0 0"}} style={{flex: "1 0 0"}}>
          <TimeframeButton selectedItem={this.props.selectedItem} value="1w" onClick={handleTimeframeButtonClick}/>
        </CenteredFlex>
        <CenteredFlex contentStyle={{flex: "2 0 0"}} style={{flex: "1 0 0"}}>
          <TimeframeButton selectedItem={this.props.selectedItem} value="1m" onClick={handleTimeframeButtonClick}/>
        </CenteredFlex>
        <CenteredFlex contentStyle={{flex: "2 0 0"}} style={{flex: "1 0 0"}}>
          <TimeframeButton selectedItem={this.props.selectedItem} value="3m" onClick={handleTimeframeButtonClick}/>
        </CenteredFlex>
        <CenteredFlex contentStyle={{flex: "2 0 0"}} style={{flex: "1 0 0"}}>
          <TimeframeButton selectedItem={this.props.selectedItem} value="1y" onClick={handleTimeframeButtonClick}/>
        </CenteredFlex>
        <CenteredFlex contentStyle={{flex: "2 0 0"}} style={{flex: "1 0 0"}}>
          <TimeframeButton selectedItem={this.props.selectedItem} value="5y" onClick={handleTimeframeButtonClick}/>
        </CenteredFlex>
      </div>
    );
  }
}

/**
 * Custom styled button representing a selection for a specific timeframe.
 *
 * @param selectedItem the timeframe value currently selected
 * @param value the timeframe value that this button represents
 * @param handleTimeframeButtonClick the function to call when the timeframe is selected
 */
class TimeframeButton extends React.Component {
  constructor(props) {
    super(props);

  }
  render() {

    //When button is clicked, pass onClick function call to parent if one exists
    const handleClick = (event) => {
      if (this.props.onClick != null) {
        this.props.onClick(event);
      }
    }

    //UI code
    return (
      <button
        id={this.props.value}
        value={this.props.value}
        onClick={handleClick}
        class={this.props.selectedItem == this.props.value ? "timeframe-button selected" : "timeframe-button"}
        style={{width: "100%",height: "100%",maxWidth: 64}}>
          {this.props.value.toUpperCase()}
      </button>
    );
  }
}

/**
 * A flex container which automatically centers child child horizontally.
 *
 * @param style the style of the root element
 * @param content the style of the div containing the child elements
 */
class CenteredFlex extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {

    //Add display:flex style attribute to root if not overriden
    var style = this.props.style;
    if (style == null){
      style = {display: "flex"};
    } else {
      if (style.display == null) {
        style.display = "flex";
      }
    }

    //Add flex:"1 0 0" style attribute to content if not overriden
    var contentStyle = this.props.contentStyle;
    if (contentStyle == null) {
      contentStyle = {flex: "1 0 0"};
    } else if (contentStyle.flex == null) {
      contentStyle.flex = "1 0 0";
    }

    //UI code
    return (
      <div class="centered-container" style={style}>
        <div class="centered-left" style={{flex: "1 0 0"}}></div>
        <div class="centered-content" style={contentStyle}>
          {this.props.children}
        </div>
        <div class="centered-right" style={{flex: "1 0 0"}}></div>
      </div>
    );
  }
}
