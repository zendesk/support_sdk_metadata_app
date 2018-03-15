import View from 'view';
import $ from 'jquery';
import * as audit from './audit_parser.js';
import * as renderer from './device_info_renderer.js';

class TicketSidebar {

    constructor(client, data) {
        this.client = client;
        this.metadata = data.metadata;
        this.context = data.context;
        this.view = new View();

        this.view.switchTo('loading');

        this.fetchAudits(this.context.ticketId)
            .then(this.showAudits.bind(this))
            .catch(this.showErrorMessage.bind(this));
    }

    showAudits(audits) {
        let deviceInfo = audit.findSdkAudit(audits);

        if (deviceInfo.error == true) {
            this.hide();

        } else {
            this.renderDeviceInfo(deviceInfo);
            
            // resize to fit
            this.client.invoke('resize', { height: $('html').height(), width: '100%' });
        }
    }

    renderDeviceInfo(deviceInfo) {

        let deviceString = renderer.buildDeviceString(deviceInfo);
        let info = renderer.buildDeviceInfoForPresentation(deviceInfo);
        
        let infoArray = [];
        for (var i = 0; i < info.length; i+=2) {
            infoArray.push([info[i], info[i + 1]])
        }

        let deviceInfoDocument = infoArray.map(it => this.view.renderTemplate('device-info-row', { infoLeft: it[0], infoRight: it[1] }))

        this.view.switchTo('system', { 
            system: deviceInfo.metadata.system, 
            sdk: deviceString 
        });

        $('#device').html(deviceInfoDocument);
    }

    fetchAudits(ticketId) {
        return this.client.request({
            url: `/api/v2/tickets/${ticketId}/audits.json`,
            type: 'GET',
            dataType: 'json'
        }) 
    }

    hide() {
        this.client.invoke('hide');
    }

    showErrorMessage() {
        this.view.switchTo('error', 'message: There was an error or there were no mobile audits.');
    }
}

export default TicketSidebar;