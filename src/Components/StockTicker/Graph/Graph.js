import React, { Component } from 'react';

import classes from './Graph.module.css';

import * as am4core from '@amcharts/amcharts4/core';
import * as am4charts from '@amcharts/amcharts4/charts';
import am4themes_animated from '@amcharts/amcharts4/themes/animated';

class Graph extends Component {
  componentDidMount() {
    am4core.useTheme(am4themes_animated);

    let chart = am4core.create(this.props.symbol, am4charts.XYChart);

    let dateAxis = chart.xAxes.push(new am4charts.DateAxis());

    let valueAxis = chart.yAxes.push(new am4charts.ValueAxis());

    let series = chart.series.push(new am4charts.LineSeries());
    series.dataFields.valueY = 'Price';
    series.dataFields.dateX = 'Time';
    series.tooltipText = '{price}';
    series.tooltip.pointerOrientation = 'vertical';

    chart.cursor = new am4charts.XYCursor();
    chart.cursor.snapToSeries = series;
    chart.cursor.xAxis = dateAxis;

    let data = [];
    this.props.graphData.forEach((point) => {
      data.push({
        time: point.label,
        price: point.marketAverage
      });
    });
    chart.data = data;
  }

  render() {
    return <div id={this.props.symbol} className={classes.Graph} />;
  }
}

export default Graph;
