import React from 'react';
import ReactDOM from 'react-dom';
import * as firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/firestore';
import './index.css';
import App from './App';
import * as serviceWorker from './serviceWorker';

const firebaseConfig = {
  apiKey: 'AIzaSyDldHa6XFz8w3gnTvAJM0--nWQCmZcyJUk',
  authDomain: 'tickers-625cf.firebaseapp.com',
  databaseURL: 'https://tickers-625cf.firebaseio.com',
  projectId: 'tickers-625cf',
  storageBucket: 'tickers-625cf.appspot.com',
  messagingSenderId: '946157289245',
  appId: '1:946157289245:web:d0dc508205dec864'
};

firebase.initializeApp(firebaseConfig);

ReactDOM.render(<App firebase={firebase} />, document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
