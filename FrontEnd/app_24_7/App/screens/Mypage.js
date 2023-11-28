import React, { useRef, useState } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  TouchableOpacity,
  ImageBackground,
  Dimensions,
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import Icon from 'react-native-vector-icons/EvilIcons';
import axios from 'axios'; // axios를 import 해야 합니다.
import AsyncStorage from '@react-native-async-storage/async-storage';


const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;

function Mypage({ navigation }) {
  const [pw, setPw] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: '회원정보 수정',
      headerLeft: ({ onPress }) => (
        <TouchableOpacity
          onPress={() => {
            navigation.navigate('Main');
          }}>
          <Icon name="chevron-left" size={40} />
        </TouchableOpacity>
      ),
      contentStyle: {
        backgroundColor: '#fff',
      },
    });
  }, [navigation]);

  const getEmailFromAsyncStorage = async () => {
    try {
      const storedEmail = await AsyncStorage.getItem('userEmail');
      return storedEmail;
    } catch (error) {
      console.error('AsyncStorage에서 이메일을 검색하는 동안 오류 발생:', error);
      return null;
    }
  };

  const logout = async() => {
    try {
      const storedEmail = await getEmailFromAsyncStorage();
      console.log("로그아웃 어싱크스토어", storedEmail)
      axios.post("http://20.249.87.104:3000/user/logout", {
        email : storedEmail
      })
        .then((res) => {
          // console.log("logout", res);

          if (res.data.result === 1) {
            navigation.navigate('Login');
          } else {
            
            console.log("로그아웃 실패");
          }
        })
        .catch((error) => {
          console.error("AxiosError:", error);
        });
    } catch (err) {
      console.log('로그아웃 중 에러', err);
    }
  };


  const emailCheck = async () => {
    try {
      const storedEmail = await getEmailFromAsyncStorage();

      if (!storedEmail) {
        setErrorMessage('이메일을 찾을 수 없습니다.');
        return;
      }

      console.log("저장된 이메일11:", storedEmail);

      // axios 요청에서 storedEmail을 사용하세요
      axios
        .post("http://20.249.87.104:3000/user/passwordCheck", {
          email: storedEmail,
          pw: pw
        })
        .then((res) => {
          console.log("pwCheck =>", res.data.result);
          if (res.data.result === 1) {
            setErrorMessage('');
            navigation.navigate('Changeinfo')
          } else {
            setErrorMessage('등록된 회원 정보가 없습니다.');
          }
        })
        .catch((error) => {
          console.error("AxiosError:", error);
        });
    } catch (error) {
      console.error('이메일 확인 중 오류 발생:', error);
    }
  };



  return (
    <View style={styles.Container}>
      <View style={styles.headerContent}>
        <Text style={{ ...styles.text, marginRight: 230 }}>비밀번호 입력</Text>
        <TextInput
          style={styles.inputText}
          value={pw}
          onChangeText={text => setPw(text)}
        />
        {errorMessage !== '' && (
          <Text style={styles.errorMessage}>{errorMessage}</Text>
        )}
        <TouchableOpacity
          style={styles.checkBtn}
          onPress={emailCheck}
          disabled={pw == ""}
        >
          <Text style={styles.checkBtnText}>다음</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={logout}>
          <Text style={styles.logoutText}>로그아웃</Text>
        </TouchableOpacity>

      </View>
    </View>


  );
}

const styles = StyleSheet.create({
  Container: {
    width: windowWidth,
    height: windowHeight,
    backgroundColor: 'white',
    flex: 1,
    marginTop: windowHeight * 0.15,
    // alignItems: 'center',
    // justifyContent: 'center',
  },
  headerContent: {
    alignItems: 'center',
    // marginTop: 50,
  },
  inputText: {
    backgroundColor: '#F9F7FE',
    paddingVertical: 2,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginVertical: 10,
    fontSize: 18,
    width: 320,
    height: 50,
  },
  checkBtn: {
    backgroundColor: '#7254F5',
    padding: 13,
    borderRadius: 10,
    alignItems: 'center',
    width: 320,
    marginVertical: 10,
  },
  checkBtnText: {
    fontFamily: 'Pretendard-SemiBold',
    color: 'white',
    fontSize: 18,
  },
  text: {
    fontFamily: 'Pretendard-Regular',
    color: 'black',
    fontSize: 15,
  },
  errorMessage: {
    color: 'red',
    fontSize: 15,
  },
  newPw: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 80,
  },
  logoutText: {
    fontFamily: 'Pretendard-Regular',
    color: 'black',
    fontSize: 15,
  },
});

export default Mypage;