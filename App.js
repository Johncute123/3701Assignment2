import React, { useEffect } from 'react'
import { NavigationContainer } from '@react-navigation/native'
import { createStackNavigator } from '@react-navigation/stack'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { Provider, useSelector } from 'react-redux'
import { store } from './src/store'
import DrugCategoryScreen from './Screen/DrugCategoryScreen'
import DrugListScreen from './Screen/DrugListScreen'
import DrugDetailScreen from './Screen/DrugDetailScreen'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { Text, View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import LearningListScreen from './Screen/LearningListScreen'
import LearningDetailScreen from './Screen/LearningDetailScreen'
import { drugData } from './resources/resource'
import { getRecordings } from './src/features/audio/audioSlice'
import { useDispatch } from 'react-redux'
const Stack = createStackNavigator()

const Tab = createBottomTabNavigator()

function Learning () {
  return (
    <Stack.Navigator initialRouteName='LearningList'>
      <Stack.Screen name='LearningList' component={LearningListScreen} />
      <Stack.Screen name='LearningDetailScreen' component={LearningDetailScreen} />
    </Stack.Navigator>

  )
}

function Community () {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Text>Community</Text>
    </View>
  )
}

function Profile () {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Text>Profile</Text>
    </View>
  )
}

function Drugs () {
  return (
    <Stack.Navigator initialRouteName='DrugCategory'>
      <Stack.Screen
        name='DrugCategory'
        component={DrugCategoryScreen}
        options={{ title: 'Categories' }}
      />
      <Stack.Screen
        name='DrugList'
        component={DrugListScreen}
        options={{ title: 'Drugs in Categories' }}
      />
      <Stack.Screen
        name='DrugDetail'
        component={DrugDetailScreen}
        options={{ title: 'Drug Details' }}
      />
    </Stack.Navigator>
  )
}

function MyTabs () {
  const dispatch = useDispatch()
  const learningList = useSelector(state => state.learningList.items);
  const currentItems = learningList.filter(item => item.status === "current");
  console.log(currentItems);
  const audio = useSelector(state => state.audio.recordings);
  console.log('audio', audio)
  useEffect(() => {
    let newSounds = []
    for (let i = 0; i < drugData.length; i++) {
      for (let j = 0; j < drugData[i].sounds.length; j++) {
        newSounds.push({
          ...drugData[i].sounds[j],
          drugId: drugData[i].id,
          drugName: drugData[i].name,
          recordingUri: audio.find(item => item.drugId === drugData[i].id && item.drugName === drugData[i].name)?.recordingUri
        })
      }
    }
    dispatch(getRecordings(newSounds))
  }, [])
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === 'Drugs') {
            iconName = focused ? 'bag-add' : 'bag-add';
          } else if (route.name === 'Learning') {
            iconName = focused ? 'home' : 'home';
          } else if (route.name === 'Community') {
            iconName = focused ? 'people' : 'people';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person';
          }
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: 'blue',
        tabBarInactiveTintColor: 'gray',
      })}
    >
      <Tab.Screen name='Drugs' component={Drugs} />
      <Tab.Screen
        name='Learning'
        component={Learning}
        options={{
          tabBarBadge: currentItems.length > 0 ? currentItems.length : null,
        }}
      />
      <Tab.Screen name='Community' component={Community} />
      <Tab.Screen name='Profile' component={Profile} />
    </Tab.Navigator>
  );
}

export default function App () {
  return (
    <Provider store={store}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <NavigationContainer>
          <MyTabs />
        </NavigationContainer>
      </GestureHandlerRootView>
    </Provider>
  )
}
