import React from 'react';
import LoginComponent from '../components/Login'; // ← Import component

const Login = ({ navigation }) => {
  return <LoginComponent navigation={navigation} />;
};

export default Login;