const http = require('http');

const data = JSON.stringify({
  files: [{ data: "hello", type: "text/plain" }]
});

const req = http.request({
  hostname: 'localhost',
  port: 3000,
  path: '/api/solve-exercise',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(data)
  }
}, (res) => {
  let body = '';
  res.on('data', chunk => body += chunk);
  res.on('end', () => console.log(body));
});

req.write(data);
req.end();
