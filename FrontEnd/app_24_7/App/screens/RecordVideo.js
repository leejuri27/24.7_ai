import React, {useState, useEffect, useRef} from 'react';
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Dimensions,
  Text,
  Alert,
  Button,
} from 'react-native';
import {useRoute} from '@react-navigation/native';
import Video from 'react-native-video';
import {
  Camera,
  useCameraDevice,
  useCameraPermission,
  useCameraFormat,
} from 'react-native-vision-camera';
import axios from 'axios';
// ---------------------------------------------------------
import Icon from 'react-native-vector-icons/EvilIcons';
import LoadingScreen2 from './LoadingScreen2';

const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;

const RecordVideo = ({navigation}) => {
  const route = useRoute();
  const {category, path, group} = route.params;
  console.log('video path -------', path);
  console.log('group -------', group);
  // const v = require('../assets/video/squat2.mp4');

  const [ready, setReady] = useState(true);
  const [paused, setPaused] = useState(true); // 제공 비디오 재생 상태 관리
  const [countdown, setCountdown] = useState(10); // 카운트다운
  const [countdownFinished, setCountdownFinished] = useState(false);
  let isRecordingTime = false;

  const [path1, setPath] = useState();

  const {hasPermission, requestPermission} = useCameraPermission();
  // 카메라 권한 설정
  const checkCameraPermissionState = async () => {
    // 권한 요청
    const newCameraPermission = await Camera.requestCameraPermission();
    // 권한 가져오기
    const cameraPermission = await Camera.getCameraPermissionStatus();
    // console.log(cameraPermission, 'camera');
  };

  // 마이크 권한 설정
  const checkAudioPermissionState = async () => {
    // 권한 요청
    const newMicrophonePermission = await Camera.requestMicrophonePermission();
    // 권한 가져오기
    const micPermission = await Camera.getMicrophonePermissionStatus();
    // console.log(micPermission, 'microphone');
  };

  useEffect(() => {
    checkCameraPermissionState();
    checkAudioPermissionState();

    if (group === 'Ai') {
      Alert.alert(
        '정확한 분석을 위해 아래 촬영 방법 꼭 읽고 시작해주세요',
        '\n<< 촬영 방법 >>\n\n 1. 시작버튼을 누르면 10초 후에 운동이 시작됩니다. \n\n 2. 준비시간 동안 트레이너와 동일하게 자세를 취해야합니다.\n\n 3. 측면을 바라보고 운동 자세를 취해주세요\n\n 4. 총 10회 후 녹화가 자동 종료됩니다. \n\n\n ❗️10초 후에 바로 운동이 시작됩니다.❗️\n\n',
        [
          {
            text: '취소',
            onPress: () => {
              navigation.navigate('Category');
            },
            style: 'default',
          },
          {
            text: '녹화 시작',
            onPress: () => {
              // 카운트다운 함수
              const countdownInterval = setInterval(() => {
                setCountdown(prevCountdown => {
                  if (prevCountdown <= 1) {
                    clearInterval(countdownInterval);
                    startRecording();
                    setPaused(false); // 카운트다운이 끝나면 비디오 재생
                    setCountdownFinished(true);
                    return <></>; // 카운트다운 삭제
                  } else {
                    return prevCountdown - 1; // 카운트다운 1초씩 감소
                  }
                });
              }, 1000);
            },
            style: 'destructive',
          },
        ],
        {
          cancelable: true,
          onDismiss: () => {},
        },
      );
    } else if (group === 'NoAi') {
      Alert.alert(
        '촬영 방법 꼭 읽고 시작해주세요',
        '\n\n<< 촬영 방법 >>\n\n 1. 시작버튼을 누르면 10초 후에 운동이 시작됩니다. \n\n 2. 1분 후에 녹화가 자동 종료됩니다.',
        [
          {
            text: '취소',
            onPress: () => {
              navigation.navigate('Category');
            },
            style: 'default',
          },
          {
            text: '녹화 시작',
            onPress: () => {
              // 카운트다운 함수
              const countdownInterval = setInterval(() => {
                setCountdown(prevCountdown => {
                  if (prevCountdown <= 1) {
                    clearInterval(countdownInterval);
                    startRecording();
                    setPaused(false); // 카운트다운이 끝나면 비디오 재생
                    setCountdownFinished(true);
                    return <></>; // 카운트다운 삭제
                  } else {
                    return prevCountdown - 1; // 카운트다운 1초씩 감소
                  }
                });
              }, 1000);
            },
            style: 'destructive',
          },
        ],
        {
          cancelable: true,
          onDismiss: () => {},
        },
      );
    }


    setTimeout(() => {
      setReady(false);
    }, 1000);
  }, []);

  const device = useCameraDevice('front', {});

  // console.log('device', device);
  if (device == null) return Alert.alert('알림', '실패');

  const format = useCameraFormat(device, [
    {videoResolution: {width: 480, height: 640}}, // 480p 해상도 설정
  ]);

  // 녹화
  const [isRecording, setIsRecording] = useState(false);
  const [videoPath, setVideoPath] = useState('');
  const camera = useRef(null);

  /** 녹화 실행 함수 */
  const startRecording = () => {
    console.log('startRecording...');

    setIsRecording(true);
    if (camera.current) {
      camera.current.startRecording({
        flash: 'off',
        videoBitRate: 'low',
        // 녹화가 완료되었을 때 실행되는 함수 -> 녹화를 중지하는 기능은 없음
        onRecordingFinished: video => {
          console.log(
            'RecordVideo_startRecording ------- video path :',
            video.path,
          );
          setVideoPath(video.path); // videoPath 업데이트
          navigation.navigate('VideoSubmit', {
            category,
            videoPath: `${video.path}`,
            group
          });
        },
        onRecordingError: error => {
          console.error(error);
        },
      });
    } else {
      // console.error('Camera is not initialized.');
    }

    // // 1분 전에 녹화 종료하면 생기는 오류 해결 함수
    // const recordingInterval = setInterval(() => {
    //   if (isRecordingTime) {
    //     stopRecording();
    //     clearInterval(recordingInterval);
    //   }
    // }, 60 * 1000)

    if (group === 'Ai') {
      stopRecordingTimeout = setTimeout(() => {
        stopRecording();
      }, 23 * 1000);
    } else if (group === 'NoAi') {
      stopRecordingTimeout = setTimeout(() => {
        stopRecording();
      }, 60 * 1000);
    }
  };

  /** 녹화 중지 함수 */
  const stopRecording = () => {
    console.log('stopRecording...');
    if (camera.current) {
      setIsRecording(false);
      camera.current.stopRecording();

      console.log('RecodeVideo_stopRecording ------ video path :', videoPath);
    } else {
      // console.error('Camera is not initialized.');
    }

    clearTimeout(stopRecordingTimeout);
  };

  // setTimeout(() => {
  //   isRecordingTime = true;
  // }, 60 * 1000);

  return ready ? (
    <LoadingScreen2 />
  ) : (
    <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
      {/* 카운트다운 */}
      {countdownFinished ? (
        <></>
      ) : (
        <View style={{zIndex: 1}}>
          <Text
            style={{
              fontSize: 300,
              color: '#fff',
              zIndex: 1,
              marginTop: '125%',
              fontFamily: 'Pretendard-Bold',
              opacity: 1,
              alignSelf: 'center',
              position: 'absolute',

              // text 그림자
              textShadowColor: 'rgba(0, 0, 0, 0.5)', 
              textShadowOffset: { width: 2, height: 2 },
              textShadowRadius: 10,
            }}>
            {countdown}
          </Text>
        </View>
      )}

      {/* 뒤로가기 */}
      <View style={styles.headerContainer}>
        <TouchableOpacity
          onPress={() => {
            navigation.navigate('Category');
          }}
          style={styles.headerBackBtn}>
          <Icon name="chevron-left" size={40} style={styles.headerIcon} />
        </TouchableOpacity>
        {/* 카테고리 */}
        <View style={styles.headerText}>
          <Text style={styles.text}>{category}</Text>
        </View>
        {/* 시작, 종료 버튼 */}
        <View style={styles.headerRecordBtn}>
          {/* <TouchableOpacity
            style={styles.recordBtn}
            onPress={isRecording ? stopRecording : startRecording}>
            <Text style={styles.recordBtnText}>
              {isRecording ? '종료' : '시작'}
            </Text>
          </TouchableOpacity> */}
          <TouchableOpacity style={styles.recordBtn} onPress={stopRecording}>
            <Text style={styles.recordBtnText}>종료</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* 제공하는 영상 */}
      <View style={styles.video}>
        <Video
          source={{uri: path}}
          style={styles.videoPlayer}
          controls={true}
          volume={0.0}
          paused={paused}
          repeat={true}
        />
      </View>

      {/* 사용자 카메라 화면 */}
      <View style={{position: 'absolute', bottom: 10}}>
        <Camera
          style={{
            // 카메라 크기를 화면 너비의 제곱근으로 설정, Math.sqrt() -> 주어진 숫자의 제곱근을 반환
            width: windowWidth / Math.sqrt(1.1),
            height: windowWidth / Math.sqrt(1.1),
          }}
          device={device}
          isActive={true}
          video={true}
          audio={false}
          ref={camera}
          format={format}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    flex: 1,
    flexDirection: 'row',
    // alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 40,
  },
  headerBackBtn: {
    flex: 1,
    alignItems: 'flex-start',
    marginTop: 5,
  },
  headerIcon: {},
  headerText: {
    flex: 1,
    alignItems: 'center',
    marginTop: 12,
    height: 30,
  },
  text: {
    fontSize: 20,
  },
  headerRecordBtn: {
    flex: 1,
    alignItems: 'flex-end',
    right: 10,
  },
  recordBtn: {
    width: 60,
    height: 40,
    backgroundColor: '#7254F5',
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  recordBtnText: {
    fontSize: 20,
    color: '#fff',
    textAlign: 'center',
  },
  video: {
    position: 'absolute',
    top: windowWidth * 0.23,
  },
  videoPlayer: {
    width: windowWidth / Math.sqrt(1.1),
    height: windowWidth / Math.sqrt(1.1),
    // backgroundColor: 'red'
  },
});

export default RecordVideo;
