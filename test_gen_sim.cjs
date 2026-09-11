const fs = require('fs');
fetch('http://localhost:3000/api/generate-similar', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    files: [{
      data: Buffer.from("Solve 1+1").toString('base64'),
      type: 'text/plain'
    }]
  })
}).then(res => res.json()).then(console.log).catch(console.error);
