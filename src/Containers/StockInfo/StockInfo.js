import React, { Component } from 'react';

import StockTicker from '../../components/StockTicker/StockTicker';
import classes from './StockInfo.module.css';

class StockInfo extends Component {
  state = {
    showLoggedInMessage: !this.props.loggedIn
  };

  hideLoggedInMessage = () => {
    this.setState({ showLoggedInMessage: false });
  };

  componentWillReceiveProps(newProps) {
    if (this.props.loggedIn !== newProps.loggedIn) {
      if (newProps.loggedIn === this.state.showLoggedInMessage) {
        this.setState({ showLoggedInMessage: !newProps.loggedIn });
      }
    }
  }

  render() {
    let tickers = null,
      loggedInMessage = null;
    if (
      this.props.stockData &&
      this.props.stockData.length > 0 &&
      this.props.loadGraphs
    ) {
      let orderedStockData = [],
        orderedGraphData = [];

      this.props.subscribedTickers.forEach((ticker) => {
        for (let i = 0; i < this.props.subscribedTickers.length; i++) {
          if (ticker === this.props.stockData[i].symbol) {
            orderedStockData.push(this.props.stockData[i]);
          }
          if (ticker === this.props.graphData[i].symbol) {
            orderedGraphData.push(this.props.graphData[i]);
          }
        }
      });

      let data = [];
      for (let i = 0; i < this.props.subscribedTickers.length; i++) {
        data.push({
          stockData: orderedStockData[i],
          graphData: orderedGraphData[i]
        });
      }
      tickers = data.map((stock) => {
        return (
          <StockTicker
            deleteTicker={this.props.deleteTicker}
            key={stock.stockData.symbol}
            graphData={stock.graphData.data}
            symbol={stock.stockData.symbol}
            name={stock.stockData.companyName}
            price={stock.stockData.latestPrice}
            change={stock.stockData.change}
            changePercent={stock.stockData.changePercent}
          />
        );
      });
    } else if (this.props.stockData && this.props.stockData.length > 0) {
      let orderedStockData = [];

      this.props.subscribedTickers.forEach((ticker) => {
        for (let i = 0; i < this.props.subscribedTickers.length; i++) {
          if (ticker === this.props.stockData[i].symbol) {
            orderedStockData.push(this.props.stockData[i]);
          }
        }
      });

      let data = [];
      for (let i = 0; i < this.props.subscribedTickers.length; i++) {
        data.push({
          stockData: orderedStockData[i]
        });
      }
      tickers = data.map((stock) => {
        return (
          <StockTicker
            deleteTicker={this.props.deleteTicker}
            key={stock.stockData.symbol}
            graphData={null}
            symbol={stock.stockData.symbol}
            name={stock.stockData.companyName}
            price={stock.stockData.latestPrice}
            change={stock.stockData.change}
            changePercent={stock.stockData.changePercent}
          />
        );
      });
    } else {
      tickers = (
        <h1 key='emptyMessage' className={classes.Message}>
          Use the search bar to add tickers.
        </h1>
      );
    }
    if (this.state.showLoggedInMessage) {
      loggedInMessage = (
        <h1 key='loginMessage' className={classes.Message}>
          Log in to keep tickers synced between devices.
          <button onClick={this.hideLoggedInMessage}>OK</button>
        </h1>
      );
    }
    return [tickers, loggedInMessage];
  }
}

export default StockInfo;
