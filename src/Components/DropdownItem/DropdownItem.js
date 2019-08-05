import React from 'react';
import plus from '../../assets/images/green_plus.png';

import classes from './DropdownItem.module.css';

const DropdownItem = (props) => {
  return (
    <div id={'clickable'} className={classes.DropdownItem}>
      <h2 id={'clickable'}>{props.symbol}</h2>
      <h3 id={'clickable'}>{props.name}</h3>
      <img
        onMouseDown={() => props.addTicker(props.symbol)}
        alt='Add Ticker'
        id={'clickable'}
        src={plus}
      />
    </div>
  );
};

export default DropdownItem;
