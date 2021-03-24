import logo from './logo.svg';
import './App.css';
import React from "react";
import {JSON_RETRIEVE} from './Requests';
import { Line } from 'react-chartjs-2'

var itemDisplayInfo = require('./itemDisplayInfo.json');

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
    const itemSelected = (item) => {
      this.setState({selectedItem: item});
    }

    if (this.state.didFetchData == false) {
      JSON_RETRIEVE("FETCH_PRICES", (type, success, data) => {
        if (success) {
          console.log(data);
          this.setState({data: data, didFetchData: true});
        }
      });
    }

    return (
      <div className="App" style={{display: "flex", flexFlow: "column"}}>
        <div id="navigation-container" style={{display: "flex", flexGrow: 1, height: 64, maxHeight: 64, minHeight: 64}}>
          <NavigationBar/>
        </div>
        <div id="main-content-container" style={{display: "flex", flexGrow: 1, maxHeight: "calc(100vh - 64px)"}}>
          <div id="item-list-container" style={{flexGrow: 1}}>
            <ItemList displayInfo={itemDisplayInfo} onSelect={itemSelected} selectedItem={this.state.selectedItem}/>
          </div>
          <div id="item-view-container" style={{flexGrow: 3}}>
            <ItemView data={this.state.data} displayInfo={itemDisplayInfo} selectedItem={this.state.selectedItem}/>
          </div>
        </div>
      </div>
    );
  }
}

class NavigationBar extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div id="navigation-bar" style={{display: "flex", height: 64, backgroundColor: '#1A1A1F', width: "100%"}}>
        <div id="title-container" style={{display: "flex", flexFlow: "column", flexGrow: 1, padding: 8, margin: 0}}>
          <p id="title" style={{height: 32, lineHeight: "32px", margin: 0, paddingLeft: 8, fontSize: 24, fontWeight: 600}}>GPU Price Tracker</p>
          <p id="subtitle" style={{height: 14, lineHeight: "14px", margin: 0, paddingLeft: 8, fontSize: 14}}>by Noah Sadir</p>
        </div>
      </div>
    );
  }
}

class ItemList extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    const itemClicked = (event) => {
      //Only run select action if different item is selected
      if (this.props.selectedItem != event.target.id) {
        this.setState({selectedItem: event.target.id});
        this.props.onSelect(event.target.id);
      }
    }

    var displayInfo = (this.props.displayInfo == null) ? {} : this.props.displayInfo;
    var listItems = [];
    for (var itemKey in displayInfo) {
      //console.log(displayInfo[itemKey].name);
      listItems.push(
        <div class={(itemKey == this.props.selectedItem) ? "list-item-selected" : "list-item"} id={itemKey} onClick={itemClicked} style={{width: "100%", height: 32, padding: 8, margin: 0}}>
          <p class="list-item-title" id={itemKey} style={{height: 16, lineHeight: "16px", margin: 0, paddingLeft: 8, fontSize: 16, fontWeight: 600}}>{displayInfo[itemKey].name}</p>
          <p class="list-item-subtitle" id={itemKey} style={{height: 12, lineHeight: "14px", margin: 0, paddingLeft: 8, fontSize: 12}}>{"MSRP: $" + displayInfo[itemKey].msrp}</p>
        </div>
      );
    }

    return (
      <div style={{display: "block", overflowY: "scroll", height: "100%"}}>
        {listItems}
      </div>
    );
  }
}

class ItemView extends React.Component {
  constructor(props) {
    super(props);
  }
  render() {

    var companyName = "NULL";
    var itemName = "Item";
    var lastPrice = 0;
    var chartData = [];

    if (this.props.displayInfo != null && this.props.selectedItem != null) {
      companyName = (this.props.displayInfo[this.props.selectedItem].company != null) ? this.props.displayInfo[this.props.selectedItem].company : "Company";
      itemName = (this.props.displayInfo[this.props.selectedItem].name != null) ? this.props.displayInfo[this.props.selectedItem].name : "Item Name";
    }

    var pricePlotArray = [];
    for (var dateKey in this.props.data) {
      if (this.props.data[dateKey][this.props.selectedItem] != null) {
        pricePlotArray.push([parseInt(dateKey), this.props.data[dateKey][this.props.selectedItem]]);
      }
    }

    var inputData = [
      {
        label: itemName,
        data: pricePlotArray
      }
    ];

    for (var key in inputData) {
      var dataForSet = [];
      var color = '#7953d2';
      if (inputData[key].color != null) {
        color = inputData[key].color;
      }
      var dataSet = {label: inputData[key].label, data: dataForSet, pointRadius: 3, fill: false, backgroundColor: color,borderColor: (color)};
      for (var index in inputData[key].data) {
        dataForSet.push({x: inputData[key].data[index][0], y: inputData[key].data[index][1]});
        lastPrice = inputData[key].data[index][1];
      }

      chartData.push(dataSet);
    }

    const data = {
      datasets: chartData
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
      <div style={{display: "flex", flexFlow: "column", padding: 16, height: "100%"}}>
        <p style={{flexGrow: 1, maxHeight: 16, lineHeight: "16px", fontSize: 16, margin: 0, padding: 0}}>{companyName.toUpperCase()}</p>
        <p style={{flexGrow: 1, maxHeight: 32, lineHeight: "32px", fontSize: 32, margin: 0, marginTop: 8, padding: 0, fontWeight: 600}}>{itemName}</p>
        <p style={{flexGrow: 1, maxHeight: 32, lineHeight: "32px", fontSize: 32, margin: 0, marginTop: 8, padding: 0}}>{"$" + lastPrice.toFixed(2)}</p>
        <div style={{flex:"1 0 0px", paddingTop: 32, paddingBottom: 32, display: "flex",height:0}} id="chart-container">
          <div style={{flex: "1 0 0px", width: 1, display: "flex"}}>
            <Line height={null} width={null} data={data} options={options} />
          </div>
        </div>
      </div>
    );
  }
}
