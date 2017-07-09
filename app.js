(function() {

  return {

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
      this.client = this.sdk_audit.metadata.system.client;

      if(this.client.indexOf('iOS') > -1){ this.os = "iOS"; } else{ this.os = "Android"; }
      if(this.client.indexOf('Unity') > -1){ this.unity = true; } else{ this.unity = false; }

      if(this.unity){ this.sdk = "Unity Plugin for " + this.os; } else{ this.sdk = "Zendesk Support SDK for " + this.os; }

      var regex = /(\d{1,2}\.\d{1,2}\.\d{1,2}\.\d{1,2})/;
      var version = regex.exec(this.client);
      if (version != null) { this.sdk += " v" + version[0]; }
      // Unity 1.0 and 1.1 Plugins are the only SDKs that do not have a version number in the client metadata
      else { this.unity = true; this.sdk += " Unity Plugin (v1.0, v1.1)"; }

      this.loadView();
    },

    loadView: function () {
      this.system = this.sdk_audit.metadata.system;
      if (this.sdk_audit.metadata.custom.hasOwnProperty('sdk')) { this.device = this.sdk_audit.metadata.custom.sdk; }

      // Display the core template that displays common metadata across all SDKs (sdk_audit.metadata.system)
      this.switchTo('system', {system: this.system, sdk: this.sdk });

      // Use renderTemplate(templateName, data) to load metadata into template then insert into system.hdbs
      var template;
      if (this.os === 'Android') { template = 'android-device'; } else { template = 'ios-device'; }
      var deviceTemplate = this.renderTemplate(template, { device: this.device, isUnity: this.unity });
      this.$('#device').html(deviceTemplate);
    },

    showErrorMessage: function () {
      this.switchTo('error', 'message: There was an error or there were no mobile audits.');
    }

  };

}());
