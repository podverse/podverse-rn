import React from 'react'
import { StyleSheet } from 'react-native'
import DraggableFlatList from 'react-native-draggable-flatlist'
import { safeKeyExtractor } from '../lib/utility'

type Props = {
  data: any[]
  // If a screen could have rows with the same ids (like the QueueScreen),
  // then keyUseIndex will avoid "non-unique keys" warnings.
  keyUseIndex?: boolean
  isEditing?: boolean
  onDragEnd: any
  renderItem: any
}

export class PVSortableList extends React.Component<Props> {
  render() {
    const { data, isEditing, keyUseIndex, onDragEnd, renderItem } = this.props

    return (
      <DraggableFlatList
        data={data}
        keyExtractor={(item: any, index: number) => {
          const safeKey = safeKeyExtractor(
            'sortable_list',
            index,
            item?.clipId || item?.episodeId || item?.id,
            keyUseIndex
          )
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
