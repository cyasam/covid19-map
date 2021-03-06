const fs = require('fs');
const axios = require('axios');
var moment = require('moment');

const API_URL = 'https://corona.lmao.ninja/v2';

const getAllCaseData = async () => {
  const url = `${API_URL}/all`;

  try {
    const response = await axios.get(url);
    const data = response.data;
    return data;
  } catch (error) {
    return error;
  }
};

const getAllCaseDataByCountry = async () => {
  const url = `${API_URL}/countries`;

  try {
    const response = await axios.get(url);
    const data = response.data;
    return data;
  } catch (error) {
    return error;
  }
};

const getModifiedAllCaseDataByCountry = async () => {
  const allCountriesData = await getAllCaseDataByCountry();

  const modifiedAllCaseData = allCountriesData.map((data) => {
    const {
      country,
      cases: confirmed,
      todayCases: todayConfirmed,
      todayActive,
      todayDeaths,
      todayRecovered,
      active,
      recovered,
      deaths,
      countryInfo: { lat: latitude, long: longitude, iso2 },
      updated,
    } = data;

    const flag = iso2 ? `/images/flags/${iso2.toLowerCase()}.png` : null;
    const flagSmall = iso2
      ? `/images/flags-small/${iso2.toLowerCase()}.png`
      : null;

    return {
      country,
      flag,
      flagSmall,
      coordinates: {
        latitude,
        longitude,
      },
      stats: {
        confirmed,
        active,
        recovered,
        deaths,
        today: {
          confirmed: todayConfirmed,
          active: todayActive || null,
          deaths: todayDeaths,
          recovered: todayRecovered || null,
        },
      },
      lastUpdated: formatDate(updated),
    };
  });

  return modifiedAllCaseData.sort(function (a, b) {
    return b.stats.confirmed - a.stats.confirmed;
  });
};

const getCaseDataByCountry = async (country) => {
  const url = `${API_URL}/countries/${country}`;

  try {
    const response = await axios.get(url);
    const data = response.data;
    return data;
  } catch (error) {
    return error;
  }
};

const getAllCountriesData = async () => {
  const url = `${API_URL}/jhucsse`;

  try {
    const response = await axios.get(url);
    const data = response.data;
    return data;
  } catch (error) {
    return error;
  }
};

const storeAllCountriesInJson = async () => {
  var countryList = await getAllCountriesData();

  var modifiedCountryList = countryList.map(
    ({ country, province, coordinates }) => {
      return {
        country,
        province,
        coordinates,
      };
    },
  );
  var data = JSON.stringify(modifiedCountryList);

  fs.writeFile('./data/countries.json', data, function (err) {
    if (err) {
      console.log('There has been an error saving your countries list.');
      console.log(err.message);
      return;
    }
    console.log('Countries saved successfully.');
  });
};

const getAllCountriesListFromJson = () => {
  try {
    var data = fs.readFileSync('./data/countries.json', 'utf-8');
    return JSON.parse(data);
  } catch (err) {
    throw err;
  }
};

const formatDate = (updated) => {
  return moment(updated).format('DD MMM YYYY HH:mm');
};

const formatDateRelative = (updated) => {
  return moment(updated).fromNow();
};

const formatNumber = (number) => {
  return new Intl.NumberFormat('en-US').format(number);
};

module.exports = {
  getAllCaseData,
  getAllCaseDataByCountry,
  getModifiedAllCaseDataByCountry,
  getCaseDataByCountry,
  getAllCountriesData,
  storeAllCountriesInJson,
  getAllCountriesListFromJson,
  formatDate,
  formatDateRelative,
  formatNumber,
};
