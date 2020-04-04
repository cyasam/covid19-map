var express = require('express');
var router = express.Router();

var {
  getAllCaseData,
  getModifiedAllCaseDataByCountry,
  formatDate,
  formatDateRelative,
  formatNumber,
} = require('../utils/index');

/* GET home page. */
router.get('/', async function (req, res, next) {
  const {
    cases: confirmed,
    recovered,
    deaths,
    active,
    updated,
  } = await getAllCaseData();

  const allCountriesData = await getModifiedAllCaseDataByCountry();

  const modifiedAllCaseData = allCountriesData.map(({ country, ...data }) => {
    const { confirmed, active, recovered, deaths } = data.stats;

    return {
      country,
      stats: {
        confirmed: formatNumber(confirmed),
        active: formatNumber(active),
        recovered: formatNumber(recovered),
        deaths: formatNumber(deaths),
      },
    };
  });

  res.render('index', {
    title: 'COVID-19 Spread Map',
    summary: {
      confirmed: formatNumber(confirmed),
      active: formatNumber(active),
      recovered: formatNumber(recovered),
      deaths: formatNumber(deaths),
      lastUpdated: formatDate(updated),
      lastUpdatedRelative: formatDateRelative(updated),
    },
    allCountries: modifiedAllCaseData,
  });
});

module.exports = router;
