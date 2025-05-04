import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { drugData, drugCategory } from '../resources/resource.js'

export default function DrugCategoryScreen({ navigation }) {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    // console.log('drugData', drugData
    const categoryCounts = {};
    drugData.forEach(drug => {
      drug.categories.forEach(category => {
        categoryCounts[category] = (categoryCounts[category] || 0) + 1;
      });
    });
    
    const categoryList = Object.entries(categoryCounts).map(([id, count]) => ({
      id,
      name: getCategoryName(id),
      count
    }));

    setCategories(categoryList);
  }, []);

  const getCategoryName = (id) => {
    return drugCategory[id]?.name || 'Unknown Category';
  };

  const renderCategoryItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.categoryItem}
      onPress={() => navigation.navigate('DrugList', { categoryId: item.id })}
    >
      <Text style={styles.categoryName}>{item.name}</Text>
      <Text style={styles.categoryCount}>{item.count}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={categories}
        renderItem={renderCategoryItem}
        keyExtractor={(item) => item.id}
        style={styles.list}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
    
  list: {
    flex: 1,
  },
  categoryItem: {
    width: '100%',
    padding: 15,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    marginBottom: 10,
    justifyContent: 'space-between',
    alignItems: 'center',
    flexDirection: 'row',
  },
  categoryName: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  categoryCount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
  },
});