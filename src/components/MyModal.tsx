import React from 'react';
import {Modal, View, TouchableOpacity, StyleSheet} from 'react-native';
import {px2dp} from "../utils";
import MyText from "./MyText";

interface Button {
  description: string;
  operation: () => void;
}

interface MyModalProps {
  visible: boolean;
  buttons: Button[];
  children: React.ReactNode;
  buttonShow?: boolean;
}

const MyModal: React.FC<MyModalProps> = ({visible, buttons, children, buttonShow = true}) => {
  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={() => {
      }}
    >
      <View style={styles.mask}>
        <View style={styles.modalContainer}>
          {children}
          {buttonShow &&
            <View style={styles.modalButtons}>
              {buttons.map(item => (
                <TouchableOpacity key={item.description} onPress={item.operation}>
                  <MyText style={styles.modalBtn}>{item.description}</MyText>
                </TouchableOpacity>
              ))}
            </View>
          }
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  mask: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  modalContainer: {
    backgroundColor: '#f8f8e0',
    width: px2dp(600),
    padding: px2dp(20)
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between"
  },
  modalBtn: {
    fontWeight: "bold"
  }
})

export default MyModal;
