import React, {useEffect} from 'react';
import {TouchableOpacity, Text, View} from 'react-native';
import {NavigationContainer, useNavigation} from '@react-navigation/native';

import {createNativeStackNavigator} from '@react-navigation/native-stack';
import SplashScreen from 'react-native-splash-screen';

// ----------------------------------------------
import Icon from 'react-native-vector-icons/EvilIcons';

// ----------------------------------------------
import Main from './App/screens/Main';
import Login from './App/screens/Login';
import Join from './App/screens/Join';
import FindPw from './App/screens/FindPw';
import Alarm from './App/screens/Alarm';
import Feedback from './App/screens/Feedback';
import Category from './App/screens/Category';
import CategoryAi from './App/screens/CategoryAi';
import CategoryNoAi from './App/screens/CategoryNoAi';
import RecordVideo from './App/screens/RecordVideo';
import Mypage from './App/screens/Mypage';
import Changeinfo from './App/screens/Changeinfo';
import VideoSubmit from './App/screens/VideoSubmit';
import SubmitComplete from './App/screens/SubmitComplete';
import LoadingScreen from './App/screens/LoadingScreen';
import LoadingScreen2 from './App/screens/LoadingScreen2';

const App = () => {
  const Stack = createNativeStackNavigator();
  // const navigation = useNavigation();

  useEffect(() => {
    setTimeout(() => {
      SplashScreen.hide();
    }, 800); //스플래시 활성화 시간
  });

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Login"
        screenOptions={{
          contentStyle: {
            backgroundColor: '#FFFFFF',
          },
        }}>
        <Stack.Screen
          name="LoadingScreen"
          component={LoadingScreen}
          options={{
            header: () => null,
          }}
        />
        <Stack.Screen
          name="LoadingScreen2"
          component={LoadingScreen2}
          options={{
            header: () => null,
          }}
        />
        <Stack.Screen
          name="Login"
          component={Login}
          options={{
            header: () => null,
          }}
        />
        <Stack.Screen
          name="Join"
          component={Join}
          options={{
            headerTitle: '회원가입',
            headerTitleAlign: 'center',
            headerTitleStyle: {fontFamily: 'Pretendard-Regular'},
          }}
        />
        <Stack.Screen
          name="FindPw"
          component={FindPw}
          options={{
            headerTitle: '비밀번호 찾기',
            headerTitleAlign: 'center',
            headerTitleStyle: {fontFamily: 'Pretendard-Regular'},
          }}
        />
        <Stack.Screen
          name="Main"
          component={Main}
          options={{
            headerTitle: 'Main',
            headerTitleAlign: 'center',
            header: () => null,
          }}
        />
        <Stack.Screen
          name="Alarm"
          component={Alarm}
          options={() => ({
            headerTitle: '',
            // headerLeft: () => {
            //   <View>
            //     <Icon name="chevron-left" size={40} />
            //   </View>;
            // },
          })}
        />
        <Stack.Screen
          name="Feedback"
          component={Feedback}
          options={() => ({
            headerTitle: '',
          })}
        />
        <Stack.Screen name="Category" component={Category} options={{}} />
        <Stack.Screen name="CategoryAi" component={CategoryAi} options={{}} />
        <Stack.Screen
          name="CategoryNoAi"
          component={CategoryNoAi}
          options={{}}
        />
        <Stack.Screen
          name="RecordVideo"
          component={RecordVideo}
          options={{
            headerTitleAlign: 'center',
            headerTitleStyle: {fontFamily: 'Pretendard-Regular'},
            header: () => null,
          }}
        />
        <Stack.Screen
          name="VideoSubmit"
          component={VideoSubmit}
          options={{
            headerTitleAlign: 'center',
            headerTitleStyle: {fontFamily: 'Pretendard-Regular'},
          }}
        />
        <Stack.Screen
          name="SubmitComplete"
          component={SubmitComplete}
          options={{
            headerTitleAlign: 'center',
            headerTitleStyle: {fontFamily: 'Pretendard-Regular'},
            header: () => null,
          }}
        />
        <Stack.Screen
          name="Mypage"
          component={Mypage}
          options={{
            headerTitleAlign: 'center',
            headerTitleStyle: {fontFamily: 'Pretendard-Regular'},
          }}
        />
        <Stack.Screen
          name="Changeinfo"
          component={Changeinfo}
          options={{
            headerTitleAlign: 'center',
            headerTitleStyle: {fontFamily: 'Pretendard-Light'},
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
