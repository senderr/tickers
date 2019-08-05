import React, { Component } from 'react';
import classes from './Toolbar.module.css';
import SearchBar from '../../components/SearchBar/SearchBar';

class Toolbar extends Component {
  render() {
    let userButton;
    if (this.props.loggedIn) {
      userButton = (
        <button onClick={this.props.logout} className={classes.LoginButton}>
          LOG OUT
        </button>
      );
    } else {
      userButton = (
        <button onClick={this.props.showLogin} className={classes.LoginButton}>
          LOG IN
        </button>
      );
    }

    return (
      <div className={classes.Toolbar}>
        <h1>TICKERS.INFO</h1>
        <SearchBar addTicker={this.props.addTicker} />
        {userButton}
      </div>
    );
  }
}

export default Toolbar;
