const { createRunOncePlugin, withAndroidManifest } = require('@expo/config-plugins');

const setClearTextTrafficFalse = config => {
    return withAndroidManifest(config, config => {
        const androidManifest = config.modResults.manifest;
        const mainApplication = androidManifest.application[0];
        mainApplication.$['android:usesCleartextTraffic'] = 'false';
        return config;
    });
};


module.exports = createRunOncePlugin(
    setClearTextTrafficFalse,
    'setClearTextTrafficFalse',
    '1.0.0'
);