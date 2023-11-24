import React, { useCallback, useMemo, useRef } from 'react';
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/EvilIcons';
import * as Progress from "react-native-progress";
// import BottomSheet from '@gorhom/bottom-sheet';

const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;

const Feedback = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const {selectedDay} = route.params;
  console.log(selectedDay)
  // const bottomSheetRef = useRef < BottomSheet > (null);
  // const snapPoints = useMemo(() => ['25%', '50%'], []);
  // const handleSheetChanges = useCallback((index: number) => {
  //   console.log('handleSheetChanges', index);
  // }, []);

  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: ' ',
      headerLeft: ({ onPress }) => (
        <TouchableOpacity
          onPress={() => {
            navigation.navigate('Alarm');
          }}>
          <Icon name="chevron-left" size={40} />
        </TouchableOpacity>
      ),
      contentStyle: {
        backgroundColor: '#FAFAFA',
      },
    });
  }, [navigation]);

  return (
    <View style={styles.FeedbackContainer}>
      {/* 날짜, 운동 종목 */}
      <View style={styles.dateAndExercise}>
        {/* 날짜 */}
        <View style={styles.date}>
          <Text style={styles.dateText}>{selectedDay.month}월 {selectedDay.day}일</Text>
        </View>
        {/* 운동 종목 */}
        <View>
          <Text style={styles.exerciseInfo}>스쿼트 피드백</Text>
        </View>
      </View>
      {/* 트레이너 정보 */}
      <View style={styles.trainerInfo}></View>
      {/* 운동영상 */}
      <View style={styles.exerciseVideo}></View>
      {/* 피드백 */}
      <View style={styles.feedback}></View>
      {/* 분석 결과 */}
      <View style={styles.analysisResult}>
        <View style={styles.barView}>
          <View style={styles.bar}>
            <Progress.Bar
              progress={0.3} // 임시로 30%로 설정
              width={null}
              height={16}
              color={'#FF0044'}
              animated={true}
            />

          </View>
          <Text style={styles.barText}>
            30/100
          </Text>
          <Progress.Pie progress={0.4} size={50} />
        </View>
        {/* 메모 */}
      </View>
      {/* <View style={styles.container}>
        <BottomSheet
          ref={bottomSheetRef}
          index={1}
          snapPoints={snapPoints}
          onChange={handleSheetChanges}
        >
          <View style={styles.contentContainer}>
            <Text>Awesome 🎉</Text>
          </View>
        </BottomSheet>
      </View> */}
    </View>
  );
};

const styles = StyleSheet.create({
  FeedbackContainer: {
    flex: 1,
    paddingHorizontal: windowHeight * 0.02,
    paddingTop: windowWidth * 0.035,

  },
  dateAndExercise: {
    justifyContent:'center',
    alignItems: 'center'
  },
  date:{},
  dateText: {
    fontSize: 25,
    fontFamily: 'Pretendard-Light',
    marginVertical: 5,
  },
  exerciseInfo: {
    fontSize: 18,
    fontFamily: 'Pretendard-Regular',
    marginVertical: 10,
  },
  trainerInfo: {},
  exerciseVideo: {},
  feedback: {},
  analysisResult: {},
  memo: {},
  barview: {
    width: "100%",
    padding: 50,
    flexDirection: "row",
    marginTop: 50
  },
  bar: {
    flex: 1
  },
  bartext: {
    width: 40,
    textAlign: 'center',
    fontSize: 15,
    fontWeight: "bold",

  },
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: 'grey',
  },
  contentContainer: {
    flex: 1,
    alignItems: 'center',
  },
});

export default Feedback;