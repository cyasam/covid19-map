'use strict';

(function () {
  cssVars();
  var allDataWithCircle;

  function createTile(map) {
    L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
      attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
      minZoom: 2,
      id: 'mapbox/dark-v10',
      tileSize: 512,
      zoomOffset: -1,
      wheelDebounceTime: 100,
      accessToken: 'pk.eyJ1IjoiY3lhc2FtIiwiYSI6ImNrODM0d2t5aDAwdmYzbWp1aHVwa29wMTAifQ.EYyara4FIFASFahgWAiVWw'
    }).addTo(map);
  }

  function setCircleRadius(number) {
    if (number >= 5 && number < 10) {
      return 6;
    } else if (number >= 10 && number < 100) {
      return 8;
    } else if (number >= 100 && number < 500) {
      return 10;
    } else if (number >= 500 && number < 1000) {
      return 12;
    } else if (number >= 1000 && number < 10000) {
      return 20;
    } else if (number >= 10000 && number < 50000) {
      return 30;
    } else if (number >= 50000) {
      return 40;
    } else {
      return 5;
    }
  }

  function formatNumber(number) {
    return new Intl.NumberFormat('en-US').format(number);
  }

  function getAllDataWithCircle(allData, map, graphVariables) {
    var dataType = 'confirmed';
    var borderColor = 'rgba(255, 65, 108, 0.8)';
    var bgColor = 'rgba(255, 65, 108, 0.8)';

    if (graphVariables) {
      dataType = graphVariables.dataType;
      borderColor = graphVariables.borderColor;
      bgColor = graphVariables.bgColor;
    }

    return allData.map(function (data) {
      var _data$coordinates = data.coordinates,
          latitude = _data$coordinates.latitude,
          longitude = _data$coordinates.longitude;
      var circle = null;

      if (data.stats.confirmed > 0) {
        circle = L.circleMarker([latitude, longitude], {
          color: borderColor,
          fillColor: bgColor,
          fillOpacity: 0.5,
          weight: 2,
          radius: setCircleRadius(data.stats[dataType])
        }).addTo(map);
      }

      return Object.assign(data, {
        circle: circle
      });
    });
  }

  function createCircles(allData, map) {
    allData.forEach(function (data) {
      if (data.stats.confirmed > 0) {
        var html = createTooltipHtml(data, 'confirmed');
        data.circle.bindTooltip(html, {
          sticky: true,
          className: 'custom-tooltip',
          offset: L.point(15, 15)
        }).addTo(map);
      }
    });
  }

  function createTooltipHtml(data, mapType) {
    var tooltipHeading = data.province ? "".concat(data.city ? "".concat(data.city, ",") : '', " ").concat(data.province, ", ").concat(data.country) : data.country;
    var todayStat = data.stats.today[mapType];
    return "\n    <div class=\"case-tooltip\">\n      <figure class=\"case-tooltip-flag\">\n        ".concat(data.flag ? "<img src=\"".concat(data.flag, "\" title=\"").concat(data.country, "\" />") : '', "\n        <div class=\"title\">\n          <h3>").concat(tooltipHeading, "</h3>\n        </div>\n        ").concat(todayStat > 0 ? "<p class=\"today ".concat(mapType, "\">+").concat(formatNumber(todayStat), "</p>") : '', "\n      </figure>\n\n      <div class=\"case-tooltip-inner\">\n        <ul class=\"numbers\">\n          <li class=\"confirmed\">\n            <span class=\"label\">Confirmed</span>\n            <span class=\"number\">").concat(formatNumber(data.stats.confirmed), "</span>\n          </li>\n          <li class=\"active\">\n            <span class=\"label\">Active</span>\n            <span class=\"number\">").concat(formatNumber(data.stats.active), "</span>\n          </li>\n          <li class=\"deaths\">\n            <span class=\"label\">Deaths</span>\n            <span class=\"number\">").concat(formatNumber(data.stats.deaths), "</span>\n          </li>\n          <li class=\"recovered\">\n            <span class=\"label\">Recovered</span>\n            <span class=\"number\">").concat(formatNumber(data.stats.recovered), "</span>\n          </li>\n        </ul>\n      </div>\n    </div>");
  }

  function changeCircleProps(props) {
    allDataWithCircle.forEach(function (data) {
      if (data.circle) {
        data.circle.setRadius(setCircleRadius(data.stats[props.mapType]));
        data.circle.setStyle({
          fillColor: props.bgColor,
          color: props.borderColor
        });
        data.circle.setTooltipContent(createTooltipHtml(data, props.mapType));
      }
    });
  }

  function changeCountryList(props) {
    var countryListEl = document.getElementsByClassName('country-list');
    countryListEl[0].setAttribute('data-selected-stats-type', props.mapType);
    var countryListLiStatsEl = countryListEl[0].querySelectorAll('.country .stat');
    countryListLiStatsEl.forEach(function (stat) {
      if (stat.classList.contains('show')) {
        stat.classList.remove('show');
      }

      if (stat.getAttribute('data-stats-type') === props.mapType) {
        stat.classList.add('show');
      }
    });
  }

  function handleClickStatsButton(event) {
    var target = event.target;
    var statsButtonActiveEl = document.querySelector('.stats-button.active');
    statsButtonActiveEl.classList.remove('active');
    statsButtonActiveEl.disabled = false;
    target.classList.add('active');
    target.disabled = true;
    var props = {
      mapType: target.getAttribute('data-stats-type'),
      borderColor: target.getAttribute('data-stats-border-color'),
      bgColor: target.getAttribute('data-stats-bg-color')
    };
    changeCircleProps(props);
    changeCountryList(props);
  }

  fetch('/api/all-data').then(function (response) {
    return response.json();
  }).then(function (allData) {
    fetch('http://ip-api.com/json').then(function (response) {
      return response.json();
    }).then(function (geoData) {
      document.getElementById('loading').remove();
      var map = L.map('map').setView([45, 35], 4);
      map.zoomControl.setPosition('bottomleft');
      map.panTo(new L.LatLng(geoData.lat, geoData.lon));
      createTile(map);
      allDataWithCircle = getAllDataWithCircle(allData, map);
      createCircles(allDataWithCircle, map);
      var myZoom = {
        start: map.getZoom(),
        end: map.getZoom()
      };
      map.on('zoomstart', function (e) {
        myZoom.start = map.getZoom();
      });
      map.on('zoomend', function (e) {
        myZoom.end = map.getZoom();
        var diff = myZoom.start - myZoom.end;
        allDataWithCircle.forEach(function (data) {
          if (data.circle) {
            if (diff > 0) {
              data.circle.setRadius(data.circle.getRadius() * 1);
            } else if (diff < 0) {
              data.circle.setRadius(data.circle.getRadius() / 1);
            }
          }
        });
      }); // stats button click event

      var statsButtonEl = document.querySelectorAll('.stats-button');
      statsButtonEl.forEach(function (button) {
        button.addEventListener('click', handleClickStatsButton);
      });
    });
  })["catch"](function (err) {
    throw Error(err);
  });
})();
