import React from 'react'
import { FlatList } from 'react-native-gesture-handler'
import { useGlobal } from 'reactn'
import { PV } from '../resources'
import { GlobalTheme } from '../resources/Interfaces'
import { ActivityIndicator, Text, View } from './'

type Props = {
  data?: any
  endOfResultsReached?: boolean
  isLoadingMore?: boolean
  ItemSeparatorComponent?: any
  onEndReached: any
  onEndReachedThreshold?: number
  renderItem: any
}

export const PVFlatList = (props: Props) => {
  const [globalTheme] = useGlobal<GlobalTheme>('globalTheme')
  const { data, endOfResultsReached, isLoadingMore, ItemSeparatorComponent, onEndReached,
    onEndReachedThreshold = 0.8, renderItem } = props

  return (
    <View style={styles.view}>
      <FlatList
        {...props}
        data={data}
        ItemSeparatorComponent={ItemSeparatorComponent}
        keyExtractor={(item) => item.id}
        onEndReached={onEndReached}
        onEndReachedThreshold={onEndReachedThreshold}
        renderItem={(x) => {
          const isLastMsgCell = x.item.id === PV.FlatList.endOfResultsKey || x.item.id === PV.FlatList.isLoadingMoreKey
          if (isLastMsgCell) {
            if (endOfResultsReached && x.item.id === PV.FlatList.endOfResultsKey) {
              return <Text style={[styles.lastCell, globalTheme.text]}>End of results</Text>
            } else if (isLoadingMore && x.item.id === PV.FlatList.isLoadingMoreKey) {
              return <ActivityIndicator styles={styles.lastCell} />
            }
          } else {
            return renderItem(x)
          }
        }}
        style={[globalTheme.flatList]} />
    </View>
  )
}

const styles = {
  lastCell: {
    flex: 0,
    fontSize: PV.Fonts.sizes.md,
    height: 72,
    justifyContent: 'center',
    lineHeight: 72,
    textAlign: 'center'
  },
  view: {
    flex: 1
  }
}
