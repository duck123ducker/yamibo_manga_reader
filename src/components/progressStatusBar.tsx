import React, {useEffect, useState} from "react";
import MyText from "./MyText";
import {useSnapshot} from "valtio";
import {appStore} from "../store/appStore";
import {View} from "react-native";
import * as Battery from 'expo-battery';
import {useBatteryLevel} from "expo-battery";

const ProgressStatusBar: React.FC<{totalPage: number}> = ({totalPage}) => {
    const [batteryLevel, setBatteryLevel] = useState(useBatteryLevel());
    const formatTime = (timestamp:number) => {
        const currentDate = new Date(timestamp);
        const hours = currentDate.getHours().toString().padStart(2, '0');
        const minutes = currentDate.getMinutes().toString().padStart(2, '0');
        return `${hours}:${minutes}`;
    }
    const [currentTime, setCurrentTime] = useState(formatTime(Date.now()));
    useEffect(() => {
        const intervalID = setInterval(() => {
            setCurrentTime(formatTime(Date.now()));
        }, 1000);
        const batteryLevelSubscription = Battery.addBatteryLevelListener(({ batteryLevel }) => {
            setBatteryLevel(batteryLevel);
        });
        return () => {
            clearInterval(intervalID)
            batteryLevelSubscription.remove();
        };
    }, []);
    const {readingPage} = useSnapshot(appStore)
    const decimalToPercent = (decimal) => {
        const percent = decimal * 100;
        const roundedPercent = Math.round(percent);
        return roundedPercent + '%';
    }
    return (
        <View style={{flexDirection: 'row', backgroundColor: 'rgba(0,0,0,0.52)', paddingLeft: 12, paddingBottom: 2}}>
            <MyText style={{color: 'white', fontSize: 12}}>{readingPage}/{totalPage}    {batteryLevel===-1?'':decimalToPercent(batteryLevel) + '    '}{currentTime}    </MyText>
        </View>
    )
}

export default ProgressStatusBar
