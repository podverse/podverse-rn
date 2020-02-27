import React from 'react'
import { View } from 'react-native'
import FastImage from 'react-native-fast-image'
import { Icon } from '.'
const uuidv4 = require('uuid/v4')

type Props = {
  isSmall?: boolean
  resizeMode?: any
  source?: string
  styles?: any
}

type State = {
  hasError: boolean
  uuid: string
}

export class PVFastImage extends React.PureComponent<Props, State> {
  constructor(props: Props) {
    super(props)

    this.state = {
      hasError: false,
      uuid: uuidv4()
    }
  }

  _handleError = () => {
    this.setState({ hasError: true })
  }

  render() {
    const { isSmall, resizeMode = 'contain', source, styles } = this.props
    const { hasError, uuid } = this.state

    return (
      <>
        {
          source && !hasError ?
            <FastImage
              key={uuid}
              onError={this._handleError}
              resizeMode={resizeMode}
              source={{
                uri: source
              }}
              style={styles} />
            :
            <View style={{
              ...styles,
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Icon
                isSecondary={true}
                name='podcast'
                size={isSmall ? 32 : 36} />
            </View>
        }
      </>
    )
  }
}
