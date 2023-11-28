import axios from 'axios';
import React, {useState, useEffect} from 'react';
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Dimensions,
  Image,
  Text,
  Alert,
} from 'react-native';
import {useNavigation, useRoute} from '@react-navigation/native';
import {Calendar} from 'react-native-calendars';

// ---------------------------------------------------------
import Icon from 'react-native-vector-icons/Feather';
import Fontisto from 'react-native-vector-icons/Fontisto';
import LoadingScreen2 from './LoadingScreen2';

const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;

const Main = ({navigation}) => {
  const [ready, setReady] = useState(true);

  const [selectedDay, setSelectedDay] = useState(null);
  const [markedDates, setMarkedDates] = useState(markedDates);
  const [feedbackDay, setFeedbackDay] = useState([]);
  const [connectionCodes, setConnectionCodes] = useState({});

  const [data, setData] = useState();
  const [alarm, setAlarm] = useState([]);
  const [alarmText, setAlarmText] = useState([].length);
  const today = new Date();
  let todayString = today.toISOString().split('T')[0];

  // const markedDate = {
  //   '2023-11-20': {
  //     marked: true,
  //     dotColor: 'red',
  //   },
  //   '2023-11-17': {
  //     marked: true,
  //     dotColor: 'red',
  //   },
  //   '2023-11-18': {
  //     marked: true,
  //     dotColor: 'red',
  //   },
  // };

  useEffect(() => {
    //1초 뒤에 실행되는 코드들이 담겨 있는 함수
    setTimeout(() => {
      getData();
      getFeedbackConfirm();
      setReady(false);
    }, 1000);
  }, []);

  // connection date 정보 가져오기
  const getData = async () => {
    try {
      const response = await axios.get(
        'http://20.249.87.104:3000/user/getData',
      );
      console.log('mainData -----', response.data);
      setData(response.data.list);
    } catch (error) {
      console.error('mainData ----- ', error);
    }
  };

  const getFeedbackConfirm = async () => {
    try {
      const response = await axios.get(
        'http://20.249.87.104:3000/user/feedbackConfirm',
      );
      console.log('feedbackConfirm -----', response.data.result);
      setAlarm(response.data.result);
      console.log('------------------------알림', alarm);
      setAlarmText(response.data.result.length);
      console.log('알림 텍스트 ---------', alarmText);
    } catch (error) {
      console.error('feedbackConfirm ----- ', error);
    }
  };

  useEffect(() => {
    // 전체 데이터
    if (data) {
      let connectionDates = data.map(item => item.connection_date);
      setSelectedDay(connectionDates);
    }

    // 피드백 데이터
    if (alarm) {
      let feedbackDates = alarm.map(item => item.connection_date);
      setFeedbackDay(feedbackDates);
    }
  }, [data, alarm]);



  // 선택한 날짜, connection code 각 state에 저장
  useEffect(() => {
    const select = {key: 'select', color: '#AB9EF4', selectedDotColor: '#AB9EF4'};
    const feedback = {key: 'feedback', color: '#060320', selectedColor: '#F9F7FE'};
    
    if (selectedDay) {
      let newMarkedDates = selectedDay.reduce((acc, date) => {
        let dateKey = date.split(' ')[0];
        acc[dateKey] = {
          marked: true,
          // dotColor: '#AB9EF4',
          dots:[select],
        };
        return acc;
      }, {});

      if (feedbackDay) {
        newMarkedDates = feedbackDay.reduce((acc, date) => {
          let dateKey = date.split(' ')[0];
          if (acc[dateKey]) {
            acc[dateKey].dots.push(feedback);
          } else {
            acc[dateKey] = {
              marked: true,
              select: true,
              selectedColor: 'red'
            };
          }
          return acc;
        }, newMarkedDates);
      }

      // 오늘 날짜 표시
      newMarkedDates[todayString] = {
        selected: true,
        selectedColor: '#7254F5',
        height: 8,
      };
      setMarkedDates(newMarkedDates);

      let newConnectionCodes = data.reduce((acc, item) => {
        let dateKey = item.connection_date.split(' ')[0];
        acc[dateKey] = item.connection_code;
        return acc;
      }, {});
      setConnectionCodes(newConnectionCodes);
    }
  }, [selectedDay, feedbackDay]);

  // useEffect(() => {
  //   setMarkedDates({
  //     ...markedDates,
  //     ...feedbackDay.map(day => ({
  //       dateString: day,
  //       marked: true,
  //     })),
  //   });
  // }, [feedbackDay]);

  /** 서버로 유저 코드 보내주는 함수 */
  const sendConnectionCode = day => {
    let connectionCode = connectionCodes[day.dateString];
    console.log('Selected connection code:', connectionCode);

    axios.post('http://20.249.87.104:3000/user/getFeedback', {
      code: connectionCode,
    });
  };

  // 밑으로는 달력 스타일 조정하는 곳
  const theme = {
    arrowColor: 'black',
    textDayFontSize: 16,
    textMonthFontSize: 16,
    textDayHeaderFontSize: 13,
  };

  const headerStyle = {
    textMonthFontSize: 100, // 월 폰트 크기 설정
    textYearFontSize: 100, // 년도 폰트 크기 설정
  };

  return ready ? (
    <LoadingScreen2 />
  ) : (
    <View style={styles.calendarContainer}>
      <View style={styles.headerComponent}>
        {/* 알림 */}
        <TouchableOpacity
          style={styles.bellBtn}
          onPress={() => navigation.navigate('Alarm', {selectedDay: alarm})}>
          <View style={styles.alarmContainer}>
            <View style={styles.alarmCircle}>
              <Text style={styles.alarmText}>{alarmText}</Text>
            </View>
          </View>
          <Image
            source={require('../assets/image/Bell.png')}
            style={{width: 40, height: 40}}
          />
        </TouchableOpacity>
        {/* 마이페이지 */}
        <TouchableOpacity
          style={styles.userBtn}
          onPress={() => {
            navigation.navigate('Mypage');
          }}>
          <View style={styles.userCircle}>
            {/* <Icon name="user" size={35} color="#AB9EF4" /> */}
            <Image
              source={require('../assets/image/user.png')}
              style={{width: 45, height: 45}}
            />
          </View>
        </TouchableOpacity>
      </View>

      <View>
        <Calendar
          style={styles.calendar}
          theme={theme}
          markedDates={markedDates}
          markingType={'multi-dot'}
          headerStyle={headerStyle}
          onDayPress={day => {
            console.log('Selected day:', day.month, day.day);
            // if (markedDates[day.dateString]) {
            //   sendConnectionCode(day);
            //   navigation.navigate('Feedback', {
            //     selectMonth: day.month,
            //     selectDay: day.day,
            //   });
            if (feedbackDay.includes(day.dateString)) {
              sendConnectionCode(day);
              navigation.navigate('Feedback', {
                selectMonth: day.month,
                selectDay: day.day,
              });
            } else {
              Alert.alert('피드백이 도착하지 않았습니다.\n조금만 기다려주세요.')
            }
          }}
        />
      </View>
      <TouchableOpacity
        style={styles.cameraBtn}
        onPress={() => navigation.navigate('Category')}>
        <View style={styles.circle}>
          <Image
            source={require('../assets/image/Camera.png')}
            style={{width: 66, height: 65, marginTop: 15, marginLeft: 15}}
          />
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  calendar: {
    height: '75%',
    marginTop: windowHeight * 0.13,
    borderBottomColor: '#ffffff',
  },
  calendarContainer: {
    width: windowWidth,
    height: windowHeight,
    alignSelf: 'center', // 가운데 정렬
    paddingHorizontal: 15, // 좌우 마진을 15
    backgroundColor: 'white',
  },
  cameraBtn: {
    alignItems: 'center',
    // marginTop: '-80%',
    marginTop: windowHeight * -0.2,
    // marginBottom: windowHeight*40,
  },
  circle: {
    width: 95,
    height: 95,
    borderRadius: 50,
    backgroundColor: '#fff',
    shadowColor: '#ab9ef4',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.37,
    shadowRadius: 6,
    elevation: 4,
  },
  cameraIcon: {
    width: 65,
    height: 65,
    marginTop: 17,
    marginLeft: 17,
    // backgroundColor: 'blue',
  },

  headerComponent: {
    flexDirection: 'row', // 수평 배치
    justifyContent: 'space-between', // 요소 양 쪽 끝에 배치
    alignItems: 'center', // 세로 방향 가운데 정렬
    // backgroundColor: 'blue',
    marginTop: windowHeight * 0.07,
  },
  bellBtn: {
    marginRight: 15,
  },
  alarmContainer: {
    marginLeft: 20,
    position: 'relative',
    zIndex: 1,
  },
  alarmCircle: {
    width: 20,
    height: 20,
    backgroundColor: '#7254F5',
    borderRadius: 50,
    justifyContent: 'center',
    position: 'absolute',
  },
  alarmText: {
    color: '#fff',
    alignSelf: 'center',
  },
  userBtn: {
    marginLeft: 15,
  },
});

export default Main;
