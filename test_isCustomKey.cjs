const express = require('express');
const app = express();
app.post('/test', (req, res) => {
  const h = req.headers['x-gemini-api-key'];
  res.json({ val: h, isCustom: !!h, type: typeof h });
});
const srv = app.listen(3001, () => {
  fetch('http://localhost:3001/test', {
    method: 'POST',
    headers: { 'x-gemini-api-key': '' }
  }).then(r => r.json()).then(data => {
    console.log(data);
    srv.close();
  });
});
