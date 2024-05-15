import React from 'react';
import {View, StyleSheet} from 'react-native';
import {px2dp} from "../utils";
import MyText from "./MyText";
import * as Linking from "expo-linking";
import MyModal from "./MyModal";

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
    <MyModal buttons={buttons} visible={visible}><View style={styles.title}>
      <MyText style={styles.titleText}>
        {title}
      </MyText>
    </View>
      <View style={styles.msg}>
        <MyText style={styles.msgText}>
          {message.info}
        </MyText>
      </View>
    </MyModal>
  );
}

const styles = StyleSheet.create({
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
  msgText: {}
});

export default UpdateModal;
