import React from 'react';
import { Modal, View, ActivityIndicator, StyleSheet, Text } from 'react-native';
import {px2dp} from "../utils";
import MyText from "./MyText";

interface LoadingModalProps {
    visible: boolean;
    message?: string;
}

const LoadingModal: React.FC<LoadingModalProps> = ({ visible, message }) => (
    <Modal
        animationType="fade"
        transparent={true}
        visible={visible}
        onRequestClose={() => {}}
    >
        <View style={styles.modalBackground}>
            <View style={styles.activityIndicatorWrapper}>
                <ActivityIndicator animating={visible} color="#007AFF" size="large" />
                {message && <MyText style={{marginTop: px2dp(15)}}>{message}</MyText>}
            </View>
        </View>
    </Modal>
);

const styles = StyleSheet.create({
    modalBackground: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    activityIndicatorWrapper: {
        backgroundColor: 'white',
        borderRadius: 10,
        padding: 20,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
});

export default LoadingModal;
