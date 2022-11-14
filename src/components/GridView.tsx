import { Podcast } from 'podverse-shared'
import React from 'reactn'
import { StyleSheet, FlatList, Dimensions } from 'react-native'
import { FastImage, PressableWithOpacity } from './'

type Props = {
  data?: [any]
  isRefreshing: boolean
  onItemSelected: any
  ListFooterComponent: any
}

export class GridView extends React.PureComponent<Props, any> {
  render() {
    const { deviceType, newEpisodesCount } = this.global
    const shouldShowResults = this.props.data && this.props.data.length > 0
    const imageThumbnailStyle = deviceType === 'tablet'
      ? styles.imageThumbnailTablet : styles.imageThumbnailMobile
    const columns = deviceType === 'tablet' ? 4 : 3
    const isTabletGridView = deviceType === 'tablet'

    return (
      <FlatList
        {...this.props}
        ItemSeparatorComponent={null}
        testID='grid_view'
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
                isTabletGridView={isTabletGridView}
                newContentCount={newContentCount}
                placeholderLabel={item?.title || ''}
                resizeMode='cover'
                showLiveIndicator={item?.latestLiveItemStatus === 'live'}
                source={item?.shrunkImageUrl || item?.imageUrl || ''}
                styles={imageThumbnailStyle}
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
    // subtract 2 so the device doesn't round up to a size that
    // cuts off the end of the last item in the grid.
    height: Dimensions.get('screen').width / 3 - 2,
    width: Dimensions.get('screen').width / 3 - 2
  },
  imageThumbnailTablet: {
    justifyContent: 'center',
    alignItems: 'center',
    // subtract 2 so the device doesn't round up to a size that
    // cuts off the end of the last item in the grid.
    height: Dimensions.get('screen').width / 4 - 2,
    width: Dimensions.get('screen').width / 4 - 2
  },
  cellbutton: {
    flex: 0,
    flexDirection: 'column',
    margin: 1
  }
})
