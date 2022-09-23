import React from 'react'
import { StyleSheet } from 'react-native'
import DraggableFlatList from 'react-native-draggable-flatlist'
import { safeKeyExtractor } from '../lib/utility'

type Props = {
  data: any[]
  isEditing?: boolean
  onDragEnd: any
  renderItem: any
}

export class PVSortableList extends React.Component<Props> {
  render() {
    const { data, isEditing, onDragEnd, renderItem } = this.props

    return (
      <DraggableFlatList
        data={data}
        keyExtractor={(item: any, index: number) => {
          const safeKey = safeKeyExtractor('sortable_list', index, item?.clipId || item?.episodeId || item?.id)
          return `draggable-item-${safeKey}-${isEditing ? 'isEditing' : 'isNotEditing'}`
        }}
        onDragEnd={onDragEnd}
        renderItem={renderItem}
        containerStyle={styles.list}
      />
    )
  }
}

const styles = StyleSheet.create({
  list: {
    flex: 1
  }
})
