import React from 'react';
import {Modal, View, StyleSheet, TouchableOpacity} from 'react-native';
import {px2dp} from "../utils";
import MyText from "./MyText";
import * as Linking from "expo-linking";

interface UpdateModalProps {
  visible: boolean;
  title: string;
  message: { version: string, info: string, url: string };
  close: Function;
}

const UpdateModal: React.FC<UpdateModalProps> = ({visible, title, message, close}) => {
  const buttons = [
    {
      description: "前往更新",
      operation: () => {
        Linking.openURL(message.url)
      }
    },
    {
      description: "取消",
      operation: close
    }
  ]
  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={() => {
      }}
    >
      <View style={styles.mask}>
        <View style={styles.container}>
          <View style={styles.title}>
            <MyText style={styles.titleText}>
              {title}
            </MyText>
          </View>
          <View style={styles.msg}>
            <MyText style={styles.msgText}>
              {message.info}
            </MyText>
          </View>
          <View style={styles.buttons}>
            {
              buttons.map((item, index) => (
                <TouchableOpacity key={index} onPress={item.operation}>
                  <MyText style={styles.btn}>{item.description}</MyText>
                </TouchableOpacity>
              ))
            }
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  mask: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  container: {
    backgroundColor: '#f8f8e0',
    width: px2dp(600),
    padding: px2dp(20)
  },
  title: {
    justifyContent: "center",
    alignItems: 'center',
    marginBottom: px2dp(10)
  },
  titleText: {
    fontSize: 16,
    fontWeight: "bold"
  },
  msg: {
    marginBottom: px2dp(20)
  },
  msgText: {},
  buttons: {
    flexDirection: "row",
    justifyContent: "space-between"
  },
  btn: {
    fontWeight: "bold"
  }
});

export default UpdateModal;
