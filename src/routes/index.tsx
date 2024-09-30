import React from "react";
import {createDrawerNavigator} from '@react-navigation/drawer';
import StackScreens from "./StackScreens";
import CustomDrawer from "../components/CustomDrawer";
import {px2dp} from "../utils";
import BBSNativeWebviewScreen from "../screens/BBSNativeWebviewScreen";
import NewSiteNativeWebviewScreen from "../screens/NewSiteNativeWebviewScreen";
import BBSCheckinNativeWebviewScreen from "../screens/BBSCheckinNativeWebviewScreen";
import SettingScreens from "./SettingScreens";


const Drawer = createDrawerNavigator();
const AppNavigation: React.FC = () => {
  return (
    <Drawer.Navigator
      defaultStatus='closed'
      drawerContent={props => <CustomDrawer {...props}/>}
      screenOptions={{
        headerShown: false,
        drawerStyle: {width: px2dp(400)},
        drawerLabelStyle: {margin: 0, padding: 0},
        drawerActiveTintColor: 'black',
        drawerActiveBackgroundColor: 'rgb(255,228,155)',
      }}
    >
      <Drawer.Screen
        name="主页"
        component={StackScreens}
      />
      <Drawer.Screen
        name="签到"
        component={BBSCheckinNativeWebviewScreen}
        options={{ unmountOnBlur: true }}
      />
      <Drawer.Screen
        name="论坛"
        component={BBSNativeWebviewScreen}
        options={{
          unmountOnBlur: true,
          headerShown: true,
          headerStyle: {backgroundColor: '#551200', height: px2dp(80)},
          headerStatusBarHeight: 0,
          headerTintColor: '#fff',
          headerTitleStyle: {fontWeight: 'normal'},
          headerTitle: '论坛'
        }}
      />
      <Drawer.Screen
        name="新站"
        component={NewSiteNativeWebviewScreen}
        options={{
          unmountOnBlur: true,
          headerShown: true,
          headerStyle: {backgroundColor: '#551200', height: px2dp(80)},
          headerStatusBarHeight: 0,
          headerTintColor: '#fff',
          headerTitleStyle: {fontWeight: 'normal'},
          headerTitle: '新站'
        }}
      />
      <Drawer.Screen
        name="设置"
        component={SettingScreens}
        options={{ unmountOnBlur: true, headerStatusBarHeight: 0 }}
      />
      {/*<Drawer.Screen name="下载" component={DownloadManagerScreen} />*/}
    </Drawer.Navigator>
  );
}

export default AppNavigation;
