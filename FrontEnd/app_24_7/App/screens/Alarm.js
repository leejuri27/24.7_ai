import React, {useState, useEffect} from 'react';
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  Dimensions,
  ScrollView,
  SectionList,
} from 'react-native';
import {useNavigation, useRoute} from '@react-navigation/native';
import axios from 'axios';

import Icon from 'react-native-vector-icons/EvilIcons';
import LoadingScreen2 from './LoadingScreen2';

const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;

const Alarm = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const {selectedDay} = route.params;
  console.log('alarm -----', selectedDay);

  const [ready, setReady] = useState(true);

  const [dates, setDates] = useState();
  const [codes, setCodes] = useState();
  const [month, setMonth] = useState();
  const [day, setDay] = useState();

  useEffect(() => {
    //1초 뒤에 실행되는 코드들이 담겨 있는 함수
    setTimeout(() => {
      setReady(false);
    }, 1000);
  }, []);

  useEffect(() => {
    if (selectedDay) {
      // selectedDay가 정의되었는지 확인
      let connectionDates = selectedDay.map(item => item.connection_date);
      setDates(connectionDates);
      console.log('날짜 저장----------', connectionDates)

      let connectionCodes = selectedDay.map(item => item.connection_code);
      setCodes(connectionCodes);
      console.log('코드 저장', connectionDates)
    }

  }, [selectedDay]);


    /** 서버로 유저 코드 보내주는 함수 */
    const sendConnectionCode = async (dateString) => {
      const connectionCode = selectedDay.find(item => item.connection_date === dateString)?.connection_code;
      console.log('Selected connection code:', connectionCode);
  
      const response = await axios.post('http://20.249.87.104:3000/user/getFeedback', {
        code: connectionCode,
      });
      
    };


  // 헤더 (알림 -> 메인)
  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: ' ',
      headerLeft: ({onPress}) => (
        <TouchableOpacity
          onPress={() => {
            navigation.navigate('Main');
          }}>
          <Icon name="chevron-left" size={40} />
        </TouchableOpacity>
      ),
      contentStyle: {
        backgroundColor: '#F6F6F6',
      },
    });
  }, [navigation]);

  return ready ? (
    <LoadingScreen2 />
  ) : (
    <View>
      {/* 알림창 부분 */}
      <ScrollView>
        <View style={styles.alarmContainer}>
          {/* 개별 알림창 */}
          {dates.map((item, index) => {
            let [year, month, day] = item.split(' ')[0].split('-');
            return (
              <View key={index} style={styles.alarmBox}>
                <View style={styles.alarmText}>
                  <Text style={{fontSize: 20, fontFamily: 'Pretendard-Light'}}>
                    {month}월 {day}일 운동 피드백이 도착했습니다.
                  </Text>
                </View>

                <TouchableOpacity
                  onPress={() => {
                    let dateString = `${year}-${month}-${day}`
                    sendConnectionCode(dateString);
                    let connectionCode = selectedDay.find(item => item.connection_date === dateString)?.connection_code;
                    navigation.navigate('Feedback', {selectMonth: month, selectDay : day, code : connectionCode})
                    
                  }}>
                  <View style={styles.alarmBtn}>
                    <Icon name="chevron-right" size={45} color="#AB9EF4" />
                  </View>
                </TouchableOpacity>
              </View>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  alarmContainer: {
    paddingHorizontal: windowHeight * 0.02,
    paddingTop: windowWidth * 0.045,
  },
  alarmBox: {
    width: windowWidth * 0.92,
    height: windowHeight * 0.09,
    borderRadius: 13,
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    marginVertical: 10,
  },
  alarmText: {
    flex: 1,
    alignItems: 'center',
    marginLeft: 10,
  },
  alarmBtn: {
    alignItems: 'flex-end',
  },
});

export default Alarm;
