const express = require('express')
const app = express()
const port = process.env.PORT || 80;
var path = require('path');
var public = path.join(__dirname, 'public');

const watcherSimple = require("./watcherSimple");

app.use('/', express.static(public));


app.get("/api/dccdata",function(req, res) {
    let data = watcherSimple.getDCCData();
    res.status(200).json(data)
});

app.get('*', function(req, res) {
    res.sendFile(path.join(public, 'index.html'));
});


app.listen(port, () => {
    console.log(`App listening at :${port}`)
  })
