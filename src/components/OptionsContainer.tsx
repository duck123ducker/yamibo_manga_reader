import React from "react";
import {Options} from "../constants/types";
import {StyleSheet, TouchableOpacity, View} from "react-native";
import MyText from "./MyText";
import {px2dp} from "../utils";

interface PropsType {
  options: Options
}

const OptionsContainer: React.FC<PropsType> = (props) => {
  const { options } = props;
  return <>
    {
      options.map(option => (
        <View key={option.description}>
          <TouchableOpacity
            style={[styles.option]}
            onPress={() => {
              option.hasOwnProperty('operation') ? option.operation() : null
            }}>
            <MyText style={styles.description}>{option.description}</MyText>
            {option.hasOwnProperty('info') ? <MyText style={styles.info}>{option.info}</MyText> : null}
          </TouchableOpacity>
          <View style={styles.line}/>
        </View>
      ))
    }
  </>
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  content: {
    backgroundColor: '#f8f8e0'
  },
  option: {
    paddingTop: px2dp(30),
    paddingBottom: px2dp(30),
    paddingLeft: px2dp(30),
    paddingRight: px2dp(30)
  },
  description: {
    fontSize: 16
  },
  info: {
    fontSize: 14,
    color: '#454545'
  },
  line: {
    height: px2dp(1),
    width: '100%',
    backgroundColor: '#d0d0d0'
  }
})

export default OptionsContainer;
