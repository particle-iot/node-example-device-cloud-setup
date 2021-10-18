const fs = require('fs');
const path = require('path');

let config = require('./config');

var Particle = require('particle-api-js');
var particle = new Particle();

let productInfo;
let importSize = 1;

const helper = require('@particle/node-example-helper');
helper
    .withRootDir(__dirname)
    .withConfig(config);
 

async function deviceCloudSetup(deviceId) {
    
    console.log('Setting up ' + deviceId + '...');

    try {
        // Add device to product
        console.log('  Adding to product ' + productInfo.id + '...');
        let resp = await particle.addDeviceToProduct({
            product: productInfo.id,
            deviceId, 
            auth: helper.auth
        });

        // Get device info
        const deviceInfo = (await particle.getDevice({ 
            product: productInfo.id,
            deviceId, 
            auth: helper.auth 
        })).body;
        // console.log('deviceInfo', deviceInfo);  

        if (config.claimDevice) {
            console.log('  Claiming device...');
            await particle.claimDevice({ 
                deviceId, 
                auth: helper.auth 
            });
        }

        let newDeviceInfo = {};

        if (config.markAsDevelopment) {
            newDeviceInfo.development = true;
        }
        if (config.deviceNameIsSerialNumber) {
            newDeviceInfo.name = deviceInfo.serial_number;
        }
        if (config.lockFirmwareVersion) {
            newDeviceInfo.desiredFirmwareVersion = config.lockFirmwareVersion;

            if (config.flashNow) {
                newDeviceInfo.flash = config.flashNow;
            }
        }

        if (Object.keys(newDeviceInfo).length > 0) {
            console.log('  Setting device info...');
            await particle.updateDevice(Object.assign(newDeviceInfo, { 
                product: productInfo.id,
                deviceId, 
                auth: helper.auth 
            }));

        }

        // Device group?
        if (config.deviceGroupName || config.deviceGroupFormat) {
            let groupName;
            if (config.deviceGroupName) {
                groupName = config.deviceGroupName;
            }
            else {
                switch(config.deviceGroupFormat) {
                    case 'date':
                        groupName = helper.formatDateYYYYMMDD();
                        break;

                    case 'dateQuantity':
                        groupName = helper.formatDateYYYYMMDD() + '_' + importSize;
                        break;
                }
            }

            if (groupName) {
                console.log('  Assigning device group ' + groupName + '...');
                await helper.assignDeviceGroups({ 
                    product: productInfo.id,
                    deviceId,
                    groups: [groupName],
                    auth: helper.auth
                });    
            }
        }        

        console.log('  Done!');

    }
    catch(e) {
        console.log('Exception during device cloud setup', e);
    }

}

async function run() {
    await helper.authenticate();

    if (config.productId) {
        // Make sure user has access to it
        try {
            productInfo = await helper.getProductInfo(config.productId);
        }
        catch(e) {
            console.log('productId is configured in config.js but is invalid or you do not have access to it');
            helper.warnConfigKey('productId');
            process.exit(1);
        }
    }

    if (!config.productId) {
        console.log('Select the product you want to set up devices for');

        productInfo = await helper.promptForProduct({
            allowSandbox: false,
            prompt: 'Do cloud setup devices for product'
        });
        if (productInfo.cancel || productInfo.error) {
            process.exit(1);
        }
    }

    // console.log('productInfo', productInfo);

    console.log('Getting list of devices in product...');
    let productDeviceList = await helper.getProductDeviceList(productInfo.id);
    // console.log('productDeviceList', productDeviceList);


    // Is there a devices.txt file?
    let devicesToSetup = [];

    const devicesFilePath = path.join(__dirname, 'devices.txt');
    if (fs.existsSync(devicesFilePath)) {
        // Yes. Are these devices in it?
        const devicesFileString = fs.readFileSync(devicesFilePath, 'utf8');

        devicesToSetup = helper.parseDeviceIdFile(devicesFileString);

        importSize = devicesToSetup.length;
    }


    if (devicesToSetup.length == 0) {
        // No, prompt interactively

        while(true) {
            const resp = await helper.question('Device ID or Serial Number (q to quit): ');
            if (helper.isQuit(resp)) {
                break;
            }

            const device = await helper.findByDeviceIdOrSerialNumber(resp);
            if (device.device_id) {
                if (device.platform_id && device.platform_id != productInfo.platform_id) {
                    console.log('Wrong type of device for product');
                    continue;
                }
                
                await deviceCloudSetup(device.device_id);
            }
            else {
                console.log('Device not found');
            }
        }
    }
    else {
        for(const deviceId of devicesToSetup) {
            deviceCloudSetup(deviceId);
        }    
    }


    helper.close();
}


run();
