import React from 'react';

import Name from './Name/Name';
import Price from './Price/Price';

import classes from './StockTicker.module.css';

const StockTicker = (props) => {
  const sign = props.change > 0 ? '+' : '';

  const bgColor = props.change > 0 ? '0, 255, 0' : '255, 0, 0';

  const colorIntensity = 0.34 + Math.abs(props.changePercent * 7);

  return (
    <div
      className={classes.StockTicker}
      style={{
        background: `linear-gradient(45deg, rgb(95, 95, 95, 0.35), rgb(125, 125, 125, 0.17)), linear-gradient(to right, rgb(${bgColor}, ${colorIntensity}), rgb(${bgColor}, ${colorIntensity *
          1.1}))`,
        border: `4px solid rgb(${bgColor}, 0.3)`
      }}>
      <Name name={props.name} symbol={props.symbol} />
      <h1 onClick={(symbol) => props.deleteTicker(props.symbol)}>Remove</h1>
      <Price
        price={props.price}
        change={props.change}
        changePercent={props.changePercent}
        sign={sign}
      />
      <button
        onClick={(symbol) => props.deleteTicker(props.symbol)}
        className={classes.RemoveButton}
        name='remove'>
        Remove
      </button>
    </div>
  );
};

export default StockTicker;
