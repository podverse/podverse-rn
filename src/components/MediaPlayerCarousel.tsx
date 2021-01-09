import { Dimensions, StyleSheet, View } from 'react-native'
import Dots from 'react-native-dots-pagination'
import React from 'reactn'
import { MediaPlayerCarouselClips, MediaPlayerCarouselShowNotes, MediaPlayerCarouselViewer, ScrollView } from '.'

type Props = {}

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
    const { activeIndex } = this.state
    const { player } = this.global
    const { episode } = player
    const hasChapters = episode && episode.chaptersUrl
    const itemCount = hasChapters ? 4 : 3

    return (
      <View style={styles.wrapper}>
        <Dots
          active={activeIndex}
          activeDotHeight={12}
          activeDotWidth={12}
          length={itemCount}
          paddingVertical={16}
          passiveDotHeight={8}
          passiveDotWidth={8}
        />
        <ScrollView
          bounces={false}
          decelerationRate='fast'
          horizontal={true}
          onMomentumScrollEnd={this.onScrollEnd}
          pagingEnabled={false}
          scrollViewRef={(ref: any) => (this.scrollView = ref)}
          showsHorizontalScrollIndicator={false}
          snapToInterval={screenWidth}
          snapToStart={true}>
          {hasChapters && <MediaPlayerCarouselClips isChapters={true} width={screenWidth} />}
          <MediaPlayerCarouselClips isChapters={false} width={screenWidth} />
          <MediaPlayerCarouselViewer width={screenWidth} />
          <MediaPlayerCarouselShowNotes width={screenWidth} />
        </ScrollView>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1
  }
})
