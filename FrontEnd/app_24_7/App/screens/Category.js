import React, {useState} from 'react';
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Dimensions,
  Text,
  Image,
  ImageBackground,
} from 'react-native';

// ---------------------------------------------------------
import Icon from 'react-native-vector-icons/EvilIcons';

const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;

const Category = ({navigation}) => {
  // 뒤로가기 (Category -> Main)
  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: ' ',
      headerLeft: ({onPress}) => (
        <TouchableOpacity
          onPress={() => {
            navigation.navigate('Main');
          }}>
          <Icon name="chevron-left" size={40} />
        </TouchableOpacity>
      ),
      contentStyle: {
        backgroundColor: '#FAFAFA',
      },
    });
  }, [navigation]);

  return (
    <View style={styles.Container}>
      <TouchableOpacity
        style={styles.touchContainer}
        onPress={() => {
          navigation.navigate('CategoryAi');
        }}>
        <ImageBackground
          source={require('../assets/image/aiCoach.png')}
          style={styles.image}>
          <View style={styles.textContainer}>
            <Text style={styles.headText}>AI 코치와 함께 !</Text>
            <Text style={styles.text}>
              AI 운동 분석 결과와{'\n'}트레이너의 피드백을 받아보세요.
            </Text>
            <View style={styles.startExercise}>
              <Text style={styles.startText}>운동하기</Text>
            </View>
          </View>
        </ImageBackground>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.touchContainer}
        onPress={() => {
          navigation.navigate('CategoryNoAi');
        }}>
        <ImageBackground
          source={require('../assets/image/humanCoach.png')}
          style={styles.image}>
          <View style={styles.textContainer}>
            <Text style={styles.headText}>부위별 운동</Text>
            <Text style={styles.text}>
              운동 후 온라인으로{'\n'}트레이너의 피드백을 받아보세요.
            </Text>
            <View style={styles.startExercise}>
              <Text style={styles.startText}>운동하기</Text>
            </View>
          </View>
        </ImageBackground>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  Container: {
    width: windowWidth,
    height: windowHeight,
    backgroundColor: 'white',
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  touchContainer: {
    backgroundColor: '#F9F7FE',
    width: windowWidth * 0.85,
    height: windowHeight * 0.39,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 15,
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
    borderRadius: 10,
  },
  textContainer: {
    marginTop: windowHeight * 0.07,
  },
  headText: {
    fontSize: 30,
    // fontWeight: 'bold',
    marginBottom: 10,
    color: 'black',
    marginVertical: 10,
    alignSelf: 'center',
    fontFamily: 'Pretendard-Bold'
  },
  text: {
    textAlign: 'center',
    // fontWeight: 'thin',
    fontFamily: 'Pretendard-Regular',
    fontSize: 20,
    color: 'black',
    marginVertical: windowHeight * 0.02,
    alignSelf: 'center',
  },
  startExercise: {
    width: windowWidth * 0.35,
    height: windowHeight * 0.08,
    backgroundColor: 'rgba(249, 247, 254, 0.50)',
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginVertical: 10,
  },
  startText: {
    color: '#000',
    textAlign: 'center',
    fontFamily: 'Pretendard-Light',
    fontSize: 20,
    fontStyle: 'normal',
  },
});

export default Category;
