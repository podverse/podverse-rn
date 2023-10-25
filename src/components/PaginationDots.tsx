import React from 'react';
import { View, StyleSheet } from 'react-native';
import { PV } from '../resources';

interface DottedPaginationProps {
  totalDots: number | undefined;
  currentIndex: number;
}

const DottedPagination: React.FC<DottedPaginationProps> = ({ totalDots = 0, currentIndex }) => {
  const dots = Array.from({ length: totalDots }).map((_, index) => (
    <View
      key={index}
      style={[
        styles.dot,
        index === currentIndex && styles.activeDot,
      ]}
    />
  ));

  return (
    <View style={styles.container}>
      {dots}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 4
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    margin: 5,
    backgroundColor: PV.Colors.grayLighterTransparent,
  },
  activeDot: {
    backgroundColor: PV.Colors.white,
  },
});

export default DottedPagination;
