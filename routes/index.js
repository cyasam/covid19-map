var express = require('express');
var router = express.Router();
var moment = require('moment');

var { getAllCaseData, getAllCaseDataPerRegion } = require('../utils/index');

/* GET home page. */
router.get('/', async function(req, res, next) {
  const allCountryData = await getAllCaseData();
  const allCountryDataPerRegion = await getAllCaseDataPerRegion();

  const lastUpdate = moment(allCountryData.updated).format(
    'DD-MM-YYYY HH:mm:ss'
  );

  res.render('index', {
    title: 'COVID-19 Spread Map',
    allCountryData: {
      cases: allCountryData.cases,
      recovered: allCountryData.recovered,
      deaths: allCountryData.deaths,
      lastUpdate: lastUpdate
    },
    allCountryDataPerRegion
  });
});

module.exports = router;
