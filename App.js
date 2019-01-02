/**
 * @flow
 */

import React, {Component} from "react"
import Router from "./src/Router"
import {StatusBar} from "react-native"
export default class App extends Component {
  constructor() {
    super()
    StatusBar.setBarStyle("light-content")
  }

  render() {
    return (
      <Router/>
    )
  }
}