// // babel.config.js
// module.exports = function (api) {
//   api.cache(true);
//   return {
//     presets: ['babel-preset-expo'],
//     plugins: [
//       [
//         'module-resolver',
//         {
//           root: ['./'],
//           alias: {
//             '@': './',
//           },
//         },
//       ],
//       // 'expo-router/babel' removed - now handled by babel-preset-expo
//     ],
//   };
// };

// babel.config.js
module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      [
        'module-resolver',
        {
          root: ['./'],
          alias: {
            '@': './',
          },
        },
      ],
      // 'expo-router/babel' removed - now handled by babel-preset-expo

      // 👇 ADDED: MUST BE THE LAST PLUGIN
      'react-native-reanimated/plugin',
    ],
  };
};
