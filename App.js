import React, { useEffect } from 'react'
import { NavigationContainer } from '@react-navigation/native'
import { createStackNavigator } from '@react-navigation/stack'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { Provider, useSelector, useDispatch } from 'react-redux'
import { store } from './src/store'
import DrugCategoryScreen from './Screen/DrugCategoryScreen'
import DrugListScreen from './Screen/DrugListScreen'
import DrugDetailScreen from './Screen/DrugDetailScreen'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { Text, View, Alert } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import LearningListScreen from './Screen/LearningListScreen'
import LearningDetailScreen from './Screen/LearningDetailScreen'
import UserProfileScreen from './Screen/UserProfileScreen'
import { useNavigation } from '@react-navigation/native'
import CommunityScreen from './Screen/CommunityScreen'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { setLoadedCredentials, selectToken, selectCurrentUser, selectIsAuthenticated } from './src/features/auth/authSlice'
import { getLearningList } from './src/features/learningList/learningListSlice'
import { getRecordings } from './src/features/audio/audioSlice'


const Stack = createStackNavigator()
const Tab = createBottomTabNavigator()

function Learning() {
  return (
    <Stack.Navigator initialRouteName='LearningList'>
      <Stack.Screen name='LearningList' options={{ headerShown: false }} component={LearningListScreen} />
      <Stack.Screen name='LearningDetailScreen' options={{ headerShown: false }} component={LearningDetailScreen} />
    </Stack.Navigator>
  )
}

function Community() {
    return <CommunityScreen />
}

function Drugs() {
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

function MyTabs() {
  const dispatch = useDispatch()
  const learningList = useSelector(state => state.learningList.items)
  const currentItems = learningList.filter(item => item.status === "current")
  const navigation = useNavigation()
  const isAuthenticated = useSelector(state => state.auth.isAuthenticated)
  const authToken = useSelector(selectToken)
  const currentUser = useSelector(selectCurrentUser)

  const fetchStudyRecord = async (userId, token, dispatch) => {
    console.log(`[fetchStudyRecord] Attempting to fetch study record for user: ${userId}`);
    try {
      const studyRecordResponse = await fetch(`http://localhost:3000/study-record/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      console.log(`[fetchStudyRecord] Study record response status: ${studyRecordResponse.status}`);

      if (studyRecordResponse.ok) {
        const studyRecord = await studyRecordResponse.json()
        console.log('[fetchStudyRecord] Full study record object received:', studyRecord)

        let learningItems = []
        console.log('[fetchStudyRecord] Raw items field:', studyRecord.items)

        try {
          if (typeof studyRecord.items === 'string' && studyRecord.items.trim() !== '') {
            learningItems = JSON.parse(studyRecord.items)
            console.log('[fetchStudyRecord] Parsed learning items (from string):', learningItems)
          } else if (Array.isArray(studyRecord.items)) {
            learningItems = studyRecord.items
            console.log('[fetchStudyRecord] Learning items (already array):', learningItems)
          } else {
            console.log('[fetchStudyRecord] Study record items field is not a string or array, initializing as empty.')
          }

          learningItems = learningItems.map(item => ({
            ...item,
            status: item.status || 'current',
            score: item.score || 0,
            recordings: Array.isArray(item.recordings) ? item.recordings : []
          }))
          console.log('[fetchStudyRecord] Learning items after ensuring structure:', learningItems)

          dispatch(getLearningList(learningItems))
          console.log('[fetchStudyRecord] Dispatched getLearningList with items.')

          const audioRecordings = learningItems
            .filter(item => Array.isArray(item.recordings) && item.recordings.length > 0)
            .flatMap(item => item.recordings)
            .filter(recording => recording.recordingUri)

          console.log('[fetchStudyRecord] Extracted audio recordings for dispatch:', audioRecordings)

          if (audioRecordings.length > 0) {
            dispatch(getRecordings(audioRecordings))
            console.log('[fetchStudyRecord] Dispatched getRecordings with extracted recordings.')
          } else {
            dispatch(getRecordings([]))
            console.log('[fetchStudyRecord] No audio recordings found to dispatch.')
          }

        } catch (e) {
          console.error('[fetchStudyRecord] Error parsing or processing loaded learning items:', e)
        }
      } else {
        const errorText = await studyRecordResponse.text()
        console.error('[fetchStudyRecord] Failed to fetch study record on app load:', studyRecordResponse.status, errorText)
        dispatch(getLearningList([]))
        dispatch(getRecordings([]))
      }
    } catch (error) {
      console.error('[fetchStudyRecord] Error fetching study record on app load:', error)
      dispatch(getLearningList([]))
      dispatch(getRecordings([]))
    }
  }

  useEffect(() => {
    const loadAppData = async () => {
      console.log('[loadAppData] Effect triggered. isAuthenticated:', isAuthenticated)

      if (!isAuthenticated) {
        console.log('[loadAppData] Not authenticated, attempting to load from AsyncStorage...')
        try {
          const userJson = await AsyncStorage.getItem('user')
          const token = await AsyncStorage.getItem('token')
          console.log('[loadAppData] AsyncStorage user:', userJson ? 'found' : 'not found', 'token:', token ? 'found' : 'not found')

          if (userJson && token) {
            console.log('[loadAppData] Credentials found in AsyncStorage, setting and fetching study record...')
            const user = JSON.parse(userJson)
            dispatch(setLoadedCredentials({ user, token }))
            fetchStudyRecord(user.id, token, dispatch)
          } else {
            console.log('[loadAppData] No credentials found in AsyncStorage.')
          }
        } catch (error) {
          console.error('[loadAppData] Failed to load credentials from AsyncStorage:', error)
        }
      }
      
      if (isAuthenticated && currentUser && authToken) {
        console.log('[loadAppData] Authenticated, fetching study record...')
        fetchStudyRecord(currentUser.id, authToken, dispatch)
      } else if (!isAuthenticated) {
        console.log('[loadAppData] Not authenticated and no stored credentials, clearing states.')
        dispatch(getLearningList([]))
        dispatch(getRecordings([]))
      }
    }

    loadAppData()

  }, [isAuthenticated, authToken, currentUser, dispatch])

  const handleLearningTabPress = (e) => {
    if (!isAuthenticated) {
      e.preventDefault()
      Alert.alert(
        'Login Required',
        'Please sign in to access the Learning tab',
        [
          {
            text: 'Sign In',
            onPress: () => navigation.navigate('Profile'),
          },
          {
            text: 'Cancel',
            style: 'cancel',
          },
        ]
      )
    }
  }

  return (
    <Tab.Navigator
    initialRouteName='Profile'
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName
          if (route.name === 'Drugs') {
            iconName = focused ? 'bag-add' : 'bag-add'
          } else if (route.name === 'Learning') {
            iconName = focused ? 'home' : 'home'
          } else if (route.name === 'Community') {
            iconName = focused ? 'people' : 'people'
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person'
          }
          return <Ionicons name={iconName} size={size} color={color} />
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
        listeners={{
          tabPress: handleLearningTabPress,
        }}
      />
      <Tab.Screen name='Community' component={Community} />
      <Tab.Screen name='Profile' component={UserProfileScreen} />
    </Tab.Navigator>
  )
}

function Navigation() {
  return (
    <NavigationContainer>
      <MyTabs />
    </NavigationContainer>
  )
}

export default function App() {
  return (
    <Provider store={store}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <Navigation />
      </GestureHandlerRootView>
    </Provider>
  )
}
