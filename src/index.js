/**
 * @class ExampleComponent
 */

import React from 'react'
import ReactDOM from 'react-dom'
import App from './App'
import 'react-datepicker/dist/react-datepicker.css'
import './App.css'

export default id => ReactDOM.render(<App />, document.getElementById(id))
