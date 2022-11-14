import { Podcast } from 'podverse-shared'
import React from 'reactn'
import { StyleSheet, FlatList, Dimensions } from 'react-native'
import { isPortrait } from '../lib/deviceDetection'
import { FastImage, PressableWithOpacity } from './'

type Props = {
  data?: [any]
  isRefreshing: boolean
  onItemSelected: any
  ListFooterComponent: any
}

type State = {
  height: number
  orientation: 'portrait' | 'landscape'
  width: number
}

export class GridView extends React.PureComponent<Props, State> {

  constructor(props) {
    super(props)

    this.state = {
      height: Dimensions.get('screen').width,
      orientation: isPortrait() ? 'portrait' : 'landscape',
      width: Dimensions.get('screen').width
    }
  }

  componentDidMount(): void {
    Dimensions.addEventListener('change', () => {
      this.setState({
        orientation: isPortrait() ? 'portrait' : 'landscape'
      })
    })

    Dimensions.addEventListener('change', this._handleOrientationChange)
  }

  componentWillUnmount(): void {
    Dimensions.removeEventListener('change', this._handleOrientationChange)
  }

  _handleOrientationChange = () => {
    this.setState({
      height: Dimensions.get('screen').width,
      orientation: isPortrait() ? 'portrait' : 'landscape',
      width: Dimensions.get('screen').width
    })
  }

  render() {
    const { height, orientation, width } = this.state
    const { deviceType, newEpisodesCount } = this.global
    const shouldShowResults = this.props.data && this.props.data.length > 0
    const isTablet = deviceType === 'tablet'
    const isLandscapeMode = orientation === 'landscape'
    const isTabletLandscape = isTablet && isLandscapeMode
    
    const getImageThumbnailInfo = () => {
      let imageThumbnailStyle = styles.imageThumbnailMobile
      let columns = 3
      if (isTabletLandscape) {
        imageThumbnailStyle = styles.imageThumbnailTabletLandscape
        columns = 5
      } else if (isTablet) {
        imageThumbnailStyle = styles.imageThumbnailTabletPortrait
        columns = 4
      }

      // subtract 2 so the device doesn't round up to a size that
      // cuts off the end of the last item in the grid.
      const imageThumbnailDimensions = {
        height: height / columns - 2,
        width: width / columns - 2
      }

      return {
        columns,
        imageThumbnailStyles: [imageThumbnailStyle, imageThumbnailDimensions]
      }
    }
    const { columns, imageThumbnailStyles } = getImageThumbnailInfo()

    return (
      <FlatList
        {...this.props}
        ItemSeparatorComponent={null}
        testID='grid_view'
        key={isTabletLandscape ? 'landscape' : 'portrait'}
        data={this.props.data}
        onEndReachedThreshold={0.3}
        refreshing={this.props.isRefreshing}
        renderItem={({ item }: { item: Podcast }) => {
          const id = item?.id
          const newContentCount = newEpisodesCount?.[id]?.count || 0
          return (
            <PressableWithOpacity
              onPress={() => {
                this.props.onItemSelected?.(item)
              }}
              style={styles.cellbutton}>
              <FastImage
                isAddByRSSPodcast={!!item?.addByRSSPodcastFeedUrl}
                isTabletGridView={isTablet}
                newContentCount={newContentCount}
                placeholderLabel={item?.title || ''}
                resizeMode='cover'
                showLiveIndicator={item?.latestLiveItemStatus === 'live'}
                source={item?.shrunkImageUrl || item?.imageUrl || ''}
                styles={imageThumbnailStyles}
                valueTags={item.value}
              />
            </PressableWithOpacity>
          )
        }}
        numColumns={columns}
        keyExtractor={(_, index) => index.toString()}
        style={shouldShowResults ? [] : styles.noResultsView}
      />
    )
  }
}

const styles = StyleSheet.create({
  noResultsView: {
    flexGrow: 0,
    flexShrink: 0
  },
  imageThumbnailMobile: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageThumbnailTabletLandscape: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageThumbnailTabletPortrait: {
    justifyContent: 'center',
    alignItems: 'center'
  },
  cellbutton: {
    flex: 0,
    flexDirection: 'column',
    margin: 1
  }
})
