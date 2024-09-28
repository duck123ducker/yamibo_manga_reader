import React from "react";
import {createStackNavigator} from "@react-navigation/stack";
import MangaDetailScreen from "../screens/MangaDetailScreen";
import MangaReaderScreen from "../screens/MangaReaderScreen";
import HomeScreen from "../screens/HomeScreen";
import MangaNativeWebviewScreen from "../screens/MangaNativeWebviewScreen";
import MangaDetailLoadingScreen from "../screens/MangaDetailLoadingScreen";
import MenuScreen from "../screens/MenuScreen";
import CommentScreen from "../screens/CommentScreen";


const Stack = createStackNavigator();

function StackScreens() {
  return (
    <Stack.Navigator screenOptions={{headerShown: false}}>
      <Stack.Screen name="HomeScreen" component={HomeScreen} initialParams={{routeMode: 'normal'}}/>
      <Stack.Screen name="MangaDetailLoading" component={MangaDetailLoadingScreen}/>
      <Stack.Screen name="MangaDetail" component={MangaDetailScreen}/>
      <Stack.Screen name="MangaReader" component={MangaReaderScreen}/>
      <Stack.Screen name="MangaNativeWebview" component={MangaNativeWebviewScreen}/>
      <Stack.Screen name="Menu" component={MenuScreen}/>
      <Stack.Screen name="Comment" component={CommentScreen}/>
    </Stack.Navigator>
  );
}

export default StackScreens;
