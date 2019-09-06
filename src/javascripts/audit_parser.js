
export const PLATFORM_UNKOWN = 1;
export const PLATFORM_ANDROID = 2;
export const PLATFORM_IOS = 3;

export const VARIANT_UNKOWN = 10;
export const VARIANT_UNITY = 11;

export const VERSION_UNKOWN = -20;
export const VERSION_1x = -21;

if (typeof String.prototype.contains === 'undefined') { 
    String.prototype.contains = function(it) { return this.indexOf(it) != -1; };
}

const findPlatform = (input) => {
    if (input.contains("Android")) {
        return PLATFORM_ANDROID;
    } else if (input.contains("iOS")) {
        return PLATFORM_IOS;
    } else {
        return PLATFORM_UNKOWN;
    }
}

const findVersion = (input) => {
    if (input.startsWith("Zendesk SDK for")) {
        return VERSION_1x;
    } else {
        let segments = input.split(" ");
        let versionSegment = segments.find(data => data.startsWith("Zendesk-SDK/"));

        if (versionSegment) {
            let version = versionSegment.split("/");

            if (version.length === 2) {
                return version[1];
            } else {
                return VERSION_UNKOWN;
            }

        } else {
            return VERSION_UNKOWN;
        }
    }
}

const findVariant = (input) => {
    if (input.contains("Unity/")) {
        return VARIANT_UNITY;
    } else {
        return VARIANT_UNKOWN;
    }
}

export const findSdkAudit = (data) => {
    let mobileSdkAudit = data.audits.find(item => {
        if(item.via.channel === "mobile_sdk") {
            let userAgent = item.metadata.system.client;
            return userAgent && (userAgent.startsWith("Zendesk-SDK") || userAgent.startsWith("Zendesk SDK"));
        } else {
            return false;
        }
    })

    if (mobileSdkAudit) {
        let userAgent = mobileSdkAudit.metadata.system.client;
        return {
            platform: findPlatform(userAgent),
            version: findVersion(userAgent),
            variant: findVariant(userAgent),
            userAgent: userAgent,
            metadata: {
                sdk: mobileSdkAudit.metadata.custom.sdk,
                system: mobileSdkAudit.metadata.system
            }
        }
    } 
    
    return {
        error: true
    };
}
