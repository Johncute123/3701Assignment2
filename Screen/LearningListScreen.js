import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList } from 'react-native';
import { useSelector } from 'react-redux';

const LearningListScreen = () => {
  const learningList = useSelector(state => state.learningList.items);
  const [expanded, setExpanded] = useState({
    current: true,
    finished: false,
  });

  console.log(learningList);

  const currentItems = learningList.filter(item => item.status === "current");
  const finishedItems = learningList.filter(item => item.status === "finished");

  const renderSection = (title, items, sectionKey) => {
    const isExpanded = expanded[sectionKey];

    return (
      <View style={styles.section}>
        <TouchableOpacity
          style={styles.header}
          onPress={() =>
            setExpanded(prev => ({ ...prev, [sectionKey]: !prev[sectionKey] }))
          }
        >
          <Text style={styles.headerText}>
            {`${title} (${items.length})`}
          </Text>
          <Text style={styles.headerToggle}>{isExpanded ? '-' : '+'}</Text>
        </TouchableOpacity>

        {isExpanded &&
          items.map((item, index) => (
            <Text key={index} style={styles.item}>
              {item.name}
            </Text>
          ))}
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
      padding: 10,
      backgroundColor: '#f4f4f4',
      flex: 1,
    },
    section: {
      backgroundColor: 'white',
      marginBottom: 10,
      borderRadius: 4,
      overflow: 'hidden',
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      padding: 12,
      backgroundColor: '#e0e0e0',
    },
    headerText: {
      fontWeight: 'bold',
    },
    headerToggle: {
      fontWeight: 'bold',
    },
    item: {
      padding: 12,
      borderTopWidth: 1,
      borderTopColor: '#ddd',
    },
  });
  

export default LearningListScreen;
