const express = require('express');
const bodyParser = require('body-parser');

const app = express();

app.use(bodyParser.json());

app.get('/healthz', (req, res) => {
    res.send("Healthy");
});

app.listen(3000);