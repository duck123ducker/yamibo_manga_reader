import React from 'react';
import { Text } from 'react-native';

const MyText = (props) => {
    const { allowFontScaling = false, ...rest } = props;

    return <Text {...rest} allowFontScaling={allowFontScaling} />;
};

export default MyText;
