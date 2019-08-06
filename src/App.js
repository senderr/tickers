import React from 'react';
import './App.css';
import validator from 'validator';

import StockInfo from './containers/StockInfo/StockInfo';
import Toolbar from './containers/Toolbar/Toolbar';
import Login from './components/Login/Login';
import axios from 'axios';

import { API_KEY } from './private/IEXCloud/API_KEY';

const BASE_URL = 'https://cloud.iexapis.com';

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
    stockData: [],
    graphData: [],
    loadGraphs: window.innerWidth >= 900
  };

  componentDidUpdate(oldProps, oldState) {
    let updateDatabase = false;
    if (
      oldState.subscribedTickers.length !== this.state.subscribedTickers.length
    ) {
      updateDatabase = true;
    } else {
      for (let i = 0; i < this.state.subscribedTickers.length; i++) {
        if (oldState.subscribedTickers[i] !== this.state.subscribedTickers[i]) {
          updateDatabase = true;
        }
      }
    }
    if (updateDatabase) {
      this.updateDatabase();
    }
  }

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

          if (this.state.loadGraphs) {
            this.requestStockAndGraphData(tickers).then(
              ({ stockData, graphData }) => {
                this.setState({
                  stockData: stockData,
                  graphData: graphData,
                  subscribedTickers: tickers
                });
              }
            );
          } else {
            this.requestStockData(tickers).then((stockData) => {
              this.setState({
                stockData: stockData,
                subscribedTickers: tickers
              });
            });
          }
        });
      } else {
        this.setState(
          { userInfo: null, subscribedTickers: [], stockData: [] },
          () => {
            this.addTickers(['AAPL', 'MSFT', 'AMZN', 'SPY']);
          }
        );
      }
    });

    const date = new Date();
    const day = date.getDay(); // 0=sunday 1=monday 2=tuesday ...
    const hour = date.getHours();
    const minute = date.getMinutes();

    let shouldSetInterval = true;

    //Weekends
    if (day === 0 || day === 6) {
      shouldSetInterval = false;
    }

    //Pre-market
    if (hour < 9) {
      shouldSetInterval = false;
    } else if (hour === 9 && minute < 30) {
      shouldSetInterval = false;
    }

    //Post market
    if (hour > 15) {
      shouldSetInterval = false;
    }

    if (shouldSetInterval) {
      //Updates local stock data every 15 seconds
      setInterval(() => {
        if (this.state.stockData.length > 0) {
          this.requestStockData(this.state.subscribedTickers).then(
            (stockData) => this.setState({ stockData: stockData })
          );
        }
      }, 15000);

      //Updates local graph data every 5 minutes
      if (this.state.loadGraphs)
        setInterval(() => {
          if (this.state.stockData.length > 0) {
            const time = new Date();
            if (time.getMinutes() === 0 || time.getMinutes() % 1 === 0) {
              this.requestGraphData(this.state.subscribedTickers).then(
                (graphData) => this.setState({ graphData: graphData })
              );
            }
          }
        }, 60000);
    }
  }

  requestStockData = (symbols) => {
    return new Promise((resolve) => {
      let stockData = [];
      let requests = [];
      for (let symbol of symbols) {
        let stockDataRequest = axios
          .get(BASE_URL + '/stable/stock/' + symbol + '/quote?token=' + API_KEY)
          .then((response) => {
            stockData.push(response.data);
          });
        requests.push(stockDataRequest);
      }
      Promise.all(requests)
        .then(() => {
          resolve(stockData);
        })
        .catch((error) => console.log(error.message));
    });
  };

  requestGraphData = (symbols) => {
    return new Promise((resolve) => {
      let graphData = [];
      let requests = [];
      for (let symbol of symbols) {
        let graphDataRequest = axios
          .get(
            BASE_URL +
              '/stable/stock/' +
              symbol +
              '/intraday-prices?chartInterval=5&token=' +
              API_KEY
          )
          .then((response) => {
            graphData.push({ symbol: symbol, data: response.data });
          });
        requests.push(graphDataRequest);
      }
      Promise.all(requests)
        .then(() => {
          resolve(graphData);
        })
        .catch((error) => console.log(error.message));
    });
  };

  requestStockAndGraphData = (symbols) => {
    function getStockData(symbol) {
      return axios.get(
        BASE_URL + '/stable/stock/' + symbol + '/quote?token=' + API_KEY
      );
    }

    function getGraphData(symbol) {
      return axios.get(
        BASE_URL +
          '/stable/stock/' +
          symbol +
          '/intraday-prices?chartInterval=5&token=' +
          API_KEY
      );
    }

    return new Promise((resolve) => {
      let stockData = [],
        graphData = [];
      let requests = [];
      for (let symbol of symbols) {
        let request = axios
          .all([getStockData(symbol), getGraphData(symbol)])
          .then(
            axios.spread((stockResponse, graphResponse) => {
              stockData.push(stockResponse.data);
              graphData.push({ symbol: symbol, data: graphResponse.data });
            })
          );
        requests.push(request);
      }
      Promise.all(requests)
        .then(() => {
          const date = new Date();
          const hour = date.getHours();
          if (hour > 15) {
            for (let symbol of graphData) {
              let closePrice = stockData.find(
                (stock) => stock.symbol === symbol.symbol
              ).close;
              symbol.data.push({ label: '4 PM', close: closePrice });
            }
          }
          resolve({ stockData: stockData, graphData: graphData });
        })
        .catch((error) => console.log(error.message));
    });
  };

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
    let alreadySubscribed = false;
    subscribedTickers.forEach((ticker) => {
      if (ticker === symbol) {
        alreadySubscribed = true;
      }
    });
    if (!alreadySubscribed) {
      const newTickers = [...subscribedTickers, symbol];
      if (this.state.loadGraphs) {
        this.requestStockAndGraphData([symbol]).then(
          ({ stockData, graphData }) => {
            const newStockData = [...this.state.stockData, ...stockData];
            const newGraphData = [...this.state.graphData, ...graphData];
            this.setState({
              subscribedTickers: newTickers,
              stockData: newStockData,
              graphData: newGraphData
            });
          }
        );
      } else {
        this.requestStockData([symbol]).then((stockData) => {
          const newStockData = [...this.state.stockData, ...stockData];
          this.setState({
            stockData: newStockData,
            subscribedTickers: newTickers
          });
        });
      }
    } else {
      alert('You are already subscribed to this ticker');
    }
  };

  /**
   * Adds several tickers to the local state
   */
  addTickers = (symbols) => {
    const subscribedTickers = [...this.state.subscribedTickers];
    let alreadySubscribed = false;
    subscribedTickers.forEach((ticker) => {
      if (
        symbols.findIndex((sym) => {
          return sym === ticker;
        }) !== -1
      ) {
        alreadySubscribed = true;
      }
    });
    if (!alreadySubscribed) {
      const newTickers = [...subscribedTickers, ...symbols];
      if (this.state.loadGraphs) {
        this.requestStockAndGraphData(symbols).then(
          ({ stockData, graphData }) => {
            const newStockData = [...this.state.stockData, ...stockData];
            const newGraphData = [...this.state.graphData, ...graphData];
            this.setState({
              subscribedTickers: newTickers,
              stockData: newStockData,
              graphData: newGraphData
            });
          }
        );
      } else {
        this.requestStockData(symbols).then((stockData) => {
          const newStockData = [...this.state.stockData, ...stockData];
          this.setState({
            stockData: newStockData,
            subscribedTickers: newTickers
          });
        });
      }
    } else {
      alert('You are already subscribed to this ticker');
    }
  };

  /**
   * Removes a ticker from the local state
   */
  deleteTicker = (symbol) => {
    const stockData = [...this.state.stockData],
      graphData = [...this.state.graphData],
      tickers = [...this.state.subscribedTickers];

    const tickersIndex = tickers.findIndex((name) => name === symbol);
    const stockIndex = stockData.findIndex((stock) => stock.symbol === symbol);
    const graphIndex = graphData.findIndex((stock) => stock.symbol === symbol);

    tickers.splice(tickersIndex, 1);
    stockData.splice(stockIndex, 1);
    graphData.splice(graphIndex, 1);

    this.setState(
      {
        stockData: stockData,
        graphData: graphData,
        subscribedTickers: tickers
      },
      () => this.updateDatabase()
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
          loadGraphs={this.state.loadGraphs}
          loggedIn={this.state.userInfo !== null}
          deleteTicker={this.deleteTicker}
          stockData={this.state.stockData}
          graphData={this.state.graphData}
          subscribedTickers={this.state.subscribedTickers}
        />
        {loginModal}
      </div>
    );
  }
}

export default App;
