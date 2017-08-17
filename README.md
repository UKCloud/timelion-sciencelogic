# SL-Timelion - a Sciencelogic plugin for Timelion

[Timelion](https://www.elastic.co/blog/timelion-timeline) (part of [Kibana](https://www.elastic.co/products/kibana)) provides a plugin mechanism by which you can create your own connectors to external datasets.

This plugin allows you to render data from your ScienceLogic installation inside the Kibana web interface, without having to copy data already existent in Sciencelogic into Elasticsearch.


## Installation instructions

* Extract the contents of this repository into kibana/plugins/timelion-sciencelogic
* remove the file "gulpfile.js" (it's only needed for development purposes)
* Add the Sciencelogic hostname, username and password to src/core_plugins/timelion/timelion.json, e.g.
```
"sciencelogic": {
    "hostname": "sciencelogic.inside.mycompany.com",
    "username": "andy",
    "password": "password123"
  },
```
* restart Kibana


## Usage (within Kibana's Timelion)

Use the Sciencelogic web interface to indentify device data to show; Find the device ID (DID) via the "Registry" tab.

The chart ID can be found on the API Browser (from the "System" tab). Identify the device in "/api/device", which
will then list all the available API Endpoints. Some of these API Endpoints include "performance_data/" in the URL;
the number after "performance_data/" is the Chart ID. The name of this dataset is in the same block of JSON, nearby.

try .sciencelogic('123', '4567', 'CPU Usage')
(where '123' is the device ID and '4567' is the chart ID)

This plugin can *only* render data from Sciencelogic API URLs that look like:
```
'/api/device/<deviceId>/performance_data/<chartId>/data'
```

## Versions

The plugin is intended for use with Kibana 5.5.1

Tested against Kibana 5.5.0 and 5.5.1

If you are using a version of Kibana other than 5.5.1, you will need to edit kibana.version in the "package.json" file.


## Development/Debugging instructions.

Install the code using "npm install" and "npm start" as described in the demo plugin, [timelion-random](https://github.com/rashidkpc/timelion-random)


## Other plugins that might be of interest

* [Random](https://github.com/rashidkpc/timelion-random) (by the author of Timelion) - A demo showing how to create a timelion plugin
* [Yahoo Finance](https://github.com/rashidkpc/timelion-yfinance) (by the author of Timelion) - loads share prices from Yahoo Finance into Timelion (another example plugin)
* [USAFacts](https://github.com/rashidkpc/timelion-usafacts) (by the author of Timelion) - grabs series data from [usafacts.org](http://usafacts.org)
* [Google Analytics](https://github.com/bahaaldine/timelion-google-analytics) - brings Google Analytics data to Timelion
* [Mathlion](https://github.com/fermiumlabs/mathlion) (from Fermium Labs) - enables equation parsing and advanced maths


## What I had to do to get it working...
* I was getting an error message: ''[warning] Plugin "timelion-sciencelogic" was disabled because it expected Kibana version "1.0.0", and found "5.5.0".'' I had set a version number in package.json, following guidance from the demo plugins. However, this is no longer quite correct.

 N.B.  A version of "kibana" in package.json is *not* permitted.
* console.log() will send messages to the terminal where you start Kibana.

## Further notes
The Kibana plugin guide states that you have to produce a new version of the plugin for each version of Kibana [see here](https://www.elastic.co/guide/en/kibana/current/plugin-development.html). The implication is that you have to set the "version" in package.json to be the Kibana version, not the version of your plugin.

It turns out that you can specify both a Kibana version *and* a plugin version by adding a Kibana version to package.json, as described in this [issue](https://discuss.elastic.co/t/specify-kiabans-plugin-version-for-elastic-5-0-0/64126).

