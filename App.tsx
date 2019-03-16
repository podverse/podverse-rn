import React, { Component } from 'react'
import { StatusBar } from 'react-native'
import { Provider } from 'react-redux'
import Router from './src/Router'
import { configureStore } from './src/store/store'

type Props = {}

type State = {}

interface App {
  store?: any
}

class App extends Component<Props, State> {
  constructor (props: Props) {
    super(props)
    this.store = configureStore()
    StatusBar.setBarStyle('light-content')
  }

  render () {
    return (
      <Provider store={this.store}>
        <Router/>
      </Provider>
    )
  }
}

export default App
