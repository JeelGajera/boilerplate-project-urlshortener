require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const dns = require('dns');
const urlparser = require('url');
const app = express();

// Basic Configuration
const port = process.env['PORT'] || 3000;
app.use(bodyParser.urlencoded({ extended: false }));

const mySecret = process.env['MONGO_URL'];
mongoose.connect(mySecret, { useNewUrlParser: true, useUnifiedTopology: true });
app.use(cors());

console.log(mongoose.connection.readyState)

const { Schema } = mongoose;
const urlSchema = new Schema({
  original_url : String,
  short_url : Number
});

const Url = mongoose.model('Url', urlSchema);

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});
// Your first API endpoint
app.post('/api/shorturl', (req, res) => {
  const bodyurl = req.body.url;
  console.log(bodyurl);
  dns.lookup(urlparser.parse(bodyurl).hostname, (error, address) => {
    if(error) return console.log(error);
    if(!address) {
      res.json({ error: 'invalid url'});
    } else {
      const url = new Url({
        original_url : bodyurl
      });
      url.save((err, data) => {
        if(err) return console.log(err);
        res.json({
          original_url : data.original_url,
          short_url : data.id
        });
      })
    }
  })
})

app.get('/api/shorturl/:id', function(req, res) {
  const id = req.params.id;
  Url.findById(id, (err, data) => {
    if(err) return console.log(err);
    if(!data) {
      res.json({ error: 'invalid url'});
    } else {
      res.redirect(data.original_url)
    }
  })
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
