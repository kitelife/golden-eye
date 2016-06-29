'use strict';

var request = require('request');
var fs = require('fs');
var path = require('path');

//TODO
exports.detectFromHTML = function(options) {};

exports.detectFromUrl = function(options, cb) {
	if (options.debug) {
		console.log('Fetching the page');
	}

	getHTMLFromUrl(options, function(err, data) {
		if (err || data === null) {
			cb(err, null);
		} else {
			runWrappalyer(options, data, function(err, detected, appInfo) {
				cb(null, detected, appInfo);
			});
		}
	});
};

function getHTMLFromUrl(options, cb) {
	// response, body 中包含哪些信息呢？
	request(options, function(error, response, body) {
        if (!error) {
            var data = {
                url: options.url,
                headers: response.headers
            };
            if (response.statusCode == 200) {
                data.html = body;
            }
            cb(null, data);
        } else {
            cb(error, null);
        }
	});
}

function getAppsJson(cb) {
	fs.readFile(path.resolve(__dirname, 'apps.json'), 'utf8', function(err, data) {
		if (err) throw err;
		return cb(null, JSON.parse(data));
	});
}

function runWrappalyer(options, data, cb) {
	var debug = options.debug || false;

	var wappalyzer = require('./wappalyzer').wappalyzer;
	getAppsJson(function(err, apps) {
		var w = wappalyzer;
		w.driver = {
			log: function(args) {
				if (debug) {
					console.log(args.message);
				}
			},

			init: function() {
				w.categories = apps.categories;
				w.apps = apps.apps;
			},
			displayApps: function() {
				var app, url = Object.keys(w.detected)[0];
				var detectedApps = [];

				for (app in w.detected[url]) {
					// 获取分类信息
					let numCats = w.apps[app].cats;
					let strCats = [];

					if (numCats) {
						numCats.forEach(cat => {
							strCats.push(w.categories[cat]);
						});
					}
					w.detected[url][app].category = strCats;

					detectedApps.push(app);

					if (debug) {
						console.log(app);
					}
				}
				cb(null, detectedApps, w.detected[url]);
			}
		};
		w.init();
		w.detected = [];
		w.analyze(options.hostname, options.url, data);
	});
}
