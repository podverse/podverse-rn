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
    const { newEpisodesCount } = this.global

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
          const newContentCount = newEpisodesCount[id] || 0
          return (
            <PressableWithOpacity
              onPress={() => {
                this.props.onItemSelected?.(item)
              }}
              style={styles.cellbutton}>
              <FastImage
                newContentCount={newContentCount}
                placeholderLabel={item?.title || ''}
                resizeMode="cover"
                source={item?.shrunkImageUrl || item?.imageUrl || ''} 
                styles={styles.imageThumbnail} 
              />
            </PressableWithOpacity>
          )
        }}
        numColumns={3}
        keyExtractor={(_, index) => index.toString()}
      />
    )
  }
}

const styles = StyleSheet.create({
  imageThumbnail: {
    justifyContent: 'center',
    alignItems: 'center',
    // subtract 2 so the device doesn't round up to a size that
    // cuts off the end of the last item in the grid.
    height: Dimensions.get('screen').width / 3 - 2,
    width: Dimensions.get('screen').width / 3 - 2
  },
  cellbutton: {
    flex: 0,
    flexDirection: 'column',
    margin: 1
  }
})
