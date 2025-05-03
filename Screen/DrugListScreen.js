import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { drugData } from '../resources/resource.js';

export default function DrugListScreen({ route, navigation }) {
  const { categoryId } = route.params;
  const [drugs, setDrugs] = useState([]);

  useEffect(() => {
    const filteredDrugs = drugData.filter(drug => 
      drug.categories.includes(categoryId)
    );
    setDrugs(filteredDrugs);
  }, [categoryId]);

  const renderDrugItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.drugItem}
      onPress={() => navigation.navigate('DrugDetail', { drugId: item.id })}
    >
      <Text style={styles.drugName}>{item.name}</Text>
      {item.other_names.length > 0 && (
        <Text style={styles.otherNames}>
          ({item.other_names.join(', ')})
        </Text>
      )}
      <Text style={styles.drugDesc} numberOfLines={2}>{item.desc}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={drugs}
        renderItem={renderDrugItem}
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
  drugItem: {
    padding: 15,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    marginBottom: 10,
  },
  drugName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  otherNames: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    fontStyle: 'italic',
  },
  drugDesc: {
    fontSize: 14,
    color: '#333',
  },
});