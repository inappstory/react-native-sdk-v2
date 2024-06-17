module.exports = {
  presets: ['@react-native/babel-preset'],

  env: {
    development: {
      plugins: [['@babel/plugin-transform-react-jsx', { runtime: 'classic' }]],
    },
  },
};
