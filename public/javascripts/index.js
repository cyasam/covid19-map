'use strict';

(function() {
  function createTile(map) {
    L.tileLayer(
      'https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}',
      {
        attribution:
          'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
        maxZoom: 6,
        minZoom: 2,
        id: 'mapbox/dark-v10',
        tileSize: 512,
        zoomOffset: -1,
        wheelDebounceTime: 100,
        accessToken:
          'pk.eyJ1IjoiY3lhc2FtIiwiYSI6ImNrODM0d2t5aDAwdmYzbWp1aHVwa29wMTAifQ.EYyara4FIFASFahgWAiVWw'
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
      return 14;
    } else if (number >= 10000 && number < 50000) {
      return 20;
    } else if (number >= 50000) {
      return 40;
    } else {
      return 5;
    }
  }

  function getAllDataWithCircle(allData, map) {
    return allData.map(function(data) {
      var {
        coordinates: { latitude, longitude }
      } = data;

      var circle = null;

      if (data.stats.confirmed > 0) {
        circle = L.circleMarker([latitude, longitude], {
          color: 'red',
          fillColor: '#f03',
          fillOpacity: 0.5,
          weight: 2,
          radius: setCircleRadius(data.stats.confirmed)
        }).addTo(map);
      }

      return {
        ...data,
        circle
      };
    });
  }

  function createCircles(allData, map) {
    allData.forEach(function(data) {
      if (data.stats.confirmed > 0) {
        var html = `
        <div class="case-tooltip">
          <h3>${data.province || data.country}</h3>
          <table>
            <tr class="confirmed">
              <td>Confirmed</td>
              <td>${data.stats.confirmed}</td>
            </tr>
            <tr class="active">
              <td>Active</td>
              <td>${data.stats.active}</td>
            </tr>
            <tr class="deaths">
              <td>Deaths</td>
              <td>${data.stats.deaths}</td>
            </tr>
            <tr class="recovered">
              <td>Recovered</td>
              <td>${data.stats.recovered}</td>
            </tr>
          </table>
        </div>`;

        data.circle
          .bindTooltip(html, {
            sticky: true,
            className: 'custom-tooltip',
            offset: L.point(15, 15)
          })
          .addTo(map);
      }
    });
  }

  fetch('/api/all-data')
    .then(function(response) {
      return response.json();
    })
    .then(function(allData) {
      document.getElementsByClassName('lds-dual-ring')[0].remove();

      var map = L.map('map').setView([45, 35], 4);

      createTile(map);

      var allDataWithCircle = getAllDataWithCircle(allData, map);
      createCircles(allDataWithCircle, map);

      var myZoom = {
        start: map.getZoom(),
        end: map.getZoom()
      };

      map.on('zoomstart', function(e) {
        myZoom.start = map.getZoom();
      });

      map.on('zoomend', function(e) {
        myZoom.end = map.getZoom();
        var diff = myZoom.start - myZoom.end;

        allDataWithCircle.map(function(data) {
          if (data.circle) {
            if (diff > 0) {
              data.circle.setRadius(data.circle.getRadius() * 1);
            } else if (diff < 0) {
              data.circle.setRadius(data.circle.getRadius() / 1);
            }
          }
        });
      });
    });
})();
