/** @format */
import './wdyr'
const { AppRegistry } = require('react-native')
const App = require('./App').default
import { name as appName } from './app.json'
import './src/lib/extensions'

AppRegistry.registerComponent(appName, () => App)
