import React from 'react';
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Login from "../screens/Login";
import Register from "../screens/Register";
import OTPVerification from "../screens/OTPVerification";

const Stack = createNativeStackNavigator();

function AuthNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Login" component={Login} options={{ headerShown: false }} />
      <Stack.Screen name="Register" component={Register} options={{ headerShown: false }} />
      
      <Stack.Screen 
      name="OTPVerification" 
      component={OTPVerification} 
      options={{title: 'Verify Your Email', headerShown: true}} />
    </Stack.Navigator>
  );
}

export default AuthNavigator;