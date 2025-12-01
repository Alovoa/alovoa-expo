const { withGradleProperties } = require('@expo/config-plugins');

module.exports = function withCustomGradleProps(config) {
    return withGradleProperties(config, (config) => {
        config.modResults.push({
            type: 'property',
            key: 'org.gradle.jvmargs',
            value: '-Xmx6g -XX:MaxMetaspaceSize=3g -Dfile.encoding=UTF-8',
        });
        config.modResults.push({
            type: 'property',
            key: 'org.gradle.daemon',
            value: 'true',
        });
        config.modResults.push({
            type: 'property',
            key: 'android.dependencyMetadataInApk',
            value: 'false',
        });
        return config;
    });
};
