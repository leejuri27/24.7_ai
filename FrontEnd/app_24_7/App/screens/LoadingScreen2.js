import React from 'react';
import {View, ActivityIndicator, ImageBackground, StyleSheet, Image, Dimensions,} from 'react-native';


const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;

const LoadingScreen2 = ({navigation}) => {
  return (
    <ImageBackground
      source={require('../assets/image/backColor2.png')}
      style={styles.container}>
      <View>
        <Image
          style={styles.img}
          source={require('../assets/image/logo3.png')}
        />
      </View>
      <ActivityIndicator
        size={'large'}
        color={'#7254F5'}
        style={{marginTop: 30}}
      />
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    width: windowWidth,
    height: windowHeight,
  },
  img: {
    width: 160,
    height: 90,
    marginTop: -40,
    marginBottom: 30,
  },
});

export default LoadingScreen2;
