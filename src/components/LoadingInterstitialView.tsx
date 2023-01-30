import React, { useState, useEffect, useRef } from "react";
import { StyleSheet, Animated, Easing, Image, View } from "react-native";
import { PV } from '../resources';

const INTERSTITIAL_LOADING_SECONDS = 6

export const LoadingInterstitialView = () => {
  const bounceHeight = 20
  const dots = 4
  const colors = [PV.Colors.brandBlueDarker, PV.Colors.blue, PV.Colors.skyDark, PV.Colors.brandBlueLight];
  const [animations, setAnimations] = useState<Animated.Value[]>([]);
  const [reverse, setReverse] = useState<boolean>(false);
  const [showScreen, setShowScreen] = useState<boolean>(true);

  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const dotAnimations: Animated.Value[] = [];
    for (let i = 0; i < dots; i++) {
      dotAnimations.push(new Animated.Value(0));
    }
    setAnimations(dotAnimations);
    setTimeout(() => setShowScreen(false), INTERSTITIAL_LOADING_SECONDS * 1000)
  }, []);

  useEffect(() => {
    if (animations.length === 0) return;
    loadingAnimation(animations, reverse);
    appearAnimation();
  }, [animations]);

  function appearAnimation() {
    Animated.timing(opacity, {
      toValue: 1,
      easing: Easing.ease,
      useNativeDriver: true,
    }).start();
  }

  function floatAnimation(node: Animated.Value, reverseY:boolean, delay:number) {
    const floatSequence = Animated.sequence([
      Animated.timing(node, {
        toValue: reverseY ? bounceHeight : -bounceHeight,
        easing: Easing.bezier(0.41, -0.15, 0.56, 1.21),
        delay,
        useNativeDriver: true,
      }),
      Animated.timing(node, {
        toValue: reverseY ? -bounceHeight : bounceHeight,
        easing: Easing.bezier(0.41, -0.15, 0.56, 1.21),
        delay,
        useNativeDriver: true,
      }),
      Animated.timing(node, {
        toValue: 0,
        delay,
        useNativeDriver: true,
      }),
    ]);
    return floatSequence;
  }

  function loadingAnimation(nodes:Animated.Value[], reverseY:boolean) {
    Animated.parallel(
      nodes.map((node, index) => floatAnimation(node, reverseY, index * 100))
    ).start(() => {
      setReverse(!reverse);
    });
  }

  useEffect(() => {
    if (animations.length === 0) return;
    loadingAnimation(animations, reverse);
  }, [reverse, animations]);

  if(!showScreen) {
    return null
  }

  return (
        <View style={styles.view}>
            <Image source={PV.Images.BANNER} resizeMode='contain' />      
            <Animated.View style={[styles.loading, { opacity }]}>
                {animations.map((animation, index) =>
                    <Animated.View
                        key={`loading-anim-${index}`}
                        style={[
                        {
                            width: 20,
                            height: 20,
                            borderRadius: 10,
                        },
                        { backgroundColor: colors[index] || PV.Colors.brandBlueDarker },
                        { transform: [{ translateY: animation }] },
                        ]}
                    />
                )}
            </Animated.View>
        </View>
  );
}

const styles = StyleSheet.create({
  view: { 
    ...StyleSheet.absoluteFill,
    backgroundColor: PV.Colors.ink, 
    flex: 1, 
    alignItems: 'center', 
    justifyContent: 'center' 
  },
  loading: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    marginTop: 40,
    justifyContent: "space-between",
  },
});