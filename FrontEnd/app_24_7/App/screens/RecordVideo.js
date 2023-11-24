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
// ---------------------------------------------------------
import Icon from 'react-native-vector-icons/EvilIcons';

const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;

const RecordVideo = ({navigation}) => {
  const route = useRoute();
  const {category} = route.params;
  const v = require('../assets/video/squat.mp4');
  const [timer, setTimer] = useState(10);

  const {hasPermission, requestPermission} = useCameraPermission();
  // 카메라 권한 설정
  const checkCameraPermissionState = async () => {
    // 권한 요청
    const newCameraPermission = await Camera.requestCameraPermission();
    // 권한 가져오기
    const cameraPermission = await Camera.getCameraPermissionStatus();
    console.log(cameraPermission, 'camera');
  };

  // 마이크 권한 설정
  const checkAudioPermissionState = async () => {
    // 권한 요청
    const newMicrophonePermission = await Camera.requestMicrophonePermission();
    // 권한 가져오기
    const micPermission = await Camera.getMicrophonePermissionStatus();
    console.log(micPermission, 'microphone');
  };

  useEffect(() => {
    checkCameraPermissionState();
    checkAudioPermissionState();
    Alert.alert(
      '알림',
      '정확한 분석을 위해 다양한 각도로 화면에 보여주세요.\n 화면을 돌리지 말아주세요.',
    );
  }, []);

  // const device = useCameraDevice('back', {
  //   physicalDevices: [
  //     // 'ultra-wide-angle-camera',
  //     'wide-angle-camera',
  //     'telephoto-camera',
  //   ],
  // });
  const device = useCameraDevice('front', {
    // videoHeight:windowWidth / Math.sqrt(1.1),
    // videoWidth: windowWidth / Math.sqrt(1.1),
  });

  // console.log('device', device);
  if (device == null) return Alert.alert('알림', '실패');

  const format = useCameraFormat(device, [
    {videoResolution: {width: 640, height: 480}}, // 480p 해상도 설정
  ]);

  // 녹화
  const [isRecording, setIsRecording] = useState(false);
  const [videoPath, setVideoPath] = useState('');
  const camera = useRef();

  /** 녹화 실행 함수 */
  const startRecording = () => {
    console.log('startRecording...');

    setIsRecording(true);
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
        });
      },
      onRecordingError: error => {
        console.error(error);
      },
    });
  };

  /** 녹화 중지 함수 */
  const stopRecording = () => {
    console.log('stopRecording...');
    setIsRecording(false);
    camera.current.stopRecording();

    console.log('RecodeVideo_stopRecording ------ video path :', videoPath);
  };


  return (
    // justifyContent: 'center', alignItems: 'center'
    <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
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
          <TouchableOpacity
            style={styles.recordBtn}
            onPress={isRecording ? stopRecording : startRecording}>
            <Text style={styles.recordBtnText}>
              {isRecording ? '종료' : '시작'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* 제공하는 영상 */}
      <View style={styles.video}>
        <Video
          source={v}
          style={styles.videoPlayer}
          controls={true}
          volume={0.0}
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
          // fps={fps}
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
  },
});

export default RecordVideo;
