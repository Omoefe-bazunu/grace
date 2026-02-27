const { withDangerousMod } = require('@expo/config-plugins');
const { promises: fs } = require('fs');
const path = require('path');

module.exports = function withIosModularHeaders(config) {
  return withDangerousMod(config, [
    'ios',
    async (config) => {
      const podfilePath = path.join(
        config.modRequest.platformProjectRoot,
        'Podfile',
      );
      let podfileContent = await fs.readFile(podfilePath, 'utf-8');

      // Add use_modular_headers! after platform declaration if not already present
      if (!podfileContent.includes('use_modular_headers!')) {
        podfileContent = podfileContent.replace(
          /(platform :ios.*)/,
          '$1\n\nuse_modular_headers!',
        );
        await fs.writeFile(podfilePath, podfileContent);
      }

      return config;
    },
  ]);
};
