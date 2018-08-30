'use strict'

const http = require('http');
const fs = require('fs');
const url = require('url');
const Filter = require('./lib/filter');

const JSONStream = require('JSONStream');

http.createServer((req, res) => {

  req.on('error', (err) => {
    console.error(err);
    res.writeHead(400, {'Content-Type': 'text/html'});
    res.end('`<body><h1>Req rrror: ${err}</h1></body>`');
  });

  res.on('error', (err) => {
    console.error('Res error:',err);
  });

  if (req.method === 'POST' && req.url === '/') {
    req.pipe(JSONStream.parse('payload'))
      .on('error',()=>{
        // console.error('JSONStream.parse error');
        // res.writeHead(400, {'Content-Type': 'application/json; charset=utf-8'});
        // res.write(new Buffer.from(JSON.stringify({"error": "Could not decode request: JSON parsing failed"})), "utf-8");
        // res.end();
        const error = JSON.stringify({'error': 'Could not decode request: JSON parsing failed'}, null, 4)
        console.error(error);
        res.writeHead(400, {'Content-Type': 'application/json'});
        res.end(error);
        // fs.createReadStream('errors.json').pipe(res);
      })
      .pipe(new Filter([ 'image', 'slug', 'title' ]))
      .pipe(res);
  } else {
    res.writeHead(404, {'Content-Type': 'text/html'});
    fs.createReadStream('404.html').pipe(res);
  }
}).listen(8080);
