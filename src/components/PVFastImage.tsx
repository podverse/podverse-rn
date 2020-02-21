import React from 'react'
import { View } from 'react-native'
import FastImage from 'react-native-fast-image'
import { Icon } from '.'

type Props = {
  isSmall?: boolean
  pvKey?: string
  resizeMode?: any
  source?: string
  styles?: any
}

type State = {
  hasError: boolean
}

export class PVFastImage extends React.PureComponent<Props, State> {
  constructor(props: Props) {
    super(props)

    this.state = {
      hasError: false
    }
  }

  _handleError = () => {
    this.setState({ hasError: true })
  }

  render() {
    const { isSmall, pvKey, resizeMode = 'contain', source, styles } = this.props
    const { hasError } = this.state

    return (
      <>
        {
          source && !hasError ?
            <FastImage
              key={pvKey}
              onError={this._handleError}
              resizeMode={resizeMode}
              source={{
                uri: source,
                cache: FastImage.cacheControl.web
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
