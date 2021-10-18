
(function(config) {
    // If you will always be onboarding the same product, you can set the
    // product ID here to avoid having to enter it every time
    // config.productId = 1234;

    // Set this to true to claim the device to the user who is logged in.
    // This user must be a team member of the product. Set to false or 
    // leave unset to not claim the device (leave as unclaimed product
    // device).
    config.claimDevice = true;

    // Mark as development device. Not typically how product devices are
    // configured, but an option. Requires that the device be claimed.
    config.markAsDevelopment = false;

    // Set the device name to be the serial number. Optional if you
    // don't want to set all of the device names, or leave them blank.
    config.deviceNameIsSerialNumber = true;

    // Lock the firmware to the specified version. If not set, then the 
    // product default is used.
    // config.lockFirmwareVersion = 1;

    // Flash the firmware now. Only used if lockFirmwareVersion is non-zero.
    // config.flashNow = false;

    // If you want to assign a specific device group name, enter that here:
    // Note: device group name cannot contain spaces! Leave this unset if
    // using deviceGroupFormat
    // config.deviceGroupName = '';

    // If you want to assign a device group with a programmatically, set deviceGroupFormat to
    // one of these options:
    config.deviceGroupFormat = 'date'; // YYYYMMDD
    // config.deviceGroupFormat = 'dateQuantity'; // YYYYMMDD_nnn where nnn is the number of devices in the device list file





    // Setting an auth token here is optional. If you do not set the auth token
    // here, you'll be prompted for it interactively, which is more secure.
    // config.auth = 'xxxx';

    // If you prompt for the authentication code, this is how long the token
    // should be valid in seconds. 3600 = 1 hour
    config.authTokenLifeSecs = 3600;

    // If you are using interactive login, you can temporarily save the token
    // in the settings.json file so you don't have to log in every time you
    // run the tool.
    config.saveInteractiveToken = false;

}(module.exports));


