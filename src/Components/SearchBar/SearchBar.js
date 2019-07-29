import React, { Component } from 'react';
import axios from 'axios';

import classes from './SearchBar.module.css';
import DropdownItem from '../DropdownItem/DropdownItem';

import { API_KEY } from '../../private/IEXCloud/API_KEY';

const BASE_URL = 'https://cloud.iexapis.com/stable/';

class SearchBar extends Component {
  state = {
    stocksearch: '',
    dropdownData: [],
    showDropdown: false
  };

  searchTypeHandler = (e) => {
    this.setState({ stocksearch: e.target.value }, () => {
      if (this.state.stocksearch.length > 0) {
        axios
          .get(
            BASE_URL + 'search/' + this.state.stocksearch + '?token=' + API_KEY
          )
          .then((response) => {
            this.setState({
              dropdownData: response.data,
              showDropdown: true
            });
          })
          .catch((error) => console.log(error));
      } else {
        this.setState({ showDropdown: false });
      }
    });
  };

  detectSpecialKeys = (e) => {
    if (e.key === 'Escape') {
      this.setState({ showDropdown: false });
      e.target.blur();
    } else if (e.key === 'Enter' && this.state.dropdownData.length > 0) {
      const firstResult = this.state.dropdownData[0].symbol;
      this.props.addTicker(firstResult);
      this.closeSearchDropdown(e.target);
    }
  };

  searchbarFocusHandler = () => {
    this.setState({ showDropdown: true });
  };

  searchbarFocusOutHandler = (e) => {
    this.setState({ showDropdown: false });
    this.closeSearchDropdown(e.target);
  };

  closeSearchDropdown = (inputElement) => {
    this.setState({ showDropdown: false, stocksearch: '' });
    inputElement.blur();
  };

  render() {
    let dropdownMenuClasses, dropDownItems;
    if (this.state.showDropdown) {
      dropdownMenuClasses = [classes.DropdownMenu];
      if (this.state.stocksearch === '') {
        dropDownItems = <h1>Start typing a stock name or symbol...</h1>;
      } else if (this.state.dropdownData.length === 0) {
        dropDownItems = <h1>We can't find "{this.state.stocksearch}"</h1>;
      } else {
        dropDownItems = this.state.dropdownData.map((stock) => {
          return (
            <DropdownItem
              key={stock.symbol}
              symbol={stock.symbol}
              name={stock.securityName}
              addTicker={this.props.addTicker}
            />
          );
        });
      }
    } else if (!this.state.showDropdown) {
      dropdownMenuClasses = [classes.DropdownMenu, classes.Hidden];
      dropDownItems = null;
    }

    return (
      <div className={classes.SearchbarWrapper}>
        <input
          autoComplete={'off'}
          className={classes.SearchBar}
          type='text'
          name='stocksearch'
          placeholder='Search'
          value={this.state.stocksearch}
          onChange={(e) => this.searchTypeHandler(e)}
          onKeyDown={(e) => this.detectSpecialKeys(e)}
          onFocus={this.searchbarFocusHandler}
          onBlur={(e) => this.searchbarFocusOutHandler(e)}
        />
        <div className={dropdownMenuClasses.join(' ')}>{dropDownItems}</div>
      </div>
    );
  }
}

export default SearchBar;
