var express = require('express');
var router = express.Router();

const { getAllCountriesData } = require('../../utils/index');

/* GET api all data. */
router.get('/all-data', async function(req, res, next) {
  try {
    const allCountriesData = await getAllCountriesData();

    const modifiedAllCaseData = allCountriesData.map(data => {
      var active =
        parseInt(data.stats.confirmed) -
        (parseInt(data.stats.recovered) + parseInt(data.stats.deaths));

      return {
        ...data,
        stats: {
          confirmed: parseInt(data.stats.confirmed),
          active,
          recovered: parseInt(data.stats.recovered),
          deaths: parseInt(data.stats.deaths)
        }
      };
    });

    res.json(modifiedAllCaseData);
  } catch (err) {
    res.status(500).json({
      status: 'error',
      message: err.message
    });
  }
});

module.exports = router;
