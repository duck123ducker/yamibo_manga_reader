import React from "react";
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import SettingScreen from "../screens/SettingScreen";
import HomeScreen from "../screens/HomeScreen";

const Tab = createBottomTabNavigator();

function TabScreens() {
    return (
        <Tab.Navigator screenOptions={{ headerShown: false }}>
            <Tab.Screen name="漫画" component={HomeScreen} />
            <Tab.Screen name="我的" component={SettingScreen} />
        </Tab.Navigator>
    );
}

export default TabScreens;
