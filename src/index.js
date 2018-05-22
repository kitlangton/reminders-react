/**
 * @class ExampleComponent
 */

import React, { Component } from 'react'
import App from './App'
import 'react-datepicker/dist/react-datepicker.css'
import './App.css'
//
// export default App

export default class ExampleComponent extends Component {
  render() {
    return <App />
    // return <div className={styles.test}>Nice Example Component: {text}</div>
  }
}
