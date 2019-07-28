import React from 'react';
import './App.css';
import validator from 'validator';

import StockInfo from './Containers/StockInfo/StockInfo';
import Toolbar from './Containers/Toolbar/Toolbar';
import Login from './Components/Login/Login';
import axios from 'axios';

import { API_KEY } from './Private/IEXCloud/API_KEY';

const BASE_URL = 'https://cloud.iexapis.com';

/**
 * This app fetches stock data from IEXapis and displays it to the user.
 * The user can sign in to keep their subscribed stocks saved to their account.
 *
 * Stock data is always stored locally, but is requested from the api every 15 seconds.
 */
class App extends React.Component {
  state = {
    userInfo: null,
    showLogin: false,
    subscribedTickers: [],
    stockData: []
  };

  /**
   * Sets up login listener to update userInfo state when user logs in/out
   * Initializes local stock data from user's database
   */
  componentDidMount() {
    this.props.firebase.auth().onAuthStateChanged((user) => {
      if (user) {
        this.setState({ userInfo: user });
        const ref = this.props.firebase
          .firestore()
          .collection('userData')
          .doc(user.uid);
        ref.get().then((userData) => {
          const tickers = userData.data().subscribedTickers;
          let data = [];
          let requests = [];
          for (let symbol of tickers) {
            let prom = axios
              .get(
                BASE_URL + '/stable/stock/' + symbol + '/quote?token=' + API_KEY
              )
              .then((response) => {
                data.push(response.data);
              });
            requests.push(prom);
          }
          Promise.all(requests).then(() => {
            this.setState({ stockData: data, subscribedTickers: tickers });
          });
        });
      } else {
        this.setState({ userInfo: null, subscribedTickers: [], stockData: [] });
      }
    });

    /**
     * Updates local stock data every 15 seconds
     */
    setInterval(() => {
      if (this.state.stockData.length > 0) {
        let data = [];
        let requests = [];
        for (let symbol of this.state.subscribedTickers) {
          let prom = axios
            .get(
              BASE_URL + '/stable/stock/' + symbol + '/quote?token=' + API_KEY
            )
            .then((response) => {
              data.push(response.data);
            });
          requests.push(prom);
        }
        Promise.all(requests).then(() => {
          this.setState({ stockData: data });
        });
      }
    }, 15000);
  }

  /**
   * Called when a ticker is added or removed from the local state to keep the database synced.
   */
  updateDatabase = () => {
    if (this.state.userInfo) {
      const ref = this.props.firebase
        .firestore()
        .collection('userData')
        .doc(this.state.userInfo.uid);
      ref.set({
        subscribedTickers: this.state.subscribedTickers
      });
    }
  };

  /**
   * Adds a ticker to the local state
   */
  addTicker = (symbol) => {
    const subscribedTickers = [...this.state.subscribedTickers];
    let continueSearch = true;
    subscribedTickers.forEach((ticker) => {
      if (ticker === symbol) {
        continueSearch = false;
      }
    });
    if (continueSearch) {
      axios
        .get(BASE_URL + '/stable/stock/' + symbol + '/quote?token=' + API_KEY)
        .then((response) => {
          if (
            response.data.price === null ||
            response.data === null ||
            response.data.changePercent === null ||
            response.data.symbol === null ||
            response.data.name === null
          ) {
            alert('There is an error with this ticker');
            return;
          }
          let data = [...this.state.stockData],
            tickers = [...this.state.subscribedTickers];
          data = data.concat(response.data);
          tickers = tickers.concat(symbol);
          this.setState({
            stockData: data,
            subscribedTickers: tickers
          });
        })
        .catch((error) => {
          alert('An error occured, please refresh the page');
          console.log(error.message);
        })
        .finally(() => this.updateDatabase());
    } else {
      alert('You are already subscribed to this ticker');
    }
  };

  /**
   * Removes a ticker from the local state
   */
  deleteTicker = (symbol) => {
    const data = [...this.state.stockData],
      tickers = [...this.state.subscribedTickers];
    const tickersIndex = tickers.findIndex((name) => name === symbol);
    const dataIndex = data.findIndex((stock) => stock.symbol === symbol);
    tickers.splice(tickersIndex, 1);
    data.splice(dataIndex, 1);
    this.setState({ stockData: data, subscribedTickers: tickers }, () =>
      this.updateDatabase()
    );
  };

  showLogin = () => {
    this.setState({ showLogin: true });
  };

  hideLogin = () => {
    this.setState({ showLogin: false });
  };

  /**
   * Logs user in using firebase auth
   */
  loginHandler = ({ email, password }) => {
    let valid = true;
    let errorMessage = [];
    if (!validator.isEmail(email)) {
      valid = false;
      errorMessage.push('Invalid email');
    }
    if (!validator.isLength(password, { min: 5, max: undefined })) {
      valid = false;
      errorMessage.push('Password must be at least 5 characters long');
    }

    if (valid) {
      this.props.firebase
        .auth()
        .signInWithEmailAndPassword(email, password)
        .then(() => this.hideLogin())
        .catch((error) => {
          alert(error.message);
        });
    } else {
      alert(errorMessage.join('\n'));
    }
  };

  /**
   * Signs a new user up using firebase auth
   */
  signupHandler = ({ email, password }) => {
    let valid = true;
    let errorMessage = [];
    if (!validator.isEmail(email)) {
      valid = false;
      errorMessage.push('Invalid email');
    }
    if (!validator.isLength(password, { min: 5, max: undefined })) {
      valid = false;
      errorMessage.push('Password must be at least 5 characters long');
    }

    if (valid) {
      this.props.firebase
        .auth()
        .createUserWithEmailAndPassword(email, password)
        .then((user) => {
          const ref = this.props.firebase.firestore().collection('userData');
          ref.doc(user.user.uid).set({
            subscribedTickers: []
          });
          this.hideLogin();
        })
        .catch((error) => {
          alert(error.message);
        });
    } else {
      alert(errorMessage.join('\n'));
    }
  };

  logoutHandler = () => {
    this.props.firebase
      .auth()
      .signOut()
      .then(() => {
        alert('Successfully logged out');
      })
      .catch((error) => {
        alert(error.message);
      });
  };

  render() {
    let loginModal;
    if (this.state.showLogin) {
      loginModal = (
        <Login
          login={this.loginHandler}
          signup={this.signupHandler}
          hideLogin={this.hideLogin}
        />
      );
    }

    return (
      <div className='App'>
        <Toolbar
          loggedIn={this.state.userInfo !== null}
          showLogin={this.showLogin}
          logout={this.logoutHandler}
          addTicker={this.addTicker}
        />
        <StockInfo
          loggedIn={this.state.userInfo !== null}
          deleteTicker={this.deleteTicker}
          stockData={this.state.stockData}
          subscribedTickers={this.state.subscribedTickers}
        />
        {loginModal}
      </div>
    );
  }
}

export default App;
