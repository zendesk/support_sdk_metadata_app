import * as audit from './audit_parser.js';


export const buildDeviceString = (deviceInfo) => {
    var deviceString = "";
    
    // Variant
    if (deviceInfo.variant == audit.VARIANT_UNITY) {
        deviceString = "Unity Plugin for ";
    } else {
        deviceString = "Zendesk Support SDK for ";
    }

    // Platform
    if (deviceInfo.platform == audit.PLATFORM_ANDROID) {
        deviceString += "Android ";
    } else {
        deviceString += "iOS ";
    }

    // Version
    if (deviceInfo.version == audit.VERSION_1x) {
        deviceString += "v1.0 or v1.1 ";
    } else if (deviceInfo.version == audit.VERSION_UNKOWN) {
        deviceString += "unkown version ";
    } else {
        deviceString += `v${deviceInfo.version}`;
    }

    return deviceString;
}

const findManufacturer = (sdkMetaData, platform) => {

    if (platform == audit.PLATFORM_IOS) {
        return {
            key: 'Brand',
            value: 'Apple Inc.'
        }

    } else if(platform == audit.PLATFORM_ANDROID) {
        let brand = sdkMetaData['device_manufacturer'];

        if (brand) {
            return {
                key: 'Brand',
                value: brand
            }
        }
    }
}

const findModelInformation = (sdkMetaData) => {
    let model = sdkMetaData['device_model'];

    if (model) {
        let value;
        if (model.contains("Simulator") || model.contains("Android SDK") || model.contains("Unknown Device")) {
            value = model;
        } else {
            let searchString = model.split("/")[0];
            value = `<a href="https://www.gsmarena.com/res.php3?sSearch=${searchString}" target="_blank">${model}</a>`;
        }

        return {
            key: 'Model',
            value: value
        }
    }
}

const findOsInformation = (sdkMetaData, platform) => {

    let apiLevel = sdkMetaData['device_api'];
    let osVersion = sdkMetaData['device_os'];

    if (platform == audit.PLATFORM_ANDROID) {
        return {
            key: 'OS Version',
            value: `API ${apiLevel}, Android ${osVersion}`
        }    
    } else if (platform == audit.PLATFORM_IOS) {
        if (osVersion) {
            return {
                key: 'iOS Version',
                value: osVersion
            }
        }
    }
}

const findBatteryInformation = (sdkMetaData) => {

    let battery = sdkMetaData['device_battery'] || -1;

    if (battery > -1) {
        return {
            key: 'Battery',
            value: `${battery}%`
        }
    }
}

const findStorageInformation = (sdkMetaData) => {
    
    let storage = sdkMetaData['device_storage'] || -1;

    if (storage > -1) {
        return {
            key: 'Storage',
            value: `${storage} GB`
        }
    }
}

const convertMemoryForDisplay = (memoryAmount, sdkVersion) => {

    if (sdkVersion == audit.VERSION_1x || sdkVersion.startsWith("1.")) {
        // 1.x sends memory usage in B
        return (memoryAmount / 1024 / 1024 / 1024).toFixed(2);
    } else { 
        // 2.x sends memory usage in MB
        return (memoryAmount / 1024).toFixed(2);
    }
}

const findMemoryUseage = (sdkMetaData, sdkVersion) => {

    let totalMemory = sdkMetaData['device_total_memory'] || 0;
    let usedMemory = sdkMetaData['device_used_memory'] || 0;

    if (totalMemory > 0 && usedMemory > 0) {
        return {
            key: 'Memory',
            value: `${convertMemoryForDisplay(usedMemory, sdkVersion)}/${convertMemoryForDisplay(totalMemory, sdkVersion)} GB`
        }

    } else if (totalMemory > 0 && usedMemory == 0) {
        return {
            key: 'Memory',
            value: `${convertMemoryForDisplay(totalMemory, sdkVersion)} GB`
        }

    } else if (totalMemory == 0 && usedMemory > 0) {
        return {
            key: 'Used Memory',
            value: `${convertMemoryForDisplay(usedMemory, sdkVersion)} GB`
        }
    }
}

export const buildDeviceInfoForPresentation = (deviceInfo) => {
    let sdkMetaData = deviceInfo.metadata.sdk || {};
    return [
        findManufacturer(sdkMetaData, deviceInfo.platform),
        findModelInformation(sdkMetaData),
        findOsInformation(sdkMetaData, deviceInfo.platform),
        findMemoryUseage(sdkMetaData, deviceInfo.version),
        findBatteryInformation(sdkMetaData),
        findStorageInformation(sdkMetaData)
    ].filter(it => it)
}