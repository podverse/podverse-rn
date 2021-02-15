import React from 'react'
import { StyleSheet } from 'react-native'
import SortableList from 'react-native-sortable-list'

type Props = {
  data: any[]
  onPressRow?: any
  onReleaseRow: any
  renderRow: any
}

export class PVSortableList extends React.Component<Props> {
  render() {
    const { data, onPressRow, onReleaseRow, renderRow } = this.props

    return (
      <SortableList
        data={data}
        onPressRow={onPressRow}
        onReleaseRow={onReleaseRow}
        renderRow={renderRow}
        rowActivationTime={750}
        style={styles.list}
      />
    )
  }
}

const styles = StyleSheet.create({
  list: {
    flex: 1
  }
})
