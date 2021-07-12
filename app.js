/** @format */

var express = require("express");
var bodyParser = require("body-parser");
var http = require("http");
var path = require("path");
var ejs = require("ejs");
require("dotenv").config();
var axios = require("axios").default;
var morgan = require("morgan");
const { type } = require("os");
const PORT = process.env.PORT;
// var mongoose = require("mongoose");
// const MONGODB_URI = process.env.MONGODB_URI;
const moment = require("moment");

require("dotenv").config();
const GEO_API_KEY = process.env.GEOCODING_KEY;
const API_KEY = process.env.API_KEY;
const GEOCODING_KEY = process.env.GEOCODING_KEY;

// const accountSid = process.env.TWILIO_ACCOUNT_SID;
// const authToken = process.env.TWILIO_AUTH_TOKEN;
// const client = require("twilio")(accountSid, authToken);

var app = express();

//MIDDLEWARES
app.use(express.static("assets"));
app.use(express.urlencoded({ extended: true }));
app.use(morgan("tiny"));
app.use("/assets", express.static("assets"));
app.use("/favicon.ico", express.static("assets/img/favicon.ico"));
app.use(bodyParser.urlencoded({ extended: false }));

//MONGOOSE CONNECTION
// let MessageSchema = new mongoose.Schema({
//   phoneNumber: String,
// });

// let Message = mongoose.model("Message", MessageSchema);

// mongoose.Promise = require("bluebird");

// mongoose
//   .connect(MONGODB_URI, {
//     promiseLibrary: require("bluebird"),
//     useUnifiedTopology: true,
//   })
//   .then(() => console.log("connection successful"))
//   .catch((err) => console.error(err));

//END MONGOOSE CONN

//moments
app.use((req, res, next) => {
  res.locals.moment = moment;
  next();
});

app.set("views", path.resolve(__dirname, "views"));

app.set("view engine", "ejs");

//Home
app.get("/", (req, res, next) => {
  
  setTimeout(() => {
    try {
      console.log("Success.");
      res.render("home",{
        GEO_API_KEY:GEO_API_KEY
      });
      // throw new Error("Hello Error!")
    } catch (error) {
      // manually catching
      next(error); // passing to default middleware error handler
    }
  }, 1000);
});

//START TWILIO
// Download the helper library from https://www.twilio.com/docs/node/install
// Find your Account SID and Auth Token at twilio.com/console
// and set the environment variables. See http://twil.io/secure
// const accountSid = process.env.TWILIO_ACCOUNT_SID;
// const authToken = process.env.TWILIO_AUTH_TOKEN;
// const client = require("twilio")(accountSid, authToken);

// app.post("/chat", (req, res) => {
//   let contactNumber = req.body.contactNumber;
//   console.log(contactNumber);
//   client.messages
//     .create({
//       body: "You have entered your number to receive notifications!",
//       from: "+13523064876",
//       to: contactNumber,
//     })
//     //or can log message.id
//     .then(message => console.log(message));
// });
//////////////////////END TWILIO

//Search form
app.post("/main-results", async (req, res, next) => {
  var offset = req.body.offset;
  var limit = req.body.limit;
  var price_min = req.body.price_min;
  var price_max = req.body.price_max;
  var beds_min = req.body.beds_min;
  var baths_min = req.body.baths_min;
  var state_code = req.body.state_code;
  var city = req.body.city.slice(0, - 9);
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
      var property_type = req.body.property_type;
      var city = req.body.city;
      var sort = "newest";
      // console.log(fetchedData);

      try {
        res.render("main-results", {
          fetchedData: fetchedData,
          limit: limit,
          price_min: price_min,
          price_max: price_max,
          beds_min: beds_min,
          baths_min: baths_min,
          state_code: state_code,
          city: city,
          property_type: property_type,
          sort: sort,
          GEO_API_KEY:GEO_API_KEY
        });
      } catch (e) {
        next(e);
      }
    })
    .catch(function (error) {
      console.error(error);
    });
});

//Single fam Listing
app.get("/single_family/:property_id/:lat/:lon", (req, res, next) => {
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
      var lot_footage = single_data.description.lot_sqft;
      var description = single_data.description.text;
      var beds = single_data.description.beds;
      var full_baths = single_data.description.baths_full;
      var agent_name = single_data.consumer_advertisers[0].name;
      var agent_num = single_data.consumer_advertisers[1].phone;
      var details = single_data.details[3].text;
      console.log(type);

      res.render("single_family", {
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
        lot_footage: lot_footage,
        description: description,
        beds: beds,
        full_baths: full_baths,
        agent_name: agent_name,
        agent_num: agent_num,
        property_id: property_id,
        details: details,
        GEO_API_KEY: GEO_API_KEY,
      });
    })
    .catch(function (error) {
      console.error(error);
    });
});

