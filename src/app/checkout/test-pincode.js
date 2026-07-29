const https = require('https');

https.get('https://api.postalpincode.in/pincode/110001', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => console.log(data));
});
