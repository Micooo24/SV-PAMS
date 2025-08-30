// 1. Core React
import { useState, useEffect, useRef } from 'react'


// 2. React Native
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, ActivityIndicator, StatusBar, Dimensions, Animated, BackHandler  } from 'react-native'



const Home = () =>{
    return (
        <View style={styles.container}>
       <Text>Welcome to Home!</Text>
        <StatusBar barStyle="light-content" />
        </View>
    )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default Home;