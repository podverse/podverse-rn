import React, { Component } from 'react';
import { View, StyleSheet, PanResponder, Animated, Dimensions } from 'react-native';
import DottedPagination from './PaginationDots';

interface SwipeableProps {
  children: React.ReactNode[];
}

interface SwipeableState {
  currentIndex: number;
  pan: Animated.ValueXY;
  transitioningIndex: number | null;
}

class Swipeable extends Component<SwipeableProps, SwipeableState> {
  panResponder: any;

  constructor(props: SwipeableProps) {
    super(props);

    this.state = {
      currentIndex: 1,
      pan: new Animated.ValueXY(),
      transitioningIndex: null
    };

    this.panResponder = PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gesture) => {
        if (
          (gesture.dx > 0 && this.state.currentIndex === 0) ||
          (gesture.dx < 0 && this.state.currentIndex === this.props.children.length - 1)
        ) {
          return;
        }

        Animated.event([null, { dx: this.state.pan.x, dy: this.state.pan.y }], {
          useNativeDriver: false,
        })(_, gesture);
      },
      onPanResponderRelease: (_, gesture) => {
        const screenWidth = Dimensions.get('window').width;
        if (Math.abs(gesture.dx) > screenWidth * 0.2) {
          const isPanForward = gesture.dx < 0
          const newIndex = isPanForward ? this.state.currentIndex + 1 : this.state.currentIndex - 1;
          if (newIndex >= 0 && newIndex < this.props.children.length) {
            this.setState({ currentIndex: newIndex, transitioningIndex: this.state.currentIndex }, () => {
              const animateToXValue = isPanForward ? -screenWidth : screenWidth
              Animated.timing(this.state.pan, {
                toValue: { x: animateToXValue, y: 0 },
                duration: 150,
                useNativeDriver: true,
              }).start(() => {
                this.setState({ transitioningIndex: null }, () => {
                  Animated.event([null, { dx: this.state.pan.x, dy: this.state.pan.y }], {
                    useNativeDriver: false,
                  })(_, gesture)
                })
              });
            });
          } else {
            Animated.spring(this.state.pan, {
              toValue: { x: 0, y: 0 },
              useNativeDriver: true,
            }).start();
          }
        } else {
          Animated.spring(this.state.pan, {
            toValue: { x: 0, y: 0 },
            useNativeDriver: true,
          }).start();
        }
      },
    });
  }

  render() {
    const { currentIndex, pan, transitioningIndex } = this.state;
    const renderedIndex = transitioningIndex === null ? currentIndex : transitioningIndex

    const children = React.Children.map(this.props.children, (child, index) => {
      if (index === renderedIndex) {
        return (
          <Animated.View
            style={[
              styles.swipeableContainer,
              {
                transform: [{ translateX: pan.x }],
              },
            ]}
            {...this.panResponder.panHandlers}
          >
            {child}
          </Animated.View>
        );
      } else if (index === renderedIndex + 1 && renderedIndex < this.props.children.length - 1) {
        return (
          <Animated.View
            style={[
              styles.swipeableContainer,
              {
                transform: [{ translateX: pan.x }],
                position: 'absolute',
                left: '100%',
              },
            ]}
          >
            {child}
          </Animated.View>
        );
      } else if (index === renderedIndex - 1 && renderedIndex > 0) {
        return (
          <Animated.View
            style={[
              styles.swipeableContainer,
              {
                transform: [{ translateX: pan.x }],
                position: 'absolute',
                left: '-100%',
              },
            ]}
          >
            {child}
          </Animated.View>
        );
      } else {
        return null;
      }
    });

    return (
    <View style={styles.view}>
      <View style={styles.container}>
        {children}
      </View>
      <DottedPagination currentIndex={this.state.currentIndex} totalDots={this.props.children?.length}/>
    </View>);
  }
}

const styles = StyleSheet.create({
  view: {
    flex: 1,
    width: '100%',
    alignItems:"center"
  },
  container: {
    flex: 1,
    flexDirection: 'row',
    width: '100%',
    overflow: 'hidden',
  },
  swipeableContainer: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
});

export default Swipeable;
