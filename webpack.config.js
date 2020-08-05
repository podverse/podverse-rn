const CopyPlugin = require('copy-webpack-plugin');
const path = require('path')

module.exports = {
  entry: {
    main: './entry.js'
  },
  mode: 'production',
  output: {
    path: path.resolve(__dirname, '.')
  },
  plugins: [
    new CopyPlugin({
      patterns: [
        {
          from: 'src/resources/i18n/translations',
          to: 'android/app/src/main/assets/translations'
        }
      ]
    })
  ]
}
