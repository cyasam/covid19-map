var express = require('express');
var router = express.Router();

var { getAllCaseData, formatDate, formatNumber } = require('../utils/index');

/* GET home page. */
router.get('/', async function(req, res, next) {
  const {
    cases: confirmed,
    recovered,
    deaths,
    active,
    updated,
  } = await getAllCaseData();

  res.render('index', {
    title: 'COVID-19 Spread Map',
    summary: {
      confirmed: formatNumber(confirmed),
      active: formatNumber(active),
      recovered: formatNumber(recovered),
      deaths: formatNumber(deaths),
      lastUpdated: formatDate(updated),
    },
  });
});

module.exports = router;
