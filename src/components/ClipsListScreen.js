import React from "react"
import { View, Text, StyleSheet } from "react-native"

export class ClipsListScreen extends React.Component {
  render() {
    return (
      <View style={styles.view}>
        <Text>Clips List</Text>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  view: {
    flex:1,
    justifyContent: "center",
    alignItems: "center"
  }
})
