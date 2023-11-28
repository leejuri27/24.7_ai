import axios from 'axios';
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

const categoriesData = [
  {
    name: '스쿼트',
    description: '스쿼트에 대한 설명',
  },
  {
    name: '런지',
    description: '런지에 대한 설명',
  },
  {
    name: '푸쉬업',
    description: '푸쉬업에 대한 설명',
  },
  // 다른 카테고리 추가
];

const CategoryAi = ({navigation}) => {
  // 뒤로가기 (CategoryAi -> Category)
  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: 'AI 분석 운동',
      headerLeft: ({onPress}) => (
        <TouchableOpacity
          onPress={() => {
            navigation.navigate('Category');
          }}>
          <Icon name="chevron-left" size={40} />
        </TouchableOpacity>
      ),
      headerTitleStyle: {fontFamily: 'Pretendard-Regular'},
      contentStyle: {
        backgroundColor: '#fff',
      },
    });
  }, [navigation]);

  return (
    <View style={styles.Container}>
      {/* 스쿼트 */}
      <TouchableOpacity
        style={styles.touchContainer}
        onPress={async () => {
          try {
            let category = "스쿼트A"
            let base = "http://20.249.87.104:3000"

            const response = await axios.post("http://20.249.87.104:3000/user/getVideo",{
              category
            })
            const videoPath = response.data.result.video_url;
            const video_path = `${base}${videoPath}`
            navigation.navigate('RecordVideo', {
              category,
              path: video_path
            });
          } catch (err){
            console.log(err)
          }
        }}>
        <ImageBackground
          source={require('../assets/image/squat.png')}
          style={styles.squatImage}>
          <Text style={styles.text}>스쿼트</Text>
        </ImageBackground>
      </TouchableOpacity>
      {/* 런지 */}
      <TouchableOpacity
        style={styles.touchContainer}
        onPress={async () => {
          try {
            let category = "런지A"
            let base = "http://20.249.87.104:3000"

            const response = await axios.post("http://20.249.87.104:3000/user/getVideo",{
              category
            })
            const videoPath = response.data.result.video_url;
            const video_path = `${base}${videoPath}`
            navigation.navigate('RecordVideo', {
              category,
              path: video_path
            });
          } catch (err){
            console.log(err)
          }
        }}>
        <Image
          source={require('../assets/image/lunge.png')}
          style={styles.lungeImage}></Image>
        <Text style={styles.text}>런지</Text>
      </TouchableOpacity>
      {/* 푸쉬업 */}
      <TouchableOpacity
        style={styles.touchContainer}
        onPress={async () => {
          try {
            let category = "푸쉬업A"
            let base = "http://20.249.87.104:3000"

            const response = await axios.post("http://20.249.87.104:3000/user/getVideo",{
              category
            })
            const videoPath = response.data.result.video_url;
            const video_path = `${base}${videoPath}`
            navigation.navigate('RecordVideo', {
              category,
              path: video_path
            });
          } catch (err){
            console.log(err)
          }
        }}>
        <Image
          source={require('../assets/image/pushUp.png')}
          style={styles.pushUpImage}></Image>
        <Text style={styles.text}>푸쉬업</Text>
        {/* <View style={styles.circle}></View> */}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  Container: {
    // marginHorizontal: windowWidth * 0.25,
    marginVertical: windowHeight * 0.02,
    alignItems: 'center',
  },
  touchContainer: {
    marginVertical: windowHeight * 0.01,
  },
  squatImage: {
    display: 'flex',
    width: windowHeight * 0.25,
    height: windowHeight * 0.25,
  },
  lungeImage: {
    width: windowHeight * 0.25,
    height: windowHeight * 0.25,
  },
  pushUpImage: {
    width: windowHeight * 0.25,
    height: windowHeight * 0.25,
  },
  text: {
    fontSize: 20,
    position: 'absolute',
    bottom: 20,
    alignSelf: 'center',
    fontFamily: 'Pretendard-Medium'
  },
});

export default CategoryAi;