import React from 'react';

import classes from './Name.module.css';

const Name = (props) => {
  return (
    <div className={classes.Wrapper}>
      <p className={classes.Symbol}>{props.symbol}</p>
      <p className={classes.Name}>{props.name}</p>
    </div>
  );
};

export default Name;
