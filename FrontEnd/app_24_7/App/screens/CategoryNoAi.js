import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Dimensions,
  Text,
} from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';
// ---------------------------------------------------------
import RecordVideo from './RecordVideo';
import Icon from 'react-native-vector-icons/EvilIcons';
import axios from 'axios'; // axios를 import 해야 합니다.

const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;

const CategoryNoAi = ({ navigation }) => {
  /** 어깨 드롭다운 */
  // 드롭다운 열고 닫기
  const [shoulderOpen, setShoulderOpen] = useState(false);
  // 라이브러리에 기본값을 설정할 수 있는 defaultValue 속성이 없어졌다고 하여 value를 초기화할 때 기본값을 지정해주었다.
  const [shoulderValue, setShoulderValue] = useState(' ');
  // 현재 선택된 값
  const [shoulderCurrent, setShoulderCurrent] = useState(1);

  // 드롭다운 메뉴에 들어갈 아이템들 {label: '메뉴명', value: '값} 형태
  const [shoulder, setShoulder] = useState([
    { label: '숄더프레스', value: '1' },
    { label: '사이드 레터럴 레이즈', value: '2' },
    { label: '벤트 오버 레터럴 레이즈', value: '3' },
  ]);

  // 다른 메뉴가 열리면 닫히게
  const handleShoulderOpen = () => {
    setShoulderOpen(prevState => !prevState);
    setChestOpen(false); // 어깨 드롭다운을 열 때 가슴 드롭다운을 닫음
    setBackOpen(false);
    setArmOpen(false);
    setLegOpen(false);
  };

  // 드롭다운 메뉴를 선택할 때마다 값 변경
  const shoulderOnChange = async (value, index) => {
    setShoulderCurrent(value);
    let category = '';
    let base = "http://20.249.87.104:3000"
    switch (value) {
      case '1':
        category = '숄더프레스';
        break;
      case '2':
        category = '사이드 레터럴 레이즈';
        break;
      case '3':
        category = '벤트 오버 레터럴 레이즈';
        break;
      default:
        setCurrentValue(0);
        break;
    }

    try {
      const response = await axios.post("http://20.249.87.104:3000/user/getVideo", {
        category
      });

      // video_url을 path에 직접 할당
      const videoPath = response.data.result.video_url;
      const video_path = `${base}${videoPath}`
      navigation.navigate('RecordVideo', {
        category,
        path: video_path,
        group: 'NoAi'
      });
    } catch (err) {
      console.log(err);
    }
  };


  /** 가슴 */
  const [chestOpen, setChestOpen] = useState(false);
  const [chestValue, setChestValue] = useState(' ');
  const [chestCurrent, setChestCurrent] = useState(1);
  const [chest, setChest] = useState([
    { label: '벤치프레스', value: '1' },
    { label: '덤벨 플라이', value: '2' },
    { label: '인클라인 벤치프레스', value: '3' },
    { label: '푸쉬업', value: '4' },
  ]);
  const handleChesetOpen = () => {
    setChestOpen(prevState => !prevState);
    setShoulderOpen(false); // 어깨 드롭다운을 열 때 가슴 드롭다운을 닫음
    setBackOpen(false);
    setArmOpen(false);
    setLegOpen(false);
  };
  const chestOnChange = async (value, index) => {
    setChestCurrent(value);
    let category = '';
    let base = "http://20.249.87.104:3000"
    switch (value) {
      case '1':
        category = '벤치프레스';
        break;
      case '2':
        category = '덤벨 플라이';
        break;
      case '3':
        category = '인클라인 벤치프레스';
        break;
      case '4':
        category = '푸쉬업';
        break;
      default:
        setCurrentValue(0);
        break;
    }

    try {
      const response = await axios.post("http://20.249.87.104:3000/user/getVideo", {
        category
      });

      // video_url을 path에 직접 할당
      const videoPath = response.data.result.video_url;
      const video_path = `${base}${videoPath}`
      navigation.navigate('RecordVideo', {
        category,
        path: video_path,
        group: 'NoAi'
      });
    } catch (err) {
      console.log(err);
    }
  };

  /** 등 */
  const [backOpen, setBackOpen] = useState(false);
  const [backValue, setBackValue] = useState(' ');
  const [backCurrent, setBackCurrent] = useState(1);
  const [back, setBack] = useState([
    { label: '렛풀다운', value: '1' },
    { label: '덤벨로우', value: '2' },
    { label: '데드리프트', value: '3' },
  ]);
  const handleBackOpen = () => {
    setBackOpen(prevState => !prevState);
    setShoulderOpen(false);
    setChestOpen(false);
    setArmOpen(false);
    setLegOpen(false);
  };
  const backOnChange = async (value, index) => {
    setBackCurrent(value);
    let category = '';
    let base = "http://20.249.87.104:3000"
    switch (value) {
      case '1':
        category = '렛풀다운';
        break;
      case '2':
        category = '덤벨로우';
        break;
      case '3':
        category = '데드리프트';
        break;
      default:
        setCurrentValue(0);
        break;
    }

    try {
      const response = await axios.post("http://20.249.87.104:3000/user/getVideo", {
        category
      });

      // video_url을 path에 직접 할당
      const videoPath = response.data.result.video_url;
      const video_path = `${base}${videoPath}`
      navigation.navigate('RecordVideo', {
        category,
        path: video_path,
        group: 'NoAi'
      });
    } catch (err) {
      console.log(err);
    }
  };

  /** 팔 */
  const [armOpen, setArmOpen] = useState(false);
  const [armValue, setArmValue] = useState(' ');
  const [armCurrent, setArmCurrent] = useState(1);
  const [arm, setArm] = useState([
    { label: '덤벨 컬', value: '1' },
    { label: '킥백', value: '2' },
    { label: '트라이셉스 익스텐션', value: '3' },
    { label: '딥스', value: '4' },
  ]);
  const handleArmOpen = () => {
    setArmOpen(prevState => !prevState);
    setShoulderOpen(false);
    setChestOpen(false);
    setBackOpen(false);
    setLegOpen(false);
  };
  const armOnChange = async (value, index) => {
    setArmCurrent(value);
    let category = '';
    let base = "http://20.249.87.104:3000"
    switch (value) {
      case '1':
        category = '덤벨 컬';
        break;
      case '2':
        category = '킥백';
        break;
      case '3':
        category = '트라이셉스 익스텐션';
        break;
      case '4':
        category = '딥스';
        break;
      default:
        setCurrentValue(0);
        break;
    }

    try {
      const response = await axios.post("http://20.249.87.104:3000/user/getVideo", {
        category
      });

      // video_url을 path에 직접 할당
      const videoPath = response.data.result.video_url;
      const video_path = `${base}${videoPath}`
      navigation.navigate('RecordVideo', {
        category,
        path: video_path,
        group: 'NoAi'
      });
    } catch (err) {
      console.log(err);
    }
  };

  /** 하체 */
  const [legOpen, setLegOpen] = useState(false);
  const [legValue, setLegValue] = useState(' ');
  const [legCurrent, setLegCurrent] = useState(1);
  const [leg, setLeg] = useState([
    { label: '스쿼트', value: '1' },
    { label: '런지', value: '2' },
  ])
  const handleLegOpen = () => {
    setLegOpen(prevState => !prevState);
    setShoulderOpen(false);
    setChestOpen(false);
    setBackOpen(false);
    setArmOpen(false);
  }
  const legOnChange = async (value, index) => {
    setLegCurrent(value);
    let category = '';
    let base = "http://20.249.87.104:3000"
    switch (value) {
      case '1':
        category = '스쿼트';
        break;
      case '2':
        category = '런지';
        break;
      default:
        setCurrentValue(0);
        break;
    }

    try {
      const response = await axios.post("http://20.249.87.104:3000/user/getVideo", {
        category
      });

      // video_ur할l을 path에 직접 당
      const videoPath = response.data.result.video_url;
      const video_path = `${base}${videoPath}`
      navigation.navigate('RecordVideo', {
        category,
        path: video_path,
        group: 'NoAi'
      });
    } catch (err) {
      console.log(err);
    }
  };

  // 뒤로가기 (CategoryNoAi -> Category)
  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: '부위별 운동',
      headerLeft: ({ onPress }) => (
        <TouchableOpacity
          onPress={() => {
            navigation.navigate('Category');
          }}>
          <Icon name="chevron-left" size={40} />
        </TouchableOpacity>
      ),
      headerTitleStyle: { fontFamily: 'Pretendard-Regular' },
      contentStyle: {
        backgroundColor: '#FAFAFA',
      },
    });
  }, [navigation]);

  return (
    <View style={styles.Container}>
      {/* 어깨 */}
      <View
        style={[
          styles.dropdown_container,
          { zIndex: 5000 },
          { marginBottom: shoulderOpen ? 120 : 10 },
        ]}>
        <View>
          <DropDownPicker
            open={shoulderOpen}
            // onOpen={onShoulderOpen}
            value={shoulderValue}
            items={shoulder}
            placeholder="어깨"
            setOpen={handleShoulderOpen}
            setValue={setShoulderValue}
            setItems={setShoulder}
            maxHeight={500} // 옵션이 많으면 잘려서 나오는데, 이때 maxHeight를 사용하여 길이를 조절하면 된다.
            onChangeValue={shoulderOnChange} // 값이 바뀔 때마다 실행
            // 스타일
            dropDownContainerStyle={{ ...styles.dropDownContainer }}
            arrowIconStyle={{
              width: 25,
              height: 25,
              tintColor: '#7254F5', // 원하는 색상으로 설정
            }}
            listItemContainerStyle={styles.dropdown}
            style={{ ...styles.Picker }}
            textStyle={{ ...styles.textStyle }}
            placeholderStyle={{ ...styles.placeholderStyle }}
          />
        </View>
      </View>
      {/* 가슴 */}
      <View
        style={[
          styles.dropdown_container,
          { zIndex: 4000 },
          { marginBottom: chestOpen ? 150 : 10 },
        ]}>
        <View>
          <DropDownPicker
            open={chestOpen}
            // onOpen={onChestOpen}
            value={chestValue}
            items={chest}
            placeholder="가슴"
            setOpen={handleChesetOpen}
            setValue={setChestValue}
            setItems={setChest}
            maxHeight={500} // 옵션이 많으면 잘려서 나오는데, 이때 maxHeight를 사용하여 길이를 조절하면 된다.
            onChangeValue={chestOnChange} // 값이 바뀔 때마다 실행
            dropDownDirection="BOTTOM"
            // 스타일
            dropDownContainerStyle={{ ...styles.dropDownContainer }}
            arrowIconStyle={{
              width: 25,
              height: 25,
              tintColor: '#7254F5', // 원하는 색상으로 설정
            }}
            listItemContainerStyle={styles.dropdown}
            style={{ ...styles.Picker }}
            textStyle={{ ...styles.textStyle }}
            placeholderStyle={{ ...styles.placeholderStyle }}
          />
        </View>
      </View>
      {/* 등 */}
      <View
        style={[
          styles.dropdown_container,
          { zIndex: 3000 },
          { marginBottom: backOpen ? 120 : 10 },
        ]}>
        <View>
          <DropDownPicker
            open={backOpen}
            // onOpen={onBackOpen}
            value={backValue}
            items={back}
            placeholder="등"
            setOpen={handleBackOpen}
            setValue={setBackValue}
            setItems={setBack}
            maxHeight={500} // 옵션이 많으면 잘려서 나오는데, 이때 maxHeight를 사용하여 길이를 조절하면 된다.
            onChangeValue={backOnChange} // 값이 바뀔 때마다 실행
            dropDownDirection="BOTTOM"
            // 스타일
            dropDownContainerStyle={{ ...styles.dropDownContainer }}
            arrowIconStyle={{
              width: 25,
              height: 25,
              tintColor: '#7254F5', // 원하는 색상으로 설정
            }}
            listItemContainerStyle={{ ...styles.dropdown }}
            style={{ ...styles.Picker }}
            textStyle={{ ...styles.textStyle }}
            placeholderStyle={{ ...styles.placeholderStyle }}
          />
        </View>
      </View>
      {/* 팔 */}
      <View
        style={[
          styles.dropdown_container,
          { zIndex: 2000 },
          { marginBottom: armOpen ? 150 : 10 },
        ]}>
        <View>
          <DropDownPicker
            open={armOpen}
            // onOpen={onBackOpen}
            value={armValue}
            items={arm}
            placeholder="팔"
            setOpen={handleArmOpen}
            setValue={setArmValue}
            setItems={setArm}
            maxHeight={500} // 옵션이 많으면 잘려서 나오는데, 이때 maxHeight를 사용하여 길이를 조절하면 된다.
            onChangeValue={armOnChange} // 값이 바뀔 때마다 실행
            dropDownDirection="BOTTOM"
            // 스타일
            dropDownContainerStyle={{ ...styles.dropDownContainer }}
            arrowIconStyle={{
              width: 25,
              height: 25,
              tintColor: '#7254F5', // 원하는 색상으로 설정
            }}
            listItemContainerStyle={styles.dropdown}
            style={{ ...styles.Picker }}
            textStyle={{ ...styles.textStyle }}
            placeholderStyle={{ ...styles.placeholderStyle }}
          />
        </View>
      </View>
      {/* 하체 */}
      <View
        style={[
          styles.dropdown_container,
          { zIndex: 1000 },
          { marginTop: legOpen ? 30 : 30 },
        ]}>
        <View>
          <DropDownPicker
            open={legOpen}
            // onOpen={onBackOpen}
            value={legValue}
            items={leg}
            placeholder="하체"
            setOpen={handleLegOpen}
            setValue={setLegValue}
            setItems={setLeg}
            maxHeight={500} // 옵션이 많으면 잘려서 나오는데, 이때 maxHeight를 사용하여 길이를 조절하면 된다.
            onChangeValue={legOnChange} // 값이 바뀔 때마다 실행
            dropDownDirection="BOTTOM"
            // 스타일
            dropDownContainerStyle={{ ...styles.dropDownContainer }}
            arrowIconStyle={{
              width: 25,
              height: 25,
              tintColor: '#7254F5', // 원하는 색상으로 설정
            }}
            listItemContainerStyle={styles.dropdown}
            style={{ ...styles.Picker }}
            textStyle={{ ...styles.textStyle }}
            placeholderStyle={{ ...styles.placeholderStyle }}
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  Container: {
    width: windowWidth,
    height: windowHeight,
    backgroundColor: 'white',
    flex: 1,
    zIndex: 1000,
  },
  // 드롭다운 메뉴를 열면 아래의 컴포넌트가 먼저 나와 메뉴들이 안 보이는 현상이 있었는데
  // DropDownPicker의 부모 요소에 zIndex를 주면 메뉴가 먼저 나오게 된다.
  dropdown_container: {
    marginTop: 30,
    // zIndex: 1000,
    width: windowWidth * 0.9,
    alignSelf: 'center',
    fontWeight: 'bold',
  },
  dropdown: {
    backgroundColor: 'white',
    justifyContent: 'center',

  },
  Picker: {
    backgroundColor: '#F9F7FE',
    width: windowWidth * 0.9,
    borderWidth: 0,
    borderTopStartRadius: 10,
    borderStartEndRadius: 10,
    borderBottomStartRadius: 10,
    borderBottomEndRadius: 10,
    shadowColor: '#7254F5',
    // ios
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    // android
    elevation: 3,

  },
  dropDownContainer: {
    borderWidth: null,
    borderTopStartRadius: 10,
    borderStartEndRadius: 10,
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
    marginTop: 10,
  },
  textStyle: {
    fontSize: 20,
    textAlign: 'center',
    fontFamily: 'Pretendard-Light',
    // marginRight: 5,
  },
  placeholderStyle: {
    fontFamily: 'Pretendard-Regular',
    marginLeft: 30,
  }
});

export default CategoryNoAi;