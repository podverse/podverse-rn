import { StyleSheet } from 'react-native'
import React from 'reactn'
import { PV } from '../resources'
import { View } from './'
import { HTMLScrollView } from './HTMLScrollView'

type Props = {
  navigation?: any
  width: number
}

type State = {}

export class MediaPlayerCarouselShowNotes extends React.PureComponent<Props, State> {
  constructor(props) {
    super(props)
    this.state = {}
  }

  render() {
    const { width } = this.props
    const { player, screenPlayer } = this.global
    const { episode } = player
    const { isLoading, viewType } = screenPlayer

    return (
      <View style={[styles.wrapper, { width }]} transparent={true}>
        {!isLoading && viewType === PV.Filters._showNotesKey && episode && (
          <HTMLScrollView
            fontSizeLargestScale={PV.Fonts.largeSizes.md}
            html={episode.description ? episode.description : ''}
          />
        )}
      </View>
    )
  }
}

const styles = StyleSheet.create({
  text: {
    color: 'black',
    flex: 0,
    fontSize: 32
  },
  wrapper: {
    flex: 1
  }
})
