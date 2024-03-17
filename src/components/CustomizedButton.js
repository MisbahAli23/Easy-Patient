import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';

const CustomButton = ({ buttonColor, borderColor ,textColor, text, onPress }) => {
  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.button, { backgroundColor: buttonColor,borderColor:borderColor }]}
        onPress={onPress}
      >
        <Text style={[styles.text, { color: textColor }]}>{text}</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderWidth:1,
    width: '80%',
    elevation: 3,
    borderRadius: 30,
  },
  text: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default CustomButton;