//Single Land Listing
app.get("/land/:property_id/:lat/:lon", (req, res, next) => {
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
      var lot_footage = single_data.description.lot_sqft;
      var description = single_data.description.text;
      var beds = single_data.description.beds;
      var full_baths = single_data.description.baths_full;
      var agent_name = single_data.consumer_advertisers[0].name;
      var agent_num = single_data.consumer_advertisers[1].phone;
      var details = single_data.details[3].text;
      console.log(type);

      res.render("land", {
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
        lot_footage: lot_footage,
        description: description,
        beds: beds,
        full_baths: full_baths,
        agent_name: agent_name,
        agent_num: agent_num,
        property_id: property_id,
        details: details,
        GEO_API_KEY: GEO_API_KEY,
      });
    })
    .catch(function (error) {
      console.error(error);
    });
});

//Condo Listing
app.get("/condo_townhome/:property_id/:lat/:lon", (req, res, next) => {
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
      var lot_footage = single_data.description.lot_sqft;
      // var description = single_data.description.text;
      var beds = single_data.description.beds;
      var full_baths = single_data.description.baths_full;
      var agent_name = single_data.consumer_advertisers[0].name;
      // var agent_num = single_data.consumer_advertisers[1].phone;
      // var details = single_data.details.text;
      // console.log(details[1]);
      console.log(agent_num);

      res.render("condo_townhome", {
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
        lot_footage: lot_footage,
        // description: description,
        beds: beds,
        full_baths: full_baths,
        agent_name: agent_name,
        // agent_num: agent_num,
        property_id: property_id,
        details: details,
        GEO_API_KEY: GEO_API_KEY,
      });
    })
    .catch(function (error) {
      console.error(error);
    });
});

//Mobile Listing
app.get("/mobile/:property_id/:lat/:lon", (req, res, next) => {
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
      var lot_footage = single_data.description.lot_sqft;
      var description = single_data.description.text;
      var beds = single_data.description.beds;
      var full_baths = single_data.description.baths_full;
      var agent_name = single_data.consumer_advertisers[0].name;
      var agent_num = single_data.consumer_advertisers[1].phone;
      var details = single_data.details[3].text;
      // console.log(details[1]);
      // console.log(agent_num);

      res.render("mobile", {
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
        lot_footage: lot_footage,
        description: description,
        beds: beds,
        full_baths: full_baths,
        agent_name: agent_name,
        agent_num: agent_num,
        property_id: property_id,
        details: details,
        GEO_API_KEY: GEO_API_KEY,
      });
    })
    .catch(function (error) {
      console.error(error);
    });
});

//Multi Listing
app.get("/multi_family/:property_id/:lat/:lon", (req, res, next) => {
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
      var lot_footage = single_data.description.lot_sqft;
      var description = single_data.description.text;
      var beds = single_data.description.beds;
      var full_baths = single_data.description.baths_full;
      var agent_name = single_data.consumer_advertisers[0].name;
      var agent_num = single_data.consumer_advertisers[1].phone;
      var details = single_data.details[3].text;
      // console.log(details[1]);
      // console.log(agent_num);

      res.render("multi_family", {
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
        lot_footage: lot_footage,
        description: description,
        beds: beds,
        full_baths: full_baths,
        agent_name: agent_name,
        agent_num: agent_num,
        property_id: property_id,
        details: details,
        GEO_API_KEY: GEO_API_KEY,
      });
    })
    .catch(function (error) {
      console.error(error);
    });
});

//Town House Listing
app.get("/townhomes/:property_id/:lat/:lon", (req, res, next) => {
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
      var lot_footage = single_data.description.lot_sqft;
      var description = single_data.description.text;
      var beds = single_data.description.beds;
      var full_baths = single_data.description.baths_full;
      var agent_name = single_data.consumer_advertisers[0].name;
      var agent_num = single_data.consumer_advertisers[1].phone;
      var details = single_data.details[3].text;
      console.log(type);

      res.render("townhomes", {
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
        lot_footage: lot_footage,
        description: description,
        beds: beds,
        full_baths: full_baths,
        agent_name: agent_name,
        agent_num: agent_num,
        property_id: property_id,
        details: details,
        GEO_API_KEY: GEO_API_KEY,
      });
    })
    .catch(function (error) {
      console.error(error);
    });
});

//ERROR HANDLING
app.use((err, req, res, next) => {
  res.render("error");
  console.log(err);
});

http.createServer(app).listen(PORT, () => {
  console.log("App listening on Port: " + PORT);
});
