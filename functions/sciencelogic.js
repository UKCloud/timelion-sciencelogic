var alter = require('../../../src/core_plugins/timelion/server/lib/alter.js');
var Datasource = require('../../../src/core_plugins/timelion/server/lib/classes/datasource');
var fetch = require('node-fetch');
fetch.Promise = require('bluebird');
var _ = require('lodash');

/*
  This timelion plugin can pull data from you ScienceLogic system.

  Configure username, password and hostname in the file
  kibana/src/core_plugins/timelion/timelion.json.

  See README.md for instructions
*/

module.exports = new Datasource('sciencelogic', {
  args: [
    {
      name: 'deviceId',
      types: ['string', 'null'],
      help: 'The device ID to plot.'
    },
    {
      name: 'chartId',
      types: ['string', 'null'],
      help: 'The chart ID to plot. (The number after /performance_data/ in the API URL, ' +
            'described as Dynamic Application Data in the Sciencelogic API Documentation)'
    },
    {
      name: 'label',
      types: ['string', 'null'],
      help: 'The label for the chart'
    }
  ],
  help: 'Pull data from your sciencelogic installation.',

  fn: function sciencelogicFn(args, tlConfig) {
    var config = _.defaults(args.byName, {
      deviceId: 1,
      chartId: 1000,
      label: 'Data from Sciencelogic'
    });

    /*
      For details of the URL, see the SL API Documentation.
      beginstamp and endstamp are both required, and need to be in Seconds
      since Epoch (Kibana provides them in milliseconds since Epoch)
    */
    var beginTime = Math.floor(tlConfig.time.from / 1000);
    var endTime = Math.floor(tlConfig.time.to / 1000);
    var username = tlConfig.settings['timelion:sciencelogic.username'];
    var password = tlConfig.settings['timelion:sciencelogic.password'];
    var sl_hostname = tlConfig.settings['timelion:sciencelogic.hostname']

    var URL = 'http://' + sl_hostname +
        '/api/device/' + config.deviceId + '/performance_data/' + config.chartId + '/data' +
        '?beginstamp=' + beginTime +
        '&endstamp=' + endTime;

    if (!username || !password || !sl_hostname) {
      throw new Error('sciencelogic plugin: hostname, username and password must be configured. ' +
        'Edit the file kibana/src/core_plugins/timelion/timelion.json. ');
    }
    var authString = 'Basic ' + new Buffer(username + ':' + password).toString('base64');

    var urlOptions = {
      method: 'GET',
      headers: {
        'Pragma': 'no-cache',
        'Accept': 'application/json',
        'Cache-Control': 'no-cache',
        'x-em7-guid-paths': 1,
        'Authorization': authString,
        'Accept-Encoding': 'gzip, deflate'
      }
    };

    /*
    console.log('sciencelogic plugin: URL = ' + URL);
    console.log('Sciencelogic plugin: Fetching from https://' + sl_hostname);
    console.log('Sciencelogic plugin: Date range: ' + new Date(tlConfig.time.from).toISOString() +
                ' -> ' + new Date(tlConfig.time.to).toISOString());
    /* */

    return fetch(URL, urlOptions).then(function (resp) {
      return resp.json();
    }).then(function (resp) {

      if (resp.errors) {
        // console.log('username = ' + username);
        // console.log('password is a ' + typeof password);
        throw new Error('Error connecting to Sciencelogic: ' +
          resp.errors[0].errorcode + ' ' + resp.errors[0].message);
      }
      // SL supplies secs since epoch. Kibana wants ms since epoch
      var data = _.map(resp.data[0], function (value, timestamp) {
        return [(timestamp * 1000), value ];
      });
      return {
        type: 'seriesList',
        list: [{
          data: data,
          type: 'series',
          fit: 'nearest',
          label: config.label
        }]
      };
    }).catch(function (e) {
      throw e;
    });
  }
});
