/** @format */

var express = require("express");
var http = require("http");
var path = require("path");
var ejs = require("ejs");
require("dotenv").config();
var axios = require("axios").default;
var morgan = require("morgan");
const { type } = require("os");
const PORT = process.env.PORT;
const moment = require("moment");

require("dotenv").config();
const GEO_API_KEY = process.env.GEOCODING_KEY;
const API_KEY = process.env.API_KEY;
const GEOCODING_KEY = process.env.GEOCODING_KEY;

var app = express();

app.use(express.static("assets"));
app.use(express.urlencoded({ extended: true }));
app.use(morgan("tiny"));
app.use("/assets", express.static("assets"));
//moments
app.use((req, res, next) => {
  res.locals.moment = moment;
  next();
});

app.set("views", path.resolve(__dirname, "views"));

app.set("view engine", "ejs");

//Home
app.get('/', (req, res)=>{
  res.render('home')
})

//Search form
app.post("/main-results", (req, res) => {
  var offset = req.body.offset;
  var limit = req.body.limit;
  var price_min = req.body.price_min;
  var price_max = req.body.price_max;
  var beds_min = req.body.beds_min;
  var baths_min = req.body.baths_min;
  var state_code = req.body.state_code;
  var city = req.body.city;
  var property_type = req.body.property_type;

  var sort = "newest";
  var options = {
    method: "GET",
    url: `https://us-real-estate.p.rapidapi.com/for-sale?offset${offset}&limit=${limit}&price_min=${price_min}&price_max=${price_max}&beds_min=${beds_min}&beds_max=${beds_min}&baths_min=${baths_min}&baths_max=${baths_min}&state_code=${state_code}&city=${city}&sort=${sort}&property_type=${property_type}`,
    headers: {
      "x-rapidapi-key": API_KEY,
      "x-rapidapi-host": "us-real-estate.p.rapidapi.com",
    },
  };

  axios
    .request(options)
    .then(function (response) {
      var fetchedData = response.data.data.results;
      // var property_path = req.body;
      var offset = req.body.offset;
      var limit = req.body.limit;
      var price_min = req.body.price_min;
      var price_max = req.body.price_max;
      var beds_min = req.body.beds_min;
      var baths_min = req.body.baths_min;
      var state_code = req.body.state_code;
      var city = req.body.city;
      var sort = "newest";

      // var listed_day_num = [];
      // var days_ago = [];
      // var current_date = new Date().getDate();
      // fetchedData.forEach((data) => {
      //   var list_date = moment(data.list_date).format("Do").slice(0, 2);
      //   listed_day_num.push(list_date);
      // });
      // for (let i = 0; i < listed_day_num.length; i++) {
      //   const d = listed_day_num[i] - current_date;
      //   days_ago.push(d);
      // }
      // console.log(days_ago);

      if (response.status === 200) {
        res.render("main-results", {
          fetchedData: fetchedData,
          limit: limit,
          price_min: price_min,
          price_max: price_max,
          beds_min: beds_min,
          baths_min: baths_min,
          state_code: state_code,
          city: city,
          sort: sort,
        });
      } else {
        res.render("/");
      }
    })
    .catch(function (error) {
      console.error(error);
    });
});

//Single Listing

app.get("/single_listing/:property_id/:lat/:lon", (req, res) => {
  var property_id = req.params.property_id;
  var lat = req.params.lat;
  var lat = req.params.lon;

  //RAPID API
  var options = {
    method: "GET",
    url: `https://us-real-estate.p.rapidapi.com/property-detail`,
    params: { property_id: property_id },
    headers: {
      "x-rapidapi-key": API_KEY,
      "x-rapidapi-host": "us-real-estate.p.rapidapi.com",
    },
  };

  //GOOGLE JS API

  axios
    .request(options)
    .then(function (response) {
      var status_code = response.data.status;
      var single_data = response.data.data;
      var address = single_data.location.address.line;
      var city = single_data.location.address.city;
      var state_code = single_data.location.address.state_code;
      var postal_code = single_data.location.address.postal_code;
      var price = single_data.list_price;
      var status = single_data.status;
      var photos = single_data.photos;
      var type = single_data.description.type;
      var footage = single_data.description.sqft;
      var description = single_data.description.text;
      var beds = single_data.description.beds;
      var full_baths = single_data.description.baths_full;
      var agent_name = single_data.consumer_advertisers[0].name;
      var agent_num = single_data.consumer_advertisers[1].phone;
      var details = single_data.details[3].text;
      // console.log(details[1]);
      // console.log(agent_num);

      res.render("single_listing", {
        status: status_code,
        address: address,
        city: city,
        state_code: state_code,
        postal_code: postal_code,
        price: price,
        status: status,
        type: type,
        photos: photos,
        footage: footage,
        description: description,
        beds: beds,
        full_baths: full_baths,
        agent_name: agent_name,
        agent_num: agent_num,
        property_id: property_id,
        details: details,
        GEO_API_KEY: GEO_API_KEY,
      });
      // res.send(response.data);
    })
    .catch(function (error) {
      console.error(error);
    });
});

http.createServer(app).listen(PORT, () => {
  console.log("App listening on Port: " + PORT);
});
