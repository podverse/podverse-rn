import React, { Component } from 'react';
import { View, StyleSheet, PanResponder, Animated, Dimensions, Easing } from 'react-native';
import { PV } from '../resources';
import PVEventEmitter from '../services/eventEmitter'
import DottedPagination from './PaginationDots';

interface SwipeableProps {
  chaptersIndex?: number | null
  children: React.ReactNode[];
  totalChildren: number // needed for pre-loading PaginationDots
  transcriptsIndex?: number | null
}

interface SwipeableState {
  currentIndex: number;
  pan: Animated.ValueXY;
  transitioningIndex: number | null;
  panEnabled: boolean;
}

class Swipeable extends Component<SwipeableProps, SwipeableState> {
  panResponder: any;

  constructor(props: SwipeableProps) {
    super(props);

    this.state = {
      currentIndex: 0,
      pan: new Animated.ValueXY(),
      transitioningIndex: null,
      panEnabled: true,
    };

    this.panResponder = PanResponder.create({
      onMoveShouldSetPanResponder: (_, gesture) => {
        return Math.abs(gesture.dx) > Math.abs(gesture.dy) && this.state.panEnabled;
      },
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
      onPanResponderEnd: (_, gesture) => {
        const { chaptersIndex, transcriptsIndex } = this.props
        const screenWidth = Dimensions.get('window').width;
        if (Math.abs(gesture.dx) > screenWidth * 0.10) {
          const isPanForward = gesture.dx < 0
          const newIndex = isPanForward ? this.state.currentIndex + 1 : this.state.currentIndex - 1;
          if (newIndex >= 0 && newIndex < this.props.children.length) {
            this.setState({ 
              currentIndex: newIndex, 
              transitioningIndex: this.state.currentIndex, 
              panEnabled: false 
            })
            const animateToXValue = isPanForward ? -screenWidth : screenWidth
            Animated.timing(this.state.pan, {
              toValue: { x: animateToXValue, y: 0 },
              duration: 150,
              useNativeDriver: false,
              easing: Easing.linear
            }).start(() => {
              this.setState({ transitioningIndex: null, panEnabled:true }, () => {
                Animated.event([null, { dx: this.state.pan.x, dy: this.state.pan.y }], {
                  useNativeDriver: false,
                })(_, gesture)
              })
            });
          } else {
            Animated.spring(this.state.pan, {
              toValue: { x: 0, y: 0 },
              useNativeDriver: false,
            }).start(() => {
              this.setState({ panEnabled: true });
            });
          }

          setTimeout(() => {
            if (newIndex === chaptersIndex) {
              PVEventEmitter.emit(PV.Events.MPC_TRANSCRIPTS_IN_VIEW, false)
              PVEventEmitter.emit(PV.Events.MPC_CHAPTERS_IN_VIEW, true)
            } else if (newIndex === transcriptsIndex) {
              PVEventEmitter.emit(PV.Events.MPC_CHAPTERS_IN_VIEW, false)
              PVEventEmitter.emit(PV.Events.MPC_TRANSCRIPTS_IN_VIEW, true)
            } else {
              PVEventEmitter.emit(PV.Events.MPC_CHAPTERS_IN_VIEW, false)
              PVEventEmitter.emit(PV.Events.MPC_TRANSCRIPTS_IN_VIEW, false)
            }
          }, 200)
        } else {
          Animated.spring(this.state.pan, {
            toValue: { x: 0, y: 0 },
            useNativeDriver: false,
          }).start(() => {
            this.setState({ panEnabled: true });
          });
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
      } else if (index > renderedIndex && renderedIndex < this.props.children.length - 1) {
        const left = `${(index - renderedIndex) * 100}%`
        return (
          <Animated.View
            style={[
              styles.swipeableContainer,
              {
                transform: [{ translateX: pan.x }],
                position: 'absolute',
                left,
              },
            ]}
          >
            {child}
          </Animated.View>
        );
      } else if (index < renderedIndex) {
        const left = `${(index - renderedIndex) * 100}%`
        return (
          <Animated.View
            style={[
              styles.swipeableContainer,
              {
                transform: [{ translateX: pan.x }],
                position: 'absolute',
                left,
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

    /*
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
    */

    return (
    <View style={styles.view}>
      <View style={styles.container}>
        {children}
      </View>
      <DottedPagination currentIndex={this.state.currentIndex} totalDots={this.props.totalChildren}/>
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
