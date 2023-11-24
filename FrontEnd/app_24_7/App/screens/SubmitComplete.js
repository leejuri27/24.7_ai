import React, { useEffect } from 'react'
import {
  View,
  Dimensions,
  Text,
  Image,
} from 'react-native';

const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;

const SubmitComplete = ({navigation}) => {
  useEffect(() => {
    setTimeout(() => {
      navigation.navigate('Main')
    }, 1000)
  })

  return (
    <View style={{marginTop: windowHeight * 0.4}}>
      <Image source={require('../assets/image/submit.png')}
        style={{width:100, height:100, alignSelf: 'center'}}
      />
      <Text style={{marginTop: 20, textAlign:'center', fontSize: 35, fontFamily: 'Pretendard-ExtraLight'}}>제출 완료!</Text>
    </View>
  )
}

export default SubmitComplete;