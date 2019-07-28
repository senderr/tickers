import React from 'react';
import classes from './Price.module.css';

const Price = (props) => {
  const price = `$${props.price.toFixed(2)}`;
  const change = `${props.sign}${props.change.toFixed(2)}`;
  const changePercent = `${props.sign}${(props.changePercent * 100).toFixed(
    2
  )}%`;
  return (
    <div className={classes.Wrapper}>
      <p className={classes.Price}>{price}</p>
      <div className={classes.Change}>
        <p>{change}</p>
        <p>{changePercent}</p>
      </div>
    </div>
  );
};

export default Price;
