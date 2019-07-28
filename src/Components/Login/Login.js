import React, { Component } from 'react';
import classes from './Login.module.css';

class Login extends Component {
  state = {
    email: '',
    password: ''
  };

  usernameChangeHandler(e) {
    this.setState({ email: e.target.value });
  }

  passwordChangeHandler(e) {
    this.setState({ password: e.target.value });
  }

  render() {
    return (
      <div id='close' className={classes.Backdrop}>
        <div className={classes.Login}>
          <input
            onChange={(e) => this.usernameChangeHandler(e)}
            type='email'
            placeholder='E-mail'
          />
          <input
            onChange={(e) => this.passwordChangeHandler(e)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                this.props.login({
                  email: this.state.email,
                  password: this.state.password
                });
              }
            }}
            type='password'
            placeholder='Password'
          />
          <button
            onClick={() =>
              this.props.login({
                email: this.state.email,
                password: this.state.password
              })
            }
            className={classes.LoginButton}>
            LOG IN
          </button>
          <button
            onClick={() =>
              this.props.signup({
                email: this.state.email,
                password: this.state.password
              })
            }
            className={classes.LoginButton}>
            SIGN UP
          </button>
          <button
            onClick={this.props.hideLogin}
            className={[classes.LoginButton, classes.CloseButton].join(' ')}>
            CLOSE
          </button>
        </div>
      </div>
    );
  }
}

export default Login;
