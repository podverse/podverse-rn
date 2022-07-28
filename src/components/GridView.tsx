import React from 'react'
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
    return (
      <FlatList
        {...this.props}
        ItemSeparatorComponent={null}
        testID='grid_view'
        data={this.props.data}
        onEndReachedThreshold={0.3}
        refreshing={this.props.isRefreshing}
        renderItem={({ item }) => (
          <PressableWithOpacity
            onPress={() => {
              this.props.onItemSelected?.(item)
            }}
            style={styles.cellbutton}>
            <FastImage 
              styles={styles.imageThumbnail} 
              source={item?.shrunkImageUrl || item?.imageUrl} 
              resizeMode="cover"
            />
          </PressableWithOpacity>
        )}
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
    height: Dimensions.get('screen').width / 3,
    width: Dimensions.get('screen').width / 3
  },
  cellbutton: {
    flex: 0,
    flexDirection: 'column',
    margin: 1
  }
})
