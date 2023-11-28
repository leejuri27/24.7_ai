import React, {useRef, useState, useEffect} from 'react';
import {
  ImageBackground,
  View,
  TextInput,
  Text,
  StyleSheet,
  Image,
  Button,
  TouchableOpacity,
  Dimensions,
} from 'react-native';

import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;

function Login({navigation}) {
  const [email, setEmail] = useState('');
  const [pw, setPw] = useState('');
  const [alarmText, setAlarmText] = useState('');
  const emailRef = useRef({});
  const pwRef = useRef({});
  const alarmRef = useRef({});

  // const isValidEmail = (email) => {
  //   // 이메일 유효성 검사 정규식
  //   const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
  //   return emailRegex.test(email);
  // };

  // const isValidPassword = (pw) => {
  //   // 비밀번호는 최소 8자 이상, 영문 대소문자 및 숫자를 포함해야 합니다.
  //   const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
  //   return passwordRegex.test(pw);
  // };

  // useEffect(() => {
  //   getData();
  // }, []);

  // // connection date 정보 가져오기
  // const getData = async () => {
  //   try {
  //     const response = await axios.get(
  //       // 20.249.87.104
  //       'http://20.249.87.104:3000/user/autoLogin',{
  //         withCredentials: true,
  //       }
  //     );
  //     console.log('kkkkk', response.data.result);
  //   } catch (error) {
  //     console.error('자동로그인 ----- ', error);
  //   }
  // };

  const handleLogin = async () => {
    // navigation.navigate('Main');
    if (email === '' || email === undefined || pw === '' || pw === undefined) {
      alert('이메일과 비밀번호를 모두 입력하세요.');
      return;
    } else {
      try {
        const response = await axios.post(
          'http://20.249.87.104:3000/user/login',
          {
            email: email,
            pw: pw,
            withCredentials: true,
          },
          {
            timeout: 5000,
          },
        );

        console.log('handleLogin =>', response.data.result);
        // 로그인 성공여부는 res.data.affectedRows가 0인지 1인지 확인하면 됨
        if (response.data.result === 1) {
          AsyncStorage.setItem('userEmail', email);
          setAlarmText('');

          navigation.navigate('Main');
        }
        
      } catch (error) {
        if (axios.isCancel(error)) {
          console.error('요청이 취소되었습니다.', error.message);
        } else if (error.response) {
          // 요청은 성공했지만 서버에서 오류 응답을 보낸 경우 (예: 4xx, 5xx)
          console.error(
            '서버에서 오류 응답을 받았습니다.',
            error.response.status,
            error.response.data,
          );
        } else if (error.request) {
          // 요청이 전송되었지만 응답을 받지 못한 경우
          console.error(
            '응답을 받지 못했습니다. 요청이 실패했거나 응답이 없습니다.',
          );
        } else {
          // 오류를 생성한 요청 설정을 확인하는 경우
          console.error('오류를 생성한 요청 설정을 확인하세요:', error.message);
        }
        // 여기에서 오류를 처리할 수 있습니다.
        setAlarmText('잘못된 비밀번호입니다. 다시 확인하세요.');
        alarmRef.current.setNativeProps({
          style: {color: 'red', display: 'block'},
        });
      }
    }
  };

  return (
    <KeyboardAwareScrollView
      style={{flex: 1}}
      showsVerticalScrollIndicator={false}
      resetScrollToCoords={{x: 0, y: 0}}
      scrollEnabled={true}>
      <ImageBackground
        source={require('../assets/image/backColor2.png')}
        style={styles.container}>
        <View>
          <Image
            style={styles.img}
            source={require('../assets/image/logo3.png')}
          />
        </View>

        <TextInput
          placeholder="Email"
          style={{...styles.input, marginBottom: 5}}
          placeholderTextColor="#AB9EF4"
          ref={ref => (this.emailRef = ref)}
          onChangeText={text => setEmail(text)}></TextInput>

        <TextInput
          placeholder="Password"
          style={{...styles.input, marginBottom: 30}}
          secureTextEntry
          returnKeyType="done"
          keyboardType="email-address"
          placeholderTextColor="#AB9EF4"
          ref={ref => (this.pwRef = ref)}
          onChangeText={text => setPw(text)}></TextInput>
        <Text
          style={{
            display: 'none',
            color: 'red',
            fontFamily: 'Pretendard-Light',
            marginTop: windowHeight * -0.018,
            marginBottom: windowHeight * 0.025,
          }}
          ref={alarmRef}>
          {alarmText}
        </Text>

        <View style={styles.btn}>
          <TouchableOpacity
            style={{
              ...styles.loginButton,
              opacity: email === '' || pw === '' ? 0.5 : 1,
            }}
            onPress={handleLogin}
            // onPress={navigation.navigate('Main')}
            disabled={email === '' || pw === ''}>
            <Text style={styles.loginButtonText}>로그인</Text>
          </TouchableOpacity>

          {/* <TouchableOpacity style={styles.kakaoLoginButton} onPress={() => {}}>
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
              <Image
                source={require('../assets/image/kakaologo3.png')}
                style={{width: 20, height: 20, marginRight: 15, marginTop: 1}}
              />
              <Text style={styles.kakaoLoginButtonText}>카카오 로그인</Text>
            </View>
          </TouchableOpacity> */}
        </View>
        <View style={styles.others}>
          <TouchableOpacity onPress={() => navigation.navigate('Join')}>
            <Text style={styles.linkText}>회원가입</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('FindPw')}>
            <Text style={styles.linkText}>비밀번호 찾기</Text>
          </TouchableOpacity>
        </View>
      </ImageBackground>
    </KeyboardAwareScrollView>
  );
}
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
  input: {
    backgroundColor: 'white',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginVertical: 20,
    fontSize: 18,
    width: '80%',
    fontFamily: 'Pretendard-Regular',
  },
  btn: {
    width: '80%',
    marginVertical: 20,
    marginTop: 10,
  },
  others: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '70%',
    marginTop: 0,
  },
  kakaoLoginButton: {
    backgroundColor: '#FEE500',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  loginButton: {
    backgroundColor: '#7254F5',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 10,
  },
  linkText: {
    marginHorizontal: 40,
    fontSize: 15,
    fontFamily: 'Pretendard-Regular',
    color: 'black',
  },
  loginButtonText: {
    color: 'white',
    fontSize: 15,
    fontFamily: 'Pretendard-SemiBold',
  },
  kakaoLoginButtonText: {
    color: 'black',
    fontSize: 15,
    fontFamily: 'Pretendard-SemiBold',
  },
});

export default Login;
