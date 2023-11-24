import React, {useState} from 'react';
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Dimensions,
  Image,
} from 'react-native';
import {Calendar} from 'react-native-calendars';

// ---------------------------------------------------------
import Icon from 'react-native-vector-icons/Feather';
import Fontisto from 'react-native-vector-icons/Fontisto';

const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;
console.log(windowWidth);
console.log(windowHeight);

const Main = ({navigation}) => {
  // const [dates, setDates] = React.useState(['2023-10-31']);
  const [selectedDay, setSelectedDay] = useState();
  const today = new Date();
  const todayString = today.toISOString().split('T')[0];

  const markedDates = {
    '2023-11-14': {
      marked: true,
      dotColor: '#AB9EF4',
    },
    '2023-11-10': {
      marked: true,
      dotColor: '#AB9EF4',
    },
    [todayString]: {
      selected: true,
      marked: true,
      selectedColor: '#7254F5',
      height: 8,
    },
  };

  const theme = {
    arrowColor: 'black',
    textDayFontSize: 16,
    textMonthFontSize: 16,
    textDayHeaderFontSize: 16,
  };

  const headerStyle = {
    textMonthFontSize: 85, // 월 폰트 크기 설정
    textYearFontSize: 80, // 년도 폰트 크기 설정
  };

  /** 날짜 누르면 해당 날짜 피드백 화면으로 이동 */
  const handleCheck = () => {

  }

  return (
    <View style={styles.calendarContainer}>
      <View style={styles.headerComponent}>
        <TouchableOpacity
          style={styles.bellBtn}
          onPress={() => navigation.navigate('Alarm', {selectedDay})}>
          {/* <Fontisto name="bell" size={35} color="#AB9EF4" /> */}
          <Image
            source={require('../assets/image/Bell.png')}
            style={{width: 40, height: 40}}
          />
        </TouchableOpacity>
        <TouchableOpacity style={styles.userBtn} onPress={()=>{navigation.navigate("Mypage")}}>
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
          headerStyle={headerStyle} 
          onDayPress={(day) => {
            console.log('Selected day:', day.month, day.day);
            if (markedDates[day.dateString]) {
              // setSelectedDay(day);
              navigation.navigate('Feedback', {selectedDay: day});
            }
          }}
        />
      </View>
      <TouchableOpacity
        style={styles.cameraBtn}
        onPress={() => navigation.navigate('Category')}>
        <View style={styles.circle}>
          {/* <Icon
            name="camera"
            size={60}
            color="#7254F5"
            style={styles.cameraIcon}
          /> */}
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
  userBtn: {
    marginLeft: 15,
  },
  // userCircle: {
  //   width: '100%', // 선의 너비를 100%로 설정
  //   borderWidth: 3,
  //   borderColor: '#AB9EF4',
  //   borderRadius: 50,
  // },
});

export default Main;