(function() {

  return {

    SDK: {
      sdk_for_android: {name: 'Zendesk Support SDK for Android', unity: false},
      sdk_for_ios: {name: 'Zendesk Support SDK for iOS', unity: false},
      unity_1_for_android: {name: 'Zendesk Unity Plugin (v1.0, v.1.1) for Android', unity: true},
      unity_1_for_ios: {name: 'Zendesk Unity Plugin (v1.0, v1.1) for iOS', unity: true},
      unity_1_4_for_android: {name: 'Zendesk Unity Plugin (v1.4) for Android', unity: true},
      unity_1_4_for_ios: {name: 'Zendesk Unity Plugin (v1.4) for iOS', unity: true}
    },

    // REQUESTS ========================================================================

    requests: {

      fetchTicketAudits: function () {
        return {
          url: '/api/v2/tickets/' + this.ticket().id() + '/audits.json',
          type: 'GET'
        };
      },

    },

    // EVENTS ==========================================================================

    events: {
      'app.activated':'init',
      'fetchTicketAudits.done':'findSDKAudit',
      'fetchTicketAudits.fail':'showErrorMessage',
      'iframe.registered':'processSDKProperties'
    },

    // EVENT HANDLERS ==================================================================

    init: function() {
      this.switchTo('loading');
      this.ajax('fetchTicketAudits');
    },

    findSDKAudit: function (data) {
      var audits = data.audits;

      // Check for a ticket audit completed through the mobile_sdk channel
      this.sdk_audit = _.find(audits, function (audit) {
        return audit.via.channel === 'mobile_sdk';
      }, this);

      if (typeof this.sdk_audit !== 'undefined') { this.parseClient(this.sdk_audit); } else { this.hide(); }
    },

    parseClient: function () {
      // Prepare the client information for template
      var split = this.sdk_audit.metadata.system.client.split(' ');

      if (split.length === 3) {
        // SDK for iOS or SDK for Android
        if (split[1].indexOf('iOS') > -1) {
          this.sdk = this.SDK['sdk_for_ios'];
          this.os = 'iOS';
        }
        if (split[1].indexOf('Android') > -1) {
          this.sdk = this.SDK['sdk_for_android'];
          this.os = 'Android';
        }
      } else if (split.length === 4) {
        // Unity Plugin (v1.0, v1.1)
        if (split[3].indexOf('iOS') > -1) {
          this.sdk = this.SDK['unity_1_for_ios'];
          this.os = 'iOS';
        }
        if (split[3].indexOf('Android') > -1) {
          this.sdk = this.SDK['unity_1_for_android'];
          this.os = 'Android';
        }
        // Unity Plugin (v1.4)
        if (split[3].indexOf('Unity') > -1) {
          if (split[1].indexOf('iOS') > -1) {
            this.sdk = this.SDK['unity_1_4_for_ios'];
            this.os = 'iOS';
          } else {
            this.sdk = this.SDK['unity_1_4_for_android'];
            this.os = 'Android';
          }
        }
      }

      this.loadView();
    },

    loadView: function () {
      this.system = this.sdk_audit.metadata.system;
      if (this.sdk_audit.metadata.custom.hasOwnProperty('sdk')) { this.device = this.sdk_audit.metadata.custom.sdk; }

      // Display the core template that displays common metadata across all SDKs (sdk_audit.metadata.system)
      this.switchTo('system', {system: this.system, sdk: this.sdk.name });

      // Use renderTemplate(templateName, data) to load metadata into template then insert into system.hdbs
      var template;
      if (this.os === 'Android') { template = 'android-device'; } else { template = 'ios-device'; }
      var deviceTemplate = this.renderTemplate(template, { device: this.device, sdk_image: this.sdk.image, isUnity: this.sdk.unity });
      this.$('#device').html(deviceTemplate);
    },

    processSDKProperties: function () {
      // Only iOS devices can display battery percentage
      if (this.os == 'iOS') {
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
      }

    },

    showErrorMessage: function () {
      this.switchTo('error', 'message: There was an error or there were no mobile audits.');
    }

  };

}());
