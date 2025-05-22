import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { useSelector } from 'react-redux';

const RankingItem = ({ item, index, isCurrentUser }) => (
  <View style={[styles.rankingItem, isCurrentUser && styles.currentUserItem]}>
    <Text style={styles.rank}>{index + 1}</Text>
    <View style={styles.userInfo}>
      <Text style={[styles.username, isCurrentUser && styles.currentUserText]}>{item.user.username}</Text>
      <Text style={styles.gender}>{item.user.gender}</Text>
    </View>
    <View style={styles.progressContainer}>
      <Text style={[styles.progressText, isCurrentUser && styles.currentUserText]}>
        {item.totalScore} ({item.currentLearning}) ({item.finishedLearning})
      </Text>
    </View>
  </View>
);

const CommunityScreen = () => {
  const [loading, setLoading] = useState(true);
  const [rankings, setRankings] = useState([]);
  const currentUser = useSelector(state => state.auth.user);
  const learningList = useSelector(state => state.learningList.items);
  const authToken = useSelector(state => state.auth.token);

  useEffect(() => {
    const fetchRankings = async () => {
      try {
        setLoading(true);
        const response = await fetch('http://localhost:3000/study-record', {
          headers: {
            'Authorization': `Bearer ${authToken}`,
          },
        }); 
        if (!response.ok) throw new Error('Network response was not ok');
        let data = await response.json();
        let sorted = data.sort((a, b) => b.totalScore - a.totalScore);

        // Always include current user's data if they're logged in
        if (currentUser) {
          const currentLearning = learningList.filter(item => item.status === 'current').length;
          const finished = learningList.filter(item => item.status === 'finished').length;
          const totalScore = learningList.reduce((sum, item) => sum + (item.score || 0), 0);

          const currentUserRanking = {
            user: currentUser,
            totalScore: totalScore, 
            currentLearning: currentLearning, 
            finishedLearning: finished, 
          };
          
          // Remove existing entry for current user if it exists
          sorted = sorted.filter(r => r.user.id !== currentUser.id);
          // Add current user's data
          sorted = [...sorted, currentUserRanking];
          // Sort again
          sorted.sort((a, b) => b.totalScore - a.totalScore);
        }

        setRankings(sorted);
      } catch (error) {
        console.error('Error fetching rankings:', error);
        setRankings([]);
      } finally {
        setLoading(false);
      }
    };
    
    if (authToken) {
      fetchRankings();
    }
  }, [currentUser, learningList, authToken]); 

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2196F3" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Student Community</Text>
      </View>
      <View style={styles.columnHeaders}>
        <Text style={styles.rankHeader}>Rank</Text>
        <Text style={styles.nameHeader}>Name</Text>
        <Text style={styles.genderHeader}>Gender</Text>
        <Text style={styles.progressHeader}>Progress*</Text>
      </View>
      <FlatList
        data={rankings}
        renderItem={({ item, index }) => (
          <RankingItem 
            item={item} 
            index={index} 
            isCurrentUser={currentUser && item.user.id === currentUser.id}
          />
        )}
        keyExtractor={(item, index) => `rankings-${item.user?.id || index}`}
        contentContainerStyle={styles.listContainer}
      />
      <Text style={styles.note}>
        * The Progress shows Total Score (Current Learning) (Finished)
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    padding: 16,
    backgroundColor: '#2196F3',
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
  columnHeaders: {
    flexDirection: 'row',
    padding: 16,
    paddingBottom: 8,
    backgroundColor: '#f8f9fa',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  rankHeader: {
    width: 40,
    fontSize: 14,
    fontWeight: 'bold',
    color: '#666',
  },
  nameHeader: {
    flex: 1,
    fontSize: 14,
    fontWeight: 'bold',
    color: '#666',
    marginLeft: 8,
  },
  genderHeader: {
    width: 80,
    fontSize: 14,
    fontWeight: 'bold',
    color: '#666',
    textAlign: 'center',
  },
  progressHeader: {
    width: 120,
    fontSize: 14,
    fontWeight: 'bold',
    color: '#666',
    textAlign: 'center',
  },
  listContainer: {
    padding: 16,
  },
  rankingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    marginBottom: 8,
  },
  currentUserItem: {
    backgroundColor: '#e3f2fd',
    borderWidth: 2,
    borderColor: '#2196F3',
  },
  rank: {
    fontSize: 18,
    fontWeight: 'bold',
    width: 40,
    textAlign: 'center',
  },
  userInfo: {
    flex: 1,
    marginLeft: 8,
  },
  username: {
    fontSize: 16,
    fontWeight: '500',
  },
  currentUserText: {
    color: '#2196F3',
    fontWeight: 'bold',
  },
  gender: {
    fontSize: 14,
    color: '#666',
  },
  progressContainer: {
    width: 120,
    alignItems: 'center',
  },
  progressText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2196F3',
  },
  note: {
    fontSize: 12,
    color: '#666',
    marginTop: 8,
    marginLeft: 16,
  },
});

export default CommunityScreen;