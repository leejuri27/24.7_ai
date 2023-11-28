import React, { useState, useRef, useEffect } from 'react';
import {
  ImageBackground,
  View,
  TextInput,
  Text,
  StyleSheet,
  Dimensions,
  Image,
  Button,
  TouchableOpacity,
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import Icon from 'react-native-vector-icons/EvilIcons';
import axios from "axios";

const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;

function Join({ navigation }) {
  const emailRef = useRef();
  const pwRef = useRef();
  const pwCheckRef = useRef(); // 비밀번호 확인
  const nickRef = useRef();
  const alarmRef = useRef({})
  const pwAlarmRef = useRef({})
  const nickAlarmRef = useRef({})
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [checkPw, setCheckPw] = useState("");
  const [nick, setNick] = useState("");
  const [emailCheckResult, setEmailCheckResult] = useState(false)
  const [alarmText, setAlarmText] = useState(""); 
  const [pwText, setPwText] = useState(""); 
  const [nickText, setNickText] = useState(""); 


  React.useLayoutEffect(() => {
    navigation.setOptions({
      //  headerTitle: ' ',
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

  const isValidEmail = (email) => {
    // 이메일 유효성 검사 정규식
    const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
    return emailRegex.test(email);
  };

  const emailCheck = () => {
    console.log("sdadsasad", email);
    if (email === "" || email === undefined) {
      // alert("이메일을 입력하세요!!!");
      alarmRef.current.setNativeProps({ style: { display: 'block', color : 'red' } });
      setAlarmText("이메일을 입력하세요")
      return false;
    }
    if (!isValidEmail(email)){
      setAlarmText("이메일을 확인해 주세요")
      alarmRef.current.setNativeProps({ style: { color: 'red', display : 'block' } });
      return false;
    }
    axios
      .post("http://20.249.87.104:3000/user/emailCheck", {
        email: email,
      })
      .then((res) => {
        console.log("emailCheck =>", res.data.result);
        // 로그인 성공여부는 res.data.affectedRows가 0인지 1인지 확인하면 됨
        if (res.data.result === 0) {
          console.log("result", res.data)
          setEmailCheckResult(true)
          setAlarmText("회원가입 가능 이메일")
          alarmRef.current.setNativeProps({ style: { color: 'green', display : 'block' } });
          
          // alert("회원가입 가능 이메일");
        }
        else {
          setAlarmText("중복된 이메일")
          alarmRef.current.setNativeProps({ style: { color: 'red' } });
        }

      })
      .catch((error) => {
        console.error("AxiosError:", error);
      });
  }


  const handleMember = () => {
    if (emailCheckResult == false) {
      setAlarmText("이메일 확인 버튼을 눌러주세요")
      alarmRef.current.setNativeProps({ style: { color: 'red', display : 'block' } });
      // alert("이메일 확인 하고 와")
      return false;
    } 
    if (pw === "" || pw === undefined) {  
      return false;
    }
    if (checkPw === "" || checkPw === undefined) {
      pwAlarmRef.current.setNativeProps({ style: { color: 'red', display : 'block' } });      
      setPwText("비밀번호를 확인해 주세요")    

    } else if (pw == checkPw){
      pwAlarmRef.current.setNativeProps({ style: {  display : 'none' } });      
    } else {
      setPwText("비밀번호를 확인해 주세요")    
      pwAlarmRef.current.setNativeProps({ style: {  display : 'block' } });      
    }
    if (nick === "" || nick === undefined) {
      setNickText("닉네임을 확인해 주세요")
      nickAlarmRef.current.setNativeProps({ style: { color: 'red', display : 'block' } });     
       return false;
    }else {
      nickAlarmRef.current.setNativeProps({ style: {  display : 'none' } });     

    }
    if (pw !== checkPw) {
      // alert("비밀번호와 비밀번호 확인 값이 다릅니다")
      pwAlarmRef.current.setNativeProps({ style: { color: 'red', display : 'block' } });      
      setPwText("비밀번호를 확인해 주세요")
      return false;
    } else {
      axios
        .post("http://20.249.87.104:3000/user/join", {
          email: email,
          pw: pw,
          nick: nick
        })
        .then((res) => {
          console.log("handleMember =>", res.data.result);
          // 로그인 성공여부는 res.data.affectedRows가 0인지 1인지 확인하면 됨
          if (res.data.result === 0) {
            // alert("회원가입 성공!!!")
            navigation.navigate('Login')
            console.log("회원가입성공")
            return ;
          }
          else alert("회원가입 실패!!!");
          navigation.navigate("Join");
        })
        .catch((e) => {
          console.error(e);
        });
    }

  };

  const temp = (text) => {
    setEmail(text)
    setEmailCheckResult(false)
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
        <Text style={{ ...styles.text, marginLeft: 28 }}>이메일 입력</Text>
        <View style={styles.inputContainer}>
          <TextInput style={styles.emailInputText} ref={ref => (this.emailRef = ref)} onChangeText={(text) => temp(text)} />
          <TouchableOpacity style={styles.btn} onPress={emailCheck} disabled={email === ''}>
            <Text style={styles.emailBtnText}>확인</Text>
          </TouchableOpacity>
        </View>
        <Text style={{ display: 'none', color: 'red', fontFamily: 'Pretendard-Light', marginTop: windowHeight * -0.018, marginBottom: windowHeight * 0.025 }} ref={alarmRef}>{alarmText}</Text>
        <Text style={{ ...styles.text, marginLeft: 10 }}>비밀번호</Text>
        <TextInput style={styles.inputText} ref={ref => (this.pwRef = ref)} onChangeText={(text) => setPw(text)} />
        <Text style={{ ...styles.text, marginLeft: 40 }}>비밀번호 확인</Text>
        <TextInput style={styles.inputText} ref={ref => (this.pwCheckRef = ref)} onChangeText={(text) => setCheckPw(text)} />
        <Text style={{  color: 'red', fontWeight: "bold", marginTop: windowHeight * -0.018, marginBottom: windowHeight * 0.025 }} ref={pwAlarmRef}>{pwText}</Text>
        <Text style={{ ...styles.text, marginLeft: 1 }}>닉네임</Text>
        <TextInput style={styles.inputText} ref={ref => (this.nickRef = ref)} onChangeText={(text) => setNick(text)} />
        <Text style={{ display: 'none', color: 'red', fontWeight: "bold", marginTop: windowHeight * -0.018, marginBottom: windowHeight * 0.025 }} ref={nickAlarmRef}>{nickText}</Text>
        <TouchableOpacity
          style={styles.JoinButton}
          onPress={handleMember}
          disabled={email === '' || pw == "" || checkPw == "" || nick == ""}>
          <Text style={styles.JoinButtonText}>회원가입</Text>
        </TouchableOpacity>
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
  inputText: {
    backgroundColor: 'white',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginVertical: 20,
    fontSize: 18,
    width: '80%',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  text: {
    marginRight: 250,
    fontFamily: 'Pretendard-Regular',
    color: 'black',
    fontSize: 15,
  },
  JoinButton: {
    backgroundColor: '#7254F5',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    width: '80%',
    marginVertical: 120,
    marginTop: 20,
  },
  JoinButtonText: {
    fontFamily: 'Pretendard-SemiBold',
    color: 'white',
    fontSize: 18,
  },
  btn: {
    backgroundColor: '#7254F5',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    width: 70,
    height: 59,
  },
  emailBtnText: {
    fontFamily: 'Pretendard-Regular',
    color: 'white',
    fontSize: 18,
    marginTop: 3,
  },
  emailInputText: {
    backgroundColor: 'white',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginVertical: 20,
    fontSize: 18,
    width: '60%',
    marginRight: 20,
  },
});

export default Join;