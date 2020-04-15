'use strict';

(function () {
  cssVars();

  var allDataWithCircle,
    map,
    mapZoom,
    viewportBreakPoint,
    viewportBreakPointChanged = false;

  function setViewportBreakPoint() {
    var width = document.documentElement.clientWidth;
    if (
      (!viewportBreakPoint || viewportBreakPoint === 'desktop') &&
      width < 768
    ) {
      if (!!viewportBreakPoint) {
        viewportBreakPointChanged = true;
      }

      viewportBreakPoint = 'mobile';
    } else if (
      (!viewportBreakPoint || viewportBreakPoint === 'mobile') &&
      width >= 768
    ) {
      if (!!viewportBreakPoint) {
        viewportBreakPointChanged = true;
      }

      viewportBreakPoint = 'desktop';
    } else {
      viewportBreakPointChanged = false;
    }
  }

  function setZoomLevel() {
    return viewportBreakPoint === 'mobile' ? 2 : 4;
  }

  function setCircleSize(arg, callback) {
    allDataWithCircle.forEach(function (data) {
      if (data.circle) {
        callback({
          circle: data.circle,
          props: arg,
        });
      }
    });
  }

  function setResizeCircleSize() {
    setCircleSize(null, function (arg) {
      if (viewportBreakPoint === 'mobile') {
        arg.circle.setRadius(arg.circle.getRadius() / 2);
      } else {
        arg.circle.setRadius(arg.circle.getRadius() * 2);
      }
    });
  }

  window.addEventListener('resize', function () {
    setViewportBreakPoint();

    if (viewportBreakPointChanged) {
      mapZoom = setZoomLevel();
      map.setZoom(mapZoom);
      setResizeCircleSize();
    }
  });

  function createTile(map) {
    L.tileLayer(
      'https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}',
      {
        attribution:
          'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
        minZoom: 2,
        id: 'cyasam/ck91kmvhm1a7p1il39crm48a3',
        tileSize: 512,
        zoomOffset: -1,
        wheelDebounceTime: 100,
        accessToken:
          'pk.eyJ1IjoiY3lhc2FtIiwiYSI6ImNrODM0d2t5aDAwdmYzbWp1aHVwa29wMTAifQ.EYyara4FIFASFahgWAiVWw',
      }
    ).addTo(map);
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
      var {
        coordinates: { latitude, longitude },
      } = data;

      var circle = null;

      if (data.stats.confirmed > 0) {
        circle = L.circleMarker([latitude, longitude], {
          color: borderColor,
          fillColor: bgColor,
          fillOpacity: 0.5,
          weight: 2,
          radius: setCircleRadius(data.stats[dataType]),
        }).addTo(map);
      }

      return Object.assign(data, { circle });
    });
  }

  function createCircles(allData, map) {
    allData.forEach(function (data) {
      if (data.stats.confirmed > 0) {
        var html = createTooltipHtml(data, 'confirmed');

        data.circle
          .bindTooltip(html, {
            sticky: true,
            className: 'custom-tooltip',
            offset: L.point(15, 15),
          })
          .addTo(map);
      }
    });
  }

  function createTooltipHtml(data, mapType) {
    var tooltipHeading = data.province
      ? `${data.city ? `${data.city},` : ''} ${data.province}, ${data.country}`
      : data.country;

    var todayStat = data.stats.today[mapType];

    return `
    <div class="case-tooltip">
      <figure class="case-tooltip-flag">
        ${data.flag ? `<img src="${data.flag}" title="${data.country}" />` : ''}
        <div class="title">
          <h3>${tooltipHeading}</h3>
        </div>
        ${
          todayStat > 0
            ? `<div class="today-wrapper"><p class="today ${mapType}">+${formatNumber(
                todayStat
              )}</p></div>`
            : ''
        }
      </figure>

      <div class="case-tooltip-inner">
        <ul class="numbers">
          <li class="confirmed">
            <span class="label">Confirmed</span>
            <span class="number">${formatNumber(data.stats.confirmed)}</span>
          </li>
          <li class="active">
            <span class="label">Active</span>
            <span class="number">${formatNumber(data.stats.active)}</span>
          </li>
          <li class="deaths">
            <span class="label">Deaths</span>
            <span class="number">${formatNumber(data.stats.deaths)}</span>
          </li>
          <li class="recovered">
            <span class="label">Recovered</span>
            <span class="number">${formatNumber(data.stats.recovered)}</span>
          </li>
        </ul>
      </div>
    </div>`;
  }

  function changeCircleProps(props) {
    allDataWithCircle.forEach(function (data) {
      if (data.circle) {
        data.circle.setRadius(setCircleRadius(data.stats[props.mapType]));
        data.circle.setStyle({
          fillColor: props.bgColor,
          color: props.borderColor,
        });

        data.circle.setTooltipContent(createTooltipHtml(data, props.mapType));
      }
    });
  }

  function changeCountryList(props) {
    var countryListEl = document.getElementsByClassName('country-list');
    countryListEl[0].setAttribute('data-selected-stats-type', props.mapType);

    var countryListLiStatsEl = countryListEl[0].querySelectorAll(
      '.country .stat'
    );

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
      bgColor: target.getAttribute('data-stats-bg-color'),
    };

    changeCircleProps(props);
    changeCountryList(props);
  }

  fetch('/api/all-data')
    .then(function (response) {
      return response.json();
    })
    .then(function (allData) {
      fetch('https://ipapi.co/json')
        .then(function (response) {
          return response.json();
        })
        .then(function (geoData) {
          document.getElementById('loading').remove();
          setViewportBreakPoint();

          mapZoom = setZoomLevel();
          map = L.map('map').setView([45, 35], mapZoom);
          map.zoomControl.setPosition('topleft');

          map.panTo(new L.LatLng(geoData.latitude, geoData.longitude));

          createTile(map);

          allDataWithCircle = getAllDataWithCircle(allData, map);
          createCircles(allDataWithCircle, map);

          setCircleSize(null, function (arg) {
            if (viewportBreakPoint === 'mobile') {
              arg.circle.setRadius(arg.circle.getRadius() / 2);
            }
          });

          // stats button click event

          var statsButtonEl = document.querySelectorAll('.stats-button');
          statsButtonEl.forEach(function (button) {
            button.addEventListener('click', handleClickStatsButton);
          });
        });
    })
    .catch(function (err) {
      throw Error(err);
    });
})();
