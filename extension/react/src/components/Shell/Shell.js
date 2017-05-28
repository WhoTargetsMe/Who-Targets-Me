import React, { Component } from 'react'
import './Shell.less'

import { Button } from 'elemental'

export default class Shell extends Component {
  render() {
    return (
      <div>
        <Button size="lg" type="hollow-primary">Large Button</Button>
      </div>
    )
  }
}
