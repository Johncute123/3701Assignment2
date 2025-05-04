import React from 'react'
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
  const learningList = useSelector(state => state.learningList.items);
  const currentItems = learningList.filter(item => item.status === "current");
  console.log(currentItems);
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
