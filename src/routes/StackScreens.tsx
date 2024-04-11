import React from "react";
import {createStackNavigator} from "@react-navigation/stack";
import MangaDetailScreen from "../screens/MangaDetailScreen";
import MangaReaderScreen from "../screens/MangaReaderScreen";
import HomeScreen from "../screens/HomeScreen";
import MangaNativeWebviewScreen from "../screens/MangaNativeWebviewScreen";


const Stack = createStackNavigator();

function StackScreens() {
  return (
    <Stack.Navigator screenOptions={{headerShown: false}}>
      <Stack.Screen name="HomeScreen" component={HomeScreen}/>
      <Stack.Screen name="MangaDetail" component={MangaDetailScreen}/>
      <Stack.Screen name="MangaReader" component={MangaReaderScreen}/>
      <Stack.Screen name="MangaNativeWebview" component={MangaNativeWebviewScreen}/>
    </Stack.Navigator>
  );
}

export default StackScreens;
