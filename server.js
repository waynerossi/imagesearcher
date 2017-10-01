// server.js
// where your node app starts

// init project
var express = require('express');
var app = express();
var mongo = require('mongodb').MongoClient;
var dburl = "mongodb://camper:codecamp@ds157614.mlab.com:57614/freecodecamp";
var img = require('google-images');

var apiUrl = "https://www.googleapis.com/customsearch/v1";
var apiKey = "AIzaSyC_-W3P5uoBhZa4agpwY68rXXwm987IukA";
var cx = "003607346385160635616:o-q2_opjvzg";

var client = new img(cx, apiKey);

// we've started you off with Express, 
// but feel free to use whatever libs or frameworks you'd like through `package.json`.

// http://expressjs.com/en/starter/static-files.html
app.use(express.static('public'));

// http://expressjs.com/en/starter/basic-routing.html
app.get("/", function (request, response) {
  response.sendFile(__dirname + '/views/index.html');
});

app.get("/api/imagesearch/:term", function(req, res) {
  var offset = req.query.offset;
  if(!(offset)) {
    offset = 1;
  }
  var term = req.params.term;
  var date =new Date().toISOString();
  mongo.connect(dburl,function(err,db){
    if(!err) {
      var searchhistory = db.collection('searchhistory');
      searchhistory.insert([{searchterm: term, date: date}]);
      db.close();
    }
  });
  
  client.search(term, {
    page: offset
  }).then(function(images) {
    if(images.length > 0) {  
      res.json(images);
    } else {
      res.json({
        message: "No results found"
      });
    }
    
    
  });
  
});

app.get("/api/latest/imagesearch", function(req, res) {
  mongo.connect(dburl,function(err,db){
    var searchhistory = db.collection('searchhistory');
    searchhistory.find().sort([['date', 'desc']]).limit(10).toArray(function(err, docs) {
      db.close();
      res.json(docs);
    });
  });
});

// listen for requests :)
var listener = app.listen(process.env.PORT, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});
