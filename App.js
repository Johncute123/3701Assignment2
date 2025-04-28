import React from 'react';
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import DrugCategoryScreen from "./Screen/DrugCategoryScreen";
import DrugListScreen from "./Screen/DrugListScreen";
import DrugDetailScreen from "./Screen/DrugDetailScreen";

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="DrugCategory">
        <Stack.Screen 
          name="DrugCategory" 
          component={DrugCategoryScreen}
          options={{ title: 'Drug Categories' }}
        />
        <Stack.Screen 
          name="DrugList" 
          component={DrugListScreen}
          options={{ title: 'Drugs in Categories' }}
        />
        <Stack.Screen 
          name="DrugDetail" 
          component={DrugDetailScreen}
          options={{ title: 'Drug Details' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
} 