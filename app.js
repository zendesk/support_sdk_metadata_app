(function() {

  return {
    requests: {
      fetchTicketAudits: function () {
        return {
          url: '/api/v2/tickets/' + this.ticket().id() + '/audits.json',
          type: 'GET'
        };
      },
      getLocationWeather: function (lat, lon) {
        return {
          url: 'http://api.openweathermap.org/data/2.5/weather?lat=' + lat + '&lon=' + lon + '&appid=8a64f5ac55f62c14e1d5788f6acbfe52'
        };
      },
      // getLatestSDKRelease: function (OS) {
      //   return {
      //     url: 'http://developer.zendesk.com/embeddables/docs/' + OS + '/migration',
      //     type: 'GET',
      //     dataType: 'html'
      //   }
      // }
    },
    events: {
      'app.activated':'init',
      'fetchTicketAudits.done':'extractSDKProperties',
      'fetchTicketAudits.fail':'showErrorMessage',
      'iframe.registered':'processSDKProperties',
      // 'getLatestSDKRelease.done':'showLatestRelease',
      // 'getLatestSDKRelease.fail':'showErrorMessage',
      'getLocationWeather.done':'showLocationWeather',
      'getLocationWeather.fail':'showErrorMessage'
    },

    init: function() {
      this.ajax('fetchTicketAudits');
    },

    extractSDKProperties: function (data) {
      var audits = data.audits;
      this.mobile_sdk_ticket = false;

      // Check for a ticket audit completed through the mobile_sdk channel
      _.each(audits, function (audit) {
        if (audit.via.channel == 'mobile_sdk') {
          if (audit.metadata.custom.hasOwnProperty('sdk')) {
            this.mobile_sdk_ticket = true;
            this.client = audit.metadata.system.client;
            this.ip_address = audit.metadata.system.ip_address;
            this.latitude = audit.metadata.system.latitude;
            this.longitude = audit.metadata.system.longitude;
            this.user_location = audit.metadata.system.location;
            this.device_model = audit.metadata.custom.sdk.device_model;
            this.device_os = audit.metadata.custom.sdk.device_os;
            this.device_total_memory = audit.metadata.custom.sdk.device_total_memory;
            this.device_storage = audit.metadata.custom.sdk.device_storage;
            this.device_battery = audit.metadata.custom.sdk.device_battery;
            this.trusted = audit.metadata.trusted;
          }
        }
      }, this);

      this.loadView();
    },

    loadView: function () {
      if (this.mobile_sdk_ticket === true) {
        this.switchTo('main', { client: this.client, ip_address: this.ip_address, user_location: this.user_location, device_model: this.device_model, device_os: this.device_os,
        device_total_memory: this.device_total_memory, device_storage: this.device_storage, device_battery: this.device_battery, trusted: this.trusted });
      } else {
        console.log('This ticket doesn\'t have any mobile SDK ticket audits.');
      }
    },

    processSDKProperties: function () {
      // Parse the client for the device OS and set the correct device OS image
      var clientData = this.client.split(' ');
      var SDKClient = clientData[0];
      var clientOS = clientData[1];
      var OSImageSource;
      var OS;
      if (clientOS.indexOf('iOS') > -1) {
        // Use iOS image
        OSImageSource = this.assetURL('ios.png');
        OS = 'android';
      } else if (clientOS.indexOf('Android') > -1) {
        // Use Android image
        OSImageSource = this.assetURL('android.png');
        OS = 'ios';
      }
      this.$('#device_specs img').attr('src', OSImageSource);
      this.$('#device_os')[0].textContent = clientOS;
      this.$('#client')[0].textContent = SDKClient;

      // Determine which battery image to use
      var batteryImageSource;
      if (this.device_battery >= 75) {
        batteryImageSource = this.assetURL('battery-4.png');
      } else if (this.device_battery >= 50 && this.device_battery < 75) {
        batteryImageSource = this.assetURL('battery-3.png');
      } else if (this.device_battery >= 25 && this.device_battery < 50) {
        batteryImageSource = this.assetURL('battery-2.png');
      } else if (this.device_battery >= 5 && this.device_battery < 25) {
        batteryImageSource = this.assetURL('battery-1.png');
      } else {
        batteryImageSource = this.assetURL('battery-0.png');
      }

      this.$('div#device_battery img').attr('src', batteryImageSource);

      // Send coordinates to Google map
      this.postMessage('mapCoordinates', { latitude: this.latitude, longitude: this.longitude });

      // Get latest Zendesk SDK version from developer.zendesk.com
      // this.ajax('getLatestSDKRelease', OS);

      // Get weather from location
      this.ajax('getLocationWeather', this.latitude, this.longitude);

    },

    // showLatestRelease: function (response) {
    //   console.log(response);
    //   console.log(response.indexOf('<td>'));
    // },

    showLocationWeather: function (data) {
      if (data.weather[0].main == "Rain") {
        this.$('div#weather img').attr('src', this.assetURL('rain.png'));
      } else if (data.weather[0].main == "Clouds") {
        this.$('div#weather img').attr('src', this.assetURL('clouds.png'));
      } else if (data.weather[0].main == "Clear") {
        this.$('div#weather img').attr('src', this.assetURL('clear.png'));
      } else if (data.weather[0].main == "Mist") {
        this.$('div#weather img').attr('src', this.assetURL('mist.png'));
      } else {
        this.$('div#weather').textContent = data.weather[0].main;
      }
    },

    showErrorMessage: function () {
      this.switchTo('error', { message: 'There was an error.' });
    }

  };

}());
