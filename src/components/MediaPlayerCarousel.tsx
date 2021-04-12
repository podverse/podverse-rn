import { Dimensions, StyleSheet } from 'react-native'
import Dots from 'react-native-dots-pagination'
import React from 'reactn'
import { PV } from '../resources'
import PVEventEmitter from '../services/eventEmitter'
import {
  MediaPlayerCarouselChapters,
  MediaPlayerCarouselClips,
  MediaPlayerCarouselShowNotes,
  MediaPlayerCarouselTranscripts,
  MediaPlayerCarouselViewer,
  ScrollView,
  View
} from '.'

type Props = {
  hasChapters: boolean
  hasTranscript: boolean
  navigation: any
}

type State = {
  activeIndex: number
}

const screenWidth = Dimensions.get('screen').width

export class MediaPlayerCarousel extends React.PureComponent<Props, State> {
  carousel: any
  scrollView: any
  handlePressClipInfo: any

  constructor(props) {
    super(props)
    const defaultActiveIndex = props.hasChapters ? 2 : 1
    
    this.state = {
      activeIndex: defaultActiveIndex
    }
  }

  componentDidMount() {
    const { activeIndex } = this.state
    const animated = false
    this.scrollToActiveIndex(activeIndex, animated)

    PVEventEmitter.on(PV.Events.UPDATE_PLAYER_STATE_FINISHED, this.scrollToDefaultActiveIndex)
  }

  componentWillUnmount() {
    PVEventEmitter.removeListener(PV.Events.UPDATE_PLAYER_STATE_FINISHED, this.scrollToDefaultActiveIndex)
  }

  scrollToDefaultActiveIndex = () => {
    const { player } = this.global
    const hasChapters = player?.episode?.chaptersUrl
    let defaultActiveIndex = 1
    if (hasChapters) defaultActiveIndex++
  
    const animated = false
    this.scrollToActiveIndex(defaultActiveIndex, animated)
  }

  scrollToActiveIndex = (activeIndex: number, animated: boolean) => {
    setTimeout(() => {
      this.scrollView &&
        this.scrollView.scrollTo({
          x: screenWidth * activeIndex,
          y: 0,
          animated
        })
      this.setState({ activeIndex })
    }, 0)
  }

  onScrollEnd = ({ nativeEvent }) => {
    const { contentOffset } = nativeEvent
    const activeIndex = Math.round(contentOffset.x / screenWidth)
    this.setState({ activeIndex })
  }

  _handlePressClipInfo = () => {
    const { hasChapters, hasTranscript } = this.props
    let lastActiveIndex = 2
    if (hasChapters) lastActiveIndex++
    if (hasTranscript) lastActiveIndex++
  
    const animated = true
    this.scrollToActiveIndex(lastActiveIndex, animated)
  }

  render() {
    const { navigation } = this.props
    const { activeIndex } = this.state
    const { player } = this.global
    const { episode } = player
    const hasChapters = episode?.chaptersUrl
    const hasTranscript = true
  
    let itemCount = 3
    if (hasChapters) itemCount++
    if (hasTranscript) itemCount++

    return (
      <View style={styles.wrapper} transparent>
        <ScrollView
          bounces={false}
          decelerationRate='fast'
          horizontal
          onMomentumScrollEnd={this.onScrollEnd}
          pagingEnabled={false}
          scrollViewRef={(ref: any) => (this.scrollView = ref)}
          showsHorizontalScrollIndicator={false}
          snapToInterval={screenWidth}
          snapToStart
          transparent>
          <MediaPlayerCarouselClips navigation={navigation} width={screenWidth} />
          {hasChapters && <MediaPlayerCarouselChapters navigation={navigation} width={screenWidth} />}
          <MediaPlayerCarouselViewer handlePressClipInfo={this._handlePressClipInfo} width={screenWidth} />
          <MediaPlayerCarouselShowNotes navigation={navigation} width={screenWidth} />
          {hasTranscript && <MediaPlayerCarouselTranscripts width={screenWidth} />}
        </ScrollView>
        <Dots
          active={activeIndex}
          activeColor={PV.Colors.skyDark}
          activeDotHeight={9}
          activeDotWidth={9}
          length={itemCount}
          paddingVertical={12}
          passiveColor={PV.Colors.grayLighter}
          passiveDotHeight={8}
          passiveDotWidth={8}
        />
      </View>
    )
  }
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1
  }
})
