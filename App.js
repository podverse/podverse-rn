/**
 * @flow
 */

import React, {Component} from "react"
import Router from "./src/Router"
import {StatusBar} from "react-native"
import { configureStore } from "./src/store/store"
import { Provider } from "react-redux"

export default class App extends Component<*, *> {
  constructor() {
    super()
    this.store = configureStore()
    StatusBar.setBarStyle("light-content")
  }

  store: {}

  render() {
    return (
      <Provider store={this.store}>
        <Router/>
      </Provider>
    )
  }
}