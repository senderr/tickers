import React, { Component } from 'react';

import Highcharts from 'highcharts';

import classes from './Graph.module.css';

class Graph extends Component {
  componentDidMount() {
    if (window.innerWidth < 900) {
      return;
    }
    let data = [];
    let labels = [];
    let prevPrice;
    this.props.graphData.forEach((point) => {
      if (point.close) {
        prevPrice = point.close;
        data.push(point.close);
        labels.push(point.label);
      } else if (point.marketClose) {
        prevPrice = point.marketClose;
        data.push(point.marketClose);
        labels.push(point.label);
      } else {
        data.push(prevPrice);
        labels.push(point.label);
      }
    });

    const chart = Highcharts.chart(this.props.symbol, {
      chart: {
        type: 'line',
        backgroundColor: 'transparent',
        marginBottom: 40,
        spacingRight: 18,
        spacingTop: 15
      },
      title: 'none',
      xAxis: {
        lineColor: 'transparent',
        type: 'category',
        categories: labels,
        gridLineWidth: 0,
        labels: {
          rotation: 0.01,
          style: {
            color: 'black'
          },
          formatter: function() {
            if (this.isLast || this.isFirst) {
              return this.value;
            }
          }
        }
      },
      yAxis: {
        title: {
          enabled: false
        },
        gridLineWidth: 0.3,
        gridLineColor: 'black',
        labels: {
          style: {
            color: 'black'
          },
          format: '${value}'
        }
      },
      series: [
        {
          showInLegend: false,
          name: '1min close',
          data: data,
          color: 'black'
        }
      ],
      plotOptions: {
        line: {
          marker: {
            enabled: false
          }
        }
      }
    });
  }

  render() {
    return <div id={this.props.symbol} className={classes.Graph} />;
  }
}

export default Graph;
