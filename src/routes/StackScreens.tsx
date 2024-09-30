import React from "react";
import {createStackNavigator} from "@react-navigation/stack";
import MangaDetailScreen from "../screens/MangaDetailScreen";
import MangaReaderScreen from "../screens/MangaReaderScreen";
import HomeScreen from "../screens/HomeScreen";
import MangaNativeWebviewScreen from "../screens/MangaNativeWebviewScreen";
import MangaDetailLoadingScreen from "../screens/MangaDetailLoadingScreen";
import MenuScreen from "../screens/MenuScreen";
import CommentScreen from "../screens/CommentScreen";
import {px2dp} from "../utils";
import ThreadNativeWebviewScreen from "../screens/ThreadNativeWebviewScreen";


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
      <Stack.Screen name="ThreadNativeWebview" component={ThreadNativeWebviewScreen}/>
      <Stack.Screen
        name="Comment"
        component={CommentScreen}
        options={{
          headerShown: true,
          headerStyle: {backgroundColor: '#551200', height: px2dp(80)},
          headerStatusBarHeight: 0,
          headerTintColor: '#fff',
          headerTitleStyle: {fontWeight: 'normal'},
          headerTitle: '评论区'
        }}
      />
    </Stack.Navigator>
  );
}

export default StackScreens;
