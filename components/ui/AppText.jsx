import React from 'react';
import { Text, StyleSheet } from 'react-native';

export const AppText = (props) => {
  const { style, children, ...rest } = props;

  return (
    <Text
      {...rest}
      style={[styles.defaultStyle, style]}
      allowFontScaling={false}
    >
      {children}
    </Text>
  );
};

const styles = StyleSheet.create({
  defaultStyle: {
    // Ensuring text renders consistently across Android and iOS
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
});
