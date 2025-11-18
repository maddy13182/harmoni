import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';

interface HomeScreenProps {
  navigation?: any; // Will be properly typed with navigation once we set it up
}

export default function HomeScreen({ navigation }: HomeScreenProps) {
  const upcomingEvents: string[] = [
    // Mock data - will be replaced with actual Foundry data
  ];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Family Calendar</Text>
        <Text style={styles.subtitle}>Welcome back!</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionsGrid}>
          <TouchableOpacity style={styles.actionCard}>
            <Text style={styles.actionIcon}>📅</Text>
            <Text style={styles.actionText}>View Calendar</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionCard}>
            <Text style={styles.actionIcon}>➕</Text>
            <Text style={styles.actionText}>Add Event</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionCard}>
            <Text style={styles.actionIcon}>👨‍👩‍👧‍👦</Text>
            <Text style={styles.actionText}>Family Members</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionCard}>
            <Text style={styles.actionIcon}>⚙️</Text>
            <Text style={styles.actionText}>Settings</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Upcoming Events</Text>
        {upcomingEvents.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No upcoming events</Text>
            <Text style={styles.emptyStateSubtext}>
              Add your first event to get started!
            </Text>
          </View>
        ) : (
          upcomingEvents.map((event, index) => (
            <View key={index} style={styles.eventPreview}>
              <Text style={styles.eventPreviewTitle}>{event}</Text>
            </View>
          ))
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Family Activity</Text>
        <View style={styles.activityCard}>
          <Text style={styles.activityText}>
            Connect with Palantir Foundry to see family activity
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#007AFF',
    padding: 30,
    paddingTop: 60,
    paddingBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: '#ffffff',
    opacity: 0.9,
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 15,
    color: '#333',
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionCard: {
    backgroundColor: '#ffffff',
    width: '48%',
    padding: 20,
    borderRadius: 15,
    alignItems: 'center',
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionIcon: {
    fontSize: 40,
    marginBottom: 10,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
  },
  emptyState: {
    backgroundColor: '#ffffff',
    padding: 30,
    borderRadius: 15,
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 5,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  eventPreview: {
    backgroundColor: '#ffffff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  eventPreviewTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  activityCard: {
    backgroundColor: '#ffffff',
    padding: 20,
    borderRadius: 15,
    alignItems: 'center',
  },
  activityText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
});
