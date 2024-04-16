import React from "react";
import {createStackNavigator} from "@react-navigation/stack";
import SettingScreen from "../screens/SettingScreen";
import AboutScreen from "../screens/AboutScreen";


const Stack = createStackNavigator();

function SettingScreens() {
  return (
    <Stack.Navigator screenOptions={{headerShown: false}}>
      <Stack.Screen name="SettingScreen" component={SettingScreen}/>
      <Stack.Screen name="AboutScreen" component={AboutScreen}/>
    </Stack.Navigator>
  );
}

export default SettingScreens;
