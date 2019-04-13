import React from 'react'
import { StyleSheet } from 'react-native'
import SortableList from 'react-native-sortable-list'

type Props = {
  data: any[]
  onReleaseRow: any
  renderRow: any
}

type State = {}

export class PVSortableList extends React.Component<Props, State> {
  render() {
    const { data, onReleaseRow, renderRow } = this.props

    return (
      <SortableList
        data={data}
        onReleaseRow={onReleaseRow}
        renderRow={renderRow}
        style={styles.list} />
    )
  }
}

const styles = StyleSheet.create({
  list: {
    flex: 1
  }
})
