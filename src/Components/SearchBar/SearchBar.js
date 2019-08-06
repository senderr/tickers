import React, { Component } from 'react';
import axios from 'axios';

import classes from './SearchBar.module.css';
import DropdownItem from '../DropdownItem/DropdownItem';

import { API_KEY } from '../../private/IEXCloud/API_KEY';

const BASE_URL = 'https://cloud.iexapis.com/stable/';

let timeout;

axios.interceptors.response.use(
  (response) => {
    //Intercept Response
    return response;
  },
  (error) => {
    //Intercept Error
    console.log(error.message);
    return Promise.reject(error);
  }
);

axios.interceptors.request.use(
  (config) => {
    //Intercept request
    return config;
  },
  (error) => {
    //Intercept error
    console.log(error.message);
    return Promise.reject(error);
  }
);

class SearchBar extends Component {
  state = {
    stocksearch: '',
    dropdownData: [],
    showDropdown: false
  };

  searchTypeHandler = (e) => {
    this.setState({ stocksearch: e.target.value.toUpperCase() }, () => {
      if (this.state.stocksearch.length > 0) {
        clearTimeout(timeout);
        timeout = setTimeout(() => {
          axios
            .get(
              BASE_URL +
                'stock/' +
                this.state.stocksearch +
                '/quote?token=' +
                API_KEY
            )
            .then((response) => {
              this.setState({
                dropdownData: response.data,
                showDropdown: true
              });
            })
            .catch((error) => {
              console.log(error);
              this.setState({
                dropdownData: null
              });
            });
        }, 350);
      } else {
        this.setState({ showDropdown: false });
      }
    });
  };

  detectSpecialKeys = (e) => {
    if (e.key === 'Escape') {
      this.setState({ showDropdown: false });
      e.target.blur();
    } else if (e.key === 'Enter' && this.state.dropdownData) {
      const firstResult = this.state.dropdownData.symbol;
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
        dropDownItems = <h1>Search for a stock symbol...</h1>;
      } else if (this.state.dropdownData === null) {
        dropDownItems = <h1>We can't find "{this.state.stocksearch}"</h1>;
      } else {
        dropDownItems = (
          <DropdownItem
            key={this.state.dropdownData.symbol}
            symbol={this.state.dropdownData.symbol}
            name={this.state.dropdownData.companyName}
            addTicker={this.props.addTicker}
          />
        );
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
