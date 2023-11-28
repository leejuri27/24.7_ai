import React, {useState, useEffect, useRef, Fragment} from 'react';
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Dimensions,
  Text,
  Alert,
  TextInput,
} from 'react-native';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import {useRoute} from '@react-navigation/native';
import Video from 'react-native-video';
import MovToMp4 from 'react-native-mov-to-mp4';
import {VideoEditor, crop} from 'react-native-video-processing';
// ---------------------------------------------------------
import Icon from 'react-native-vector-icons/EvilIcons';
import axios from 'axios';

const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;

const VideoSubmit = ({navigation}) => {
  const route = useRoute();
  const {category, videoPath, group} = route.params;
  const [comment, setComment] = useState('');
  const commentRef = useRef({});
  const [cropVideoUri, setCropVideoUri] = useState();
  console.log('videosubmit ------ video path :', videoPath);



  // 파일 변환
  const handleConversion = () => {
    const video = Date.now().toString();

    // 파일 확장자 확인
    const extension = videoPath.split('.').pop();

    if (extension.toLowerCase() === 'mov') {
      // MOV 파일인 경우 변환 시도
      MovToMp4.convertMovToMp4(videoPath, video).then(function (results) {
        console.log('mov->mp4 파일 변환', results);
        const mp4Uri = results; // 변환된 mp4 파일의 경로

        const formData = new FormData();
        formData.append('video', {
          uri: mp4Uri,
          name: 'video.mp4',
          type: 'video/mp4',
        });
        formData.append('comment', comment);
        formData.append('category', category);
        formData.append('group', group);
        handleSubmit(formData);
      });
    } else {
      // MOV 파일이 아닌 경우 변환 없이 전송
      const formData = new FormData();
      formData.append('video', {
        uri: videoPath,
        name: `video.${extension}`,
        type: `video/${extension}`,
      });
      formData.append('comment', comment);
      formData.append('category', category);
      formData.append('group', group);
      handleSubmit(formData);
    }
  };

  const handleSubmit = formData => {
    console.log('제출 버튼 누르기', formData._parts);
    formData._parts.forEach(part => {
      if (part[0] === 'video') {
        console.log('formData ----- ', part[1]);
      }
    });
    axios
      .post('http://20.249.87.104:3000/user/sendTrainer', formData)
      .then(res => {
        console.log('handleSubmit =>', res.data);

        if (res.data.result === 1) {
          navigation.navigate('SubmitComplete');
        }
      })
      .catch(error => {
        // console.error('submit error --->', error);
      });
    // navigation.navigate('SubmitComplete');
  };

  // 뒤로가기 (VideoSubmit -> RecordVideo)
  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: route.params.category,
      headerLeft: ({onPress}) => (
        <TouchableOpacity
          onPress={() => {
            navigation.navigate('RecordVideo', {
              category,
            });
          }}>
          <Icon name="chevron-left" size={40} />
        </TouchableOpacity>
      ),
      headerTitleStyle: {fontFamily: 'Pretendard-Regular'},
      contentStyle: {
        backgroundColor: '#FAFAFA',
      },
    });
  }, [navigation, route]);

  return (
    <KeyboardAwareScrollView>
      <View style={styles.container}>
        {/* 사용자가 녹화한 영상 확인 */}
        <View style={styles.videoContainer}>
          <Video
            source={{uri: videoPath}}
            style={styles.videoPlayer}
            controls={true}
          />
        </View>
        {/* 피드백 작성칸 */}

        <View style={styles.textContainer}>
          <Text style={styles.text1}>트레이너에게 궁금한 점을 적어주세요!</Text>
          <Text style={styles.text2}>
            트레이너가 회원의 영상을 분석하고 직접 피드백을 제공합니다.
          </Text>

          <TextInput
            placeholder="질문을 작성해주세요."
            multiline={true}
            ref={ref => (this.commentRef = ref)}
            onChangeText={text => setComment(text)}
            style={{...styles.input, lineHeight: 30}}
            placeholderTextColor="#AFAFB5"
          />
        </View>

        <View style={styles.btn}>
          <TouchableOpacity
            style={styles.submitButton}
            onPress={handleConversion}>
            <Text style={styles.submitButtonText}>제출</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAwareScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    // flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  videoContainer: {
    // flex: 1,
    // position: 'absolute',
    // top: 0,
  },
  videoPlayer: {
    width: windowWidth / Math.sqrt(1.1),
    height: windowWidth / Math.sqrt(1.1),
    backgroundColor: 'darkorange',
  },
  textContainer: {
    flex: 0,
    justifyContent: 'center',
    marginTop: 5,
    lineHeight: 20,
  },
  text1: {
    fontSize: 16,
    color: '#060320',
    marginHorizontal: 15,
    marginTop: 10,
  },
  text2: {
    fontSize: 13,
    color: '#828282',
    marginHorizontal: 15,
    marginTop: 5,
  },
  input: {
    backgroundColor: '#F9F7FE',
    borderColor: '#AB9EF4',
    borderWidth: 1,
    marginHorizontal: 15,
    marginVertical: 5,
    paddingHorizontal: 10,
    paddingVertical: 10,
    width: windowWidth * 0.95,
    height: windowHeight * 0.25,
    textAlignVertical: 'top',
    borderRadius: 5,
    fontSize: 18,
  },
  btn: {
    width: '90%',
    marginVertical: 20,
    marginTop: 10,
  },
  submitButton: {
    backgroundColor: '#7254F5',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  submitButtonText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
});

export default VideoSubmit;
