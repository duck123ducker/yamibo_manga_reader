import React, { useRef, useEffect } from 'react';
import { View, Animated, StyleSheet } from 'react-native';

const Marquee = ({ width, height, color1, color2, speed }) => {
    const translateX = useRef(new Animated.Value(-width)).current;

    const moveAnimation = () => {
        Animated.timing(translateX, {
            toValue: width,
            duration: speed,
            useNativeDriver: true
        }).start(() => {
            // Reset animation
            translateX.setValue(-width);
            moveAnimation();
        });
    };

    useEffect(() => {
        moveAnimation();
    }, []);

    return (
        <View style={[styles.container, { width, height }]}>
            <Animated.View
                style={[
                    styles.block,
                    { backgroundColor: color1, transform: [{ translateX }] }
                ]}
            />
            <Animated.View
                style={[
                    styles.block,
                    { backgroundColor: color2, transform: [{ translateX: translateX.interpolate({ inputRange: [0, width], outputRange: [-width, 0] }) }] }
                ]}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        overflow: 'hidden'
    },
    block: {
        flex: 1
    }
});

export default Marquee;
