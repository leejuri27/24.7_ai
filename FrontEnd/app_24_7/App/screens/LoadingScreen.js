import React, {useState} from 'react'
import {
  View,
  Text,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const LoadingScreen = ({navigation}) => {
  // const [id, setId] = useState();

  // AsyncStorage.getItem('userEmail', (err, res) => {
  //   console.log('LoadingScreen', res)
  //   setId(res)
  // });
  // // console.log('loadingScreen', this.id)

  // if (this.id == 'undefined') {
  //   navigation.navigate('Login')
  // } else {
  //   navigation.navigate('LoadingScreen2')
  // }
  return (
    <View>
      <Text style={{ fontSize: 40, alignSelf: 'center', justifyContent: 'center'}}>로딩화면 ..</Text>
    </View>
  )
}

export default LoadingScreen;