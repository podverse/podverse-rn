import React from 'react'
import { RefreshControl } from 'react-native'
import { SwipeListView } from 'react-native-swipe-list-view'
import { useGlobal } from 'reactn'
import { PV } from '../resources'
import { GlobalTheme } from '../resources/Interfaces'
import { ActivityIndicator, View } from './'

type Props = {
  data?: any
  disableLeftSwipe: boolean
  extraData?: any
  handleFilterInputChangeText?: any
  handleFilterInputClear?: any
  initialScrollIndex?: number
  isLoadingMore?: boolean
  isRefreshing?: boolean
  ItemSeparatorComponent?: any
  keyExtractor: any
  ListHeaderComponent?: any
  onEndReached?: any
  onEndReachedThreshold?: number
  onRefresh?: any
  renderHiddenItem?: any
  renderItem: any
  searchBarText?: string
}

// This line silences a ref warning when a Flatlist doesn't need to be swipable.
const _renderHiddenItem = () => <View />

export const PVFlatList = (props: Props) => {
  const [globalTheme] = useGlobal<GlobalTheme>('globalTheme')
  const { data, disableLeftSwipe = true, extraData, isLoadingMore, isRefreshing = false, ItemSeparatorComponent,
    keyExtractor, ListHeaderComponent, onEndReached, onEndReachedThreshold = 0.8, onRefresh, renderHiddenItem,
    renderItem } = props

  return (
    <View style={styles.view}>
      <SwipeListView
        useFlatList={true}
        closeOnRowPress={true}
        data={data}
        disableLeftSwipe={disableLeftSwipe}
        disableRightSwipe={true}
        extraData={extraData}
        ItemSeparatorComponent={ItemSeparatorComponent}
        keyExtractor={keyExtractor ? keyExtractor : (item: any) => item.id}
        ListFooterComponent={() => {
          if (isLoadingMore) {
            return <ActivityIndicator styles={styles.lastCell} />
          }
          return null
        }}
        {...(ListHeaderComponent ? { ListHeaderComponent } : {})}
        onEndReached={onEndReached}
        onEndReachedThreshold={onEndReachedThreshold}
        {...(onRefresh ? { refreshControl: <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} /> } : {})}
        renderHiddenItem={renderHiddenItem || _renderHiddenItem}
        renderItem={renderItem}
        rightOpenValue={-72}
        style={[globalTheme.flatList]} />
    </View>
  )
}

const styles = {
  lastCell: {
    flex: 0,
    fontSize: PV.Fonts.sizes.md,
    height: PV.FlatList.lastCell.height,
    justifyContent: 'center',
    lineHeight: PV.FlatList.lastCell.height,
    textAlign: 'center'
  },
  view: {
    flex: 1
  }
}
