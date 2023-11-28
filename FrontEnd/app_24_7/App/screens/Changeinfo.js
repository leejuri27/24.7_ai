import React, { useState, useEffect } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import Icon from 'react-native-vector-icons/EvilIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios'; // axios를 import 해야 합니다.

const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;

function Changeinfo({ navigation }) {
  const [email, setEmail] = useState('');
  const [pw, setPw] = useState('');
  const [nick, setNick] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  React.useLayoutEffect(() => {
    navigation.setOptions({
        headerTitle: '회원정보 수정',
        headerLeft: ({ onPress }) => (
            <TouchableOpacity
                onPress={() => {
                    navigation.navigate('Mypage');
                }}>
                <Icon name="chevron-left" size={40} />
            </TouchableOpacity>
        ),
        contentStyle: {
            backgroundColor: '#fff',
        },
    });
}, [navigation]);

  useEffect(() => {
    // 컴포넌트가 마운트될 때 AsyncStorage에서 이메일을 가져오기 위해 useEffect를 사용합니다.
    getEmailFromAsyncStorage();
  }, []);

  const getEmailFromAsyncStorage = async () => {
    try {
      const storedEmail = await AsyncStorage.getItem('userEmail');
      console.log('저장된 이메일1:', storedEmail);
      setEmail(storedEmail || ''); // storedEmail이 null인 경우 빈 문자열 사용
    } catch (error) {
      console.error('AsyncStorage에서 이메일을 가져오는 동안 오류 발생:', error);
    }
  };

  const handleUpdate = async () => {
    try {
      const storedEmail = await getEmailFromAsyncStorage();
      console.log('저장된 이메일2:', email);
      if (!email) {
        setErrorMessage('이메일을 찾을 수 없습니다22.');
        return;
      }
  
      console.log("저장된 이메일3:", email);
  
      const response = await axios.post("http://20.249.87.104:3000/user/modify", {
        email: email,
        pw: pw,
        nickname : nick
      });
  
      console.log("info=>", response.data.result);
      if (response.data.result === 1) {
        setErrorMessage('');
        navigation.navigate('Main');
      } else {
        setErrorMessage('등록된 회원 정보가 없습니다.');
      }
    } catch (error) {
      console.error('이메일 확인 중 오류 발생:', error);
    }
  };

  return (
    <View style={styles.Container}>
      <View style={styles.headerContent}>
        <Text style={{ ...styles.text, marginRight: 270 }}>이메일</Text>
        <TextInput
          style={{...styles.inputText, backgroundColor: '#EBE8F4', color: '#807F7F'}}
          value={email}
          onChangeText={(text) => setEmail(text)}
          editable={false} // 편집 불가능하게 만들기 위해 editable을 false로 설정
        />
        <Text style={{ ...styles.text, marginRight: 270 }}>비밀번호</Text>
        <TextInput
          style={styles.inputText}
          value={pw}
          onChangeText={(text) => setPw(text)}
        />
        <Text style={{ ...styles.text, marginRight: 270 }}>닉네임</Text>
        <TextInput
          style={styles.inputText}
          value={nick}
          onChangeText={(text) => setNick(text)}
        />
        {errorMessage !== '' && (
          <Text style={styles.errorMessage}>{errorMessage}</Text>
        )}
        <TouchableOpacity style={styles.checkBtn} onPress={handleUpdate} disabled = {pw == "" || nick == ""}>
          <Text style={styles.checkBtnText}>수정하기</Text>
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
    // alignItems: 'center',
    // justifyContent: 'center',
    marginTop: windowHeight * 0.15,
    // backgroundColor: 'blue'
  },
  headerContent: {
    alignItems: 'center',
    marginTop: 0,
    // backgroundColor: 'red'
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
    fontFamily: 'Pretendard-Regular',
  },
  checkBtn: {
    backgroundColor: '#7254F5',
    padding: 15,
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
    fontFamily: 'Pretendard-Light',
    color: 'red',
    fontSize: 15,
  },
  newPw: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 80,
  },
});

export default Changeinfo;