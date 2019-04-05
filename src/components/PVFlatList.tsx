import React from 'react'
import { FlatList, RefreshControl } from 'react-native'
import { useGlobal } from 'reactn'
import { PV } from '../resources'
import { GlobalTheme } from '../resources/Interfaces'
import { ActivityIndicator, View } from './'

type Props = {
  data?: any
  extraData?: any
  searchBarText?: string
  handleFilterInputChangeText?: any
  handleFilterInputClear?: any
  handleGetItemLayout?: any
  initialScrollIndex?: number
  isLoadingMore?: boolean
  isRefreshing: boolean
  ItemSeparatorComponent?: any
  ListHeaderComponent?: any
  onEndReached: any
  onEndReachedThreshold?: number
  onRefresh?: any
  renderItem: any
}

export const PVFlatList = (props: Props) => {
  const [globalTheme] = useGlobal<GlobalTheme>('globalTheme')
  const { data, extraData, isLoadingMore, isRefreshing = false, ItemSeparatorComponent, ListHeaderComponent,
    onEndReached, onEndReachedThreshold = 0.8, onRefresh, renderItem } = props

  let flatList: FlatList<any> | null
  return (
    <View style={styles.view}>
      <FlatList
        data={data}
        extraData={extraData}
        ItemSeparatorComponent={ItemSeparatorComponent}
        keyExtractor={(item) => item.id}
        ListFooterComponent={() => {
          if (isLoadingMore) {
            return <ActivityIndicator styles={styles.lastCell} />
          }
          return null
        }}
        {...(ListHeaderComponent ? { ListHeaderComponent } : {})}
        onEndReached={onEndReached}
        onEndReachedThreshold={onEndReachedThreshold}
        onLayout={() => {
          ListHeaderComponent && flatList && flatList.scrollToOffset({ offset: PV.FlatList.searchBar.height, animated: false })
        }}
        ref={(ref) => {
          flatList = ref
        }}
        {...(onRefresh ? { refreshControl: <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} /> } : {})}
        renderItem={renderItem}
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
