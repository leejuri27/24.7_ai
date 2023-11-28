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

const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;

function FindPw({ navigation }) {
  const [email, setEmail] = useState('');
  const [showPasswordFields, setShowPasswordFields] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerLeft: ({ onPress }) => (
        <TouchableOpacity
          onPress={() => {
            navigation.navigate('Login');
          }}>
          <Icon name="chevron-left" size={40} />
        </TouchableOpacity>
      ),
      contentStyle: {
        backgroundColor: '#F6F6F6',
      },
    });
  }, [navigation]);

  const emailCheck = () => {
    console.log("sdadsasad", email);
    if (email === "" || email === undefined) {
      setErrorMessage('이메일을 확인해주세요');
      return false;
    }
    axios
      .post("http://192.168.21.126:3000/user/emailCheck", {
        email: email,
      })
      .then((res) => {
        console.log("emailCheck =>", res.data.result);
        // 로그인 성공여부는 res.data.affectedRows가 0인지 1인지 확인하면 됨
        if (res.data.result === 1) {
          setShowPasswordFields(true);
          setErrorMessage('');
        } else {
          setErrorMessage('등록된 회원 정보가 없습니다');
        }
      })

  }

  const changePw = () => {
    console.log("1", email, newPassword, confirmPassword);
    if (newPassword === "" || newPassword === undefined) {
      alert("비밀번호 입력")
      return false;
    }
    if (newPassword === "" || newPassword === undefined) {
      alert("비밀번호 확인 입력")
      return false;
    }
    if (newPassword !== confirmPassword) {
      alert("비번이랑 확인 다름 ")
      return false;
    } else {
      axios
        .post("http://20.249.87.104:3000/user/findPassword", {
          email: email,
          newPw: newPassword,
        })
        .then((res) => {
          console.log("emailCheck 2313=>", res.data.result);
          // 로그인 성공여부는 res.data.affectedRows가 0인지 1인지 확인하면 됨
          if (res.data.result === 1) {
            navigation.navigate('Login')
          } else {
            alert("변경불가")
          }
        })
    }

  }

  return (
    <KeyboardAwareScrollView
      style={{ flex: 1 }}
      showsVerticalScrollIndicator={false}
      resetScrollToCoords={{ x: 0, y: 0 }}
      scrollEnabled={true}>
      <ImageBackground
        source={require('../assets/image/backColor2.png')}
        style={styles.container}>
        <View style={styles.headerContent}>
          <Text style={{ ...styles.text, marginRight: 230 }}>이메일 입력</Text>
          <TextInput
            style={styles.inputText}
            value={email}
            onChangeText={text => {
              if (!showPasswordFields) {
                setEmail(text);
              }
            }}
            editable={!showPasswordFields}
          />
          <TouchableOpacity
            style={styles.checkBtn}
            onPress={emailCheck}
            disabled={showPasswordFields}>
            <Text style={styles.checkBtnText}>다음</Text>
          </TouchableOpacity>
          {errorMessage !== '' && (
            <Text style={styles.errorMessage}>{errorMessage}</Text>
          )}
        </View>

        {showPasswordFields && (
          <View style={styles.newPw}>
            <Text style={{ ...styles.text, marginRight: 190 }}>
              새로운 비밀번호
            </Text>
            <TextInput
              style={styles.inputText}
              value={newPassword}
              onChangeText={text => setNewPassword(text)}
            />
            <Text style={{ ...styles.text, marginRight: 160, marginTop: 20 }}>
              새로운 비밀번호 확인
            </Text>
            <TextInput
              style={styles.inputText}
              value={confirmPassword}
              onChangeText={text => setConfirmPassword(text)}

            />
            <TouchableOpacity
              style={styles.checkBtn}
              onPress={changePw}
              disabled = {newPassword == "" || confirmPassword == ""}
              >
              <Text style={styles.checkBtnText}>확인</Text>
            </TouchableOpacity>
          </View>
        )}
      </ImageBackground>
    </KeyboardAwareScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: windowWidth,
    height: windowHeight,
  },
  headerContent: {
    alignItems: 'center',
    marginTop: 50,
  },
  inputText: {
    backgroundColor: 'white',
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
    marginTop: 10,
    fontFamily: 'Pretendard-Light',
  },
  newPw: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 80,
  },
});

export default FindPw;