import { Dimensions, StyleSheet } from 'react-native'
import Dots from 'react-native-dots-pagination'
import React from 'reactn'
import { MediaPlayerCarouselClips, MediaPlayerCarouselShowNotes, MediaPlayerCarouselViewer, ScrollView, View } from '.'
import { PV } from '../resources'

type Props = {
  imageHeight: number
  imageWidth: number
}

type State = {
  activeIndex: number
}

const screenWidth = Dimensions.get('screen').width

export class MediaPlayerCarousel extends React.PureComponent<Props, State> {
  carousel: any
  scrollView: any

  constructor(props) {
    super(props)
    const defaultActiveIndex = props.hasChapters ? 2 : 1

    this.state = {
      activeIndex: defaultActiveIndex
    }
  }

  componentDidMount() {
    setTimeout(() => {
      this.scrollView &&
        this.scrollView.scrollTo({
          x: screenWidth,
          y: 0,
          animated: false
        })
    }, 0)
  }

  onScrollEnd = ({ nativeEvent }) => {
    const { contentOffset } = nativeEvent
    const activeIndex = contentOffset.x / screenWidth
    this.setState({ activeIndex })
  }

  render() {
    const { imageHeight, imageWidth } = this.props
    const { activeIndex } = this.state
    const { player } = this.global
    const { episode } = player
    const hasChapters = episode && episode.chaptersUrl
    const itemCount = hasChapters ? 4 : 3

    return (
      <View style={styles.wrapper} transparent={true}>
        <ScrollView
          bounces={false}
          decelerationRate='fast'
          horizontal={true}
          onMomentumScrollEnd={this.onScrollEnd}
          pagingEnabled={false}
          scrollViewRef={(ref: any) => (this.scrollView = ref)}
          showsHorizontalScrollIndicator={false}
          snapToInterval={screenWidth}
          snapToStart={true}
          transparent={true}>
          {hasChapters && <MediaPlayerCarouselClips isChapters={true} width={screenWidth} />}
          <MediaPlayerCarouselClips isChapters={false} width={screenWidth} />
          <MediaPlayerCarouselViewer imageHeight={imageHeight} imageWidth={imageWidth} width={screenWidth} />
          <MediaPlayerCarouselShowNotes width={screenWidth} />
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
