const express = require('express');
const path = require('path');
const https = require('https');
const querystring = require('querystring');

const { FORGE_CLIENT_ID, FORGE_CLIENT_SECRET } = process.env;
if (!FORGE_CLIENT_ID || !FORGE_CLIENT_SECRET) {
    console.warn('Provide FORGE_CLIENT_ID and FORGE_CLIENT_SECRET env. variables to run this application.');
    return;
}

const app = express();

app.use(express.static(__dirname));
app.use(express.static(path.resolve(__dirname, '../src')));
app.get('/api/auth', function(req, res) {
    const options = {
        hostname: 'developer.api.autodesk.com', port: 443,
        path: '/authentication/v1/authenticate', method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    };
    const request = https.request(options, (response) => {
        let buffer = '';
        response.on('data', function(data) { buffer += data; });
        response.on('error', function(err) { res.status(500).send(err); });
        response.on('end', function() { res.json(JSON.parse(buffer)); });
    });
    request.on('error', function(err) { res.status(500).send(err); });
    request.write(querystring.stringify({
        'client_id': FORGE_CLIENT_ID,
        'client_secret': FORGE_CLIENT_SECRET,
        'grant_type': 'client_credentials',
        'scope': 'viewables:read'
    }));
    request.end();
});

const port = process.env.PORT || 3000;
app.listen(port, () => { console.log(`Server listening on port ${port}`); });
