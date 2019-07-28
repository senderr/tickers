import React, { Component } from 'react';

import StockTicker from '../../Components/StockTicker/StockTicker';
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
    if (this.props.stockData && this.props.stockData.length > 0) {
      let orderedData = [];
      this.props.subscribedTickers.forEach((ticker) => {
        for (let i = 0; i < this.props.subscribedTickers.length; i++) {
          if (ticker === this.props.stockData[i].symbol) {
            orderedData.push(this.props.stockData[i]);
          }
        }
      });
      tickers = orderedData.map((stock) => {
        return (
          <StockTicker
            deleteTicker={this.props.deleteTicker}
            key={stock.symbol}
            symbol={stock.symbol}
            name={stock.companyName}
            price={stock.latestPrice}
            change={stock.change}
            changePercent={stock.changePercent}
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
