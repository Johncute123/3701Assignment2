import React, { useState, useCallback, memo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList } from 'react-native';
import { useSelector } from 'react-redux';

const ListItem = memo(({ item, onPress }) => (
  <TouchableOpacity style={styles.listItem} onPress={onPress}>
    <View style={styles.itemContent}>
      <Text style={styles.itemText}>{item.name}</Text>
      {item.score !== undefined && (
        <View style={styles.scoreContainer}>
          <Text style={styles.scoreText}>{item.score}/100</Text>
        </View>
      )}
    </View>
  </TouchableOpacity>
));

const SectionHeader = memo(({ title, count, isExpanded, onToggle }) => (
  <TouchableOpacity style={styles.sectionHeader} onPress={onToggle}>
    <Text style={styles.sectionTitle}>{`${title} (${count})`}</Text>
    <Text style={styles.sectionToggle}>{isExpanded ? '-' : '+'}</Text>
  </TouchableOpacity>
));

const LearningListScreen = ({ navigation }) => {
  const learningList = useSelector(state => state.learningList.items);
  const [expanded, setExpanded] = useState({ current: true, finished: false });

  const currentItems = learningList.filter(item => item.status === "current");
  const finishedItems = learningList.filter(item => item.status === "finished");

  const handleItemPress = useCallback((item) => {
    navigation.navigate('LearningDetailScreen', { categoryId: item.id });
  }, [navigation]);

  const toggleSection = useCallback((sectionKey) => {
    setExpanded(prev => ({ ...prev, [sectionKey]: !prev[sectionKey] }));
  }, []);

  const renderItem = useCallback(({ item }) => (
    <ListItem item={item} onPress={() => handleItemPress(item)} />
  ), [handleItemPress]);

  const renderSection = useCallback((title, items, sectionKey) => (
    <View style={styles.section}>
      <SectionHeader
        title={title}
        count={items.length}
        isExpanded={expanded[sectionKey]}
        onToggle={() => toggleSection(sectionKey)}
      />
      {expanded[sectionKey] && (
        <FlatList
          data={items}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          scrollEnabled={false}
          removeClippedSubviews
        />
      )}
    </View>
  ), [expanded, renderItem, toggleSection]);

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
  itemContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  scoreContainer: {
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  scoreText: {
    color: '#1976D2',
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default LearningListScreen;
