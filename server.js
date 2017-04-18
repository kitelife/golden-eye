#!/usr/bin/env node
/**
 * Created by xiayf on 15/12/15.
 */

'use strict';

var cluster = require('cluster');
var http = require('http');
var numCPUs = require('os').cpus().length;
var urlParser = require('url');
var qs = require('querystring');
var fs = require('fs');
var path = require('path');
var dns = require('dns');

var md = require('markdown-it')();
var urlValidator = require('valid-url');
var Log = require('log');
var ipUtils = require('ip');

var wappalyzer = require("./wappalyzer");

var logger = new Log('info');
var argv = require('yargs').option('m', {alias: 'multiple', default: 1, type: 'number'}).argv;

const HTTP_PORT = 8000;
const NAIVE_TOKEN = '1qazXSW2cvbnm';

function checkFP(req, res) {
    //
    let urlParts = urlParser.parse(req.url);
    if (urlParts.pathname !== '/check') {
        //
        res.statusCode = 200;
        res.setHeader("Content-Type", "text/html; charset=utf-8");
        //
        fs.readFile(path.join(path.dirname(process.argv[1]), 'welcome.md'), 'utf8', function (err, data) {
            if (err) {
                logger.error(err);
                res.write('欢迎使用！');
            } else {
                res.write(md.render(data));
            }
            res.end();
        });
        return;
    }

    //
    req.query = qs.parse(urlParts.query);

    var token = req.query.token;
    if (token !== NAIVE_TOKEN) {
        res.statusCode = 403;
        res.write('禁止访问！');
        res.end();
        return;
    }

    //
    var targetURL = req.query.url;
    if (targetURL === undefined) {
        res.statusCode = 400;
        res.write('缺少必要的请求参数url');
        res.end();
        return;
    }
    if (!(urlValidator.is_http_uri(targetURL) || urlValidator.is_https_uri(targetURL))) {
        res.statusCode = 400;
        res.write('请求参数url不合法');
        res.end();
        return;
    }
    //
    urlParts = urlParser.parse(targetURL);
    dns.resolve(urlParts.hostname, 'A', function(err, addresses) {
        if (err) {
            logger.error(err);
            res.write(JSON.stringify({
                status: 'failed',
                message: '域名解析失败'
            }));
            res.end();
            return;
        }
        for(var index in addresses) {
            if (ipUtils.isPrivate(addresses[index])) {
                logger.info(targetURL, 'is inner');
                res.write(JSON.stringify({
                    status: 'failed',
                    'message': '域名不可解析'
                }));
                res.end();
                return;
            }
        }
        _check_fingerprint(targetURL, res);
    });
}

function _check_fingerprint(targetURL, res) {
    var options = {
        url: targetURL,
        headers: {
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_2) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/47.0.2526.80 Safari/537.36'
        },
        debug: false,
        maxRedirects: 5,
        // 禁止跳转，防SSRF
        followRedirect: false
    };

    // 记录一下
    logger.info(targetURL);

    var beginTime = Date.now();

    wappalyzer.detectFromUrl(options, function(err, apps, appInfo) {
        if (err) {
            logger.error(targetURL, "failed", err);
            res.write(JSON.stringify({
                status: 'failed',
                message: err.message
            }));
            res.end();
            return;
        }

        if (apps === null) {
            logger.error(targetURL, "failed", "无监测数据");
            res.write(JSON.stringify({
                status: 'failed',
                message: '无检测数据'
            }));
            res.end();
            return;
        }

        var details = {};
        apps.forEach(name => {
            var appDetail = appInfo[name];
            details[name] = {
                versions: appDetail['versions'],
                category: appDetail['category'],
                confidence: appDetail['confidenceTotal']
            }
        });

        // 单位毫秒
        var elapsedTime = Date.now() - beginTime;
        logger.info(targetURL, elapsedTime);

        res.write(JSON.stringify({
            status: 'success',
            elapsed_time: elapsedTime,
            data: {
                apps: apps,
                details: details
            }
        }));
        res.end();
    });
}

if (cluster.isMaster) {
    // Fork workers.
    logger.info('主进程id:', process.pid);
    var processNum = numCPUs * argv.m;
    for (var i = 0; i < processNum; i++) {
        cluster.fork();
    }

    cluster.on('exit', function(worker, code, signal) {
        logger.error('worker ' + worker.process.pid + ' died, code: ' + code + ', signal: ' + signal + ' -> restarting');
        cluster.fork();
    });
} else {
    // Workers can share any TCP connection
    // In this case it is an HTTP server
    http.createServer(checkFP).listen(HTTP_PORT);
    logger.info('进程id:', process.pid, '监听端口:', HTTP_PORT);
}
