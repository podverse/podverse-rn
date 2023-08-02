import { Podcast } from 'podverse-shared'
import React from 'reactn'
import { StyleSheet, FlatList } from 'react-native'
import { safeKeyExtractor } from '../lib/utility'
import { PV } from '../resources'
import { FastImage, PressableWithOpacity } from './'

type Props = {
  data?: [any]
  isRefreshing: boolean
  ListFooterComponent: any
  ListHeaderComponent?: any
  onItemSelected: any
  onLongPressItem?: (arg0: Podcast) => void
  stickyHeader?: boolean
}
export class GridView extends React.PureComponent<Props> {
  render() {
    const { stickyHeader, ListHeaderComponent } = this.props
    const { deviceType, newEpisodesCount, screen } = this.global
    const { orientation, screenWidth } = screen
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
      const imageThumbnailHeight = screenWidth / columns - 2
      const imageThumbnailDimensions = {
        height: imageThumbnailHeight,
        width: imageThumbnailHeight
      }

      return {
        columns,
        imageThumbnailStyles: [imageThumbnailStyle, imageThumbnailDimensions],
        imageThumbnailHeight
      }
    }
    const { columns, imageThumbnailHeight, imageThumbnailStyles } = getImageThumbnailInfo()

    const _keyExtractor = (item, index) => {
      const id = item?.id
      return safeKeyExtractor('gridview_item', index, id)
    }

    const _getItemLayout = (_: any, index: number) => {
      return {
        length: imageThumbnailHeight,
        offset: imageThumbnailHeight * index,
        index
      }
    }

    const _renderItem = ({ item }: { item: Podcast }) => {
      const id = item?.id
      const newContentCount = newEpisodesCount?.[id]?.count || 0
      return (
        <PressableWithOpacity
          onPress={() => {
            this.props.onItemSelected?.(item)
          }}
          onLongPress={() => this.props.onLongPressItem?.(item)}
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
    }

    return (
      <FlatList
        {...this.props}
        ItemSeparatorComponent={() => <></>}
        testID='grid_view'
        key={isTabletLandscape ? 'landscape' : 'portrait'}
        data={this.props.data}
        onEndReachedThreshold={0.3}
        ListHeaderComponent={!!stickyHeader ? null : ListHeaderComponent}
        refreshing={this.props.isRefreshing}
        getItemLayout={_getItemLayout}
        renderItem={_renderItem}
        numColumns={columns}
        keyExtractor={_keyExtractor}
        style={shouldShowResults ? [styles.listRows] : styles.noResultsView}
        {...PV.FlatList.optimizationPropsFaster}
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
    alignItems: 'center'
  },
  imageThumbnailTabletLandscape: {
    justifyContent: 'center',
    alignItems: 'center'
  },
  imageThumbnailTabletPortrait: {
    justifyContent: 'center',
    alignItems: 'center'
  },
  cellbutton: {
    flex: 0,
    flexDirection: 'column',
    margin: 1
  },
  listRows: {
    paddingVertical: 10
  }
})
