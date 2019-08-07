import React, { Component } from 'react';

import Highcharts from 'highcharts';

import classes from './Graph.module.css';

class Graph extends Component {
  state = {
    width: window.innerWidth
  };

  componentDidUpdate(prevProps, prevState) {
    if (
      this.props.graphData &&
      prevProps.graphData.length !== this.props.graphData.length
    ) {
      let data = [];
      let labels = [];
      let prevPrice = null;
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
  }

  componentDidMount() {
    window.addEventListener('resize', () =>
      this.setState({ width: window.innerWidth })
    );
    if (this.props.graphData) {
      console.log(this.props.graphData);
      let data = [];
      let labels = [];
      let prevPrice = null;
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
  }

  render() {
    let graphClasses = [classes.Graph];
    let messageClasses = [classes.Message];
    let refreshPageClasses = [classes.Message];

    if (this.props.graphData && window.innerWidth >= 900) {
      messageClasses.push(classes.Hide);
      refreshPageClasses.push(classes.Hide);
    } else if (window.innerWidth < 900) {
      refreshPageClasses.push(classes.Hide);
      graphClasses.push(classes.Hide);
    } else {
      messageClasses.push(classes.Hide);
      graphClasses.push(classes.Hide);
    }

    return (
      <React.Fragment>
        <div id={this.props.symbol} className={graphClasses.join(' ')} />
        <h4 className={messageClasses.join(' ')}>
          Use a bigger screen to view stock charts
        </h4>
        <h5 className={refreshPageClasses.join(' ')}>
          Refresh page to view stock charts
        </h5>
      </React.Fragment>
    );
  }
}

export default Graph;
