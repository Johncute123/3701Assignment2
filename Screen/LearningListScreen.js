import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList } from 'react-native';
import { useSelector } from 'react-redux';

const LearningListScreen = ({ navigation }) => {
  const learningList = useSelector(state => state.learningList.items);
  const [expanded, setExpanded] = useState({
    current: true,
    finished: false,
  });

  const currentItems = learningList.filter(item => item.status === "current");
  const finishedItems = learningList.filter(item => item.status === "finished");

  const renderSection = (title, items, sectionKey) => {
    const isExpanded = expanded[sectionKey];

    const renderItem = ({ item }) => (
      <TouchableOpacity
        style={styles.listItem}
        onPress={() => navigation.navigate('LearningDetailScreen', { categoryId: item.id })}
      >
        <Text style={styles.itemText}>{item.name}</Text>
      </TouchableOpacity>
    );

    return (
      <View style={styles.section}>
        <TouchableOpacity
          style={styles.sectionHeader}
          onPress={() =>
            setExpanded(prev => ({ ...prev, [sectionKey]: !prev[sectionKey] }))
          }
        >
          <Text style={styles.sectionTitle}>{`${title} (${items.length})`}</Text>
          <Text style={styles.sectionToggle}>{isExpanded ? '-' : '+'}</Text>
        </TouchableOpacity>

        {isExpanded && (
          <FlatList
            data={items}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
          />
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {renderSection('Current Learning', currentItems, 'current')}
      {renderSection('Finished', finishedItems, 'finished')}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#eee',
    paddingVertical: 8,
  },
  section: {
    backgroundColor: '#fff',
    marginBottom: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 12,
    backgroundColor: '#ddd',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  sectionToggle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  listItem: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  itemText: {
    fontSize: 15,
  },
});

export default LearningListScreen;
