import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';

const DocSubmission = () => {
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Document Submission</Text>
      
      <View style={styles.comparisonWrapper}>
        {/* Image 1 Container */}
        <View style={styles.imageContainer}>
          <Text style={styles.imageTitle}>Image 1</Text>
          <View style={styles.emptyBox}>
            <Text style={styles.placeholderText}>No image uploaded</Text>
          </View>
        </View>

        {/* Image 2 Container */}
        <View style={styles.imageContainer}>
          <Text style={styles.imageTitle}>Image 2</Text>
          <View style={styles.emptyBox}>
            <Text style={styles.placeholderText}>No image uploaded</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 30,
    color: '#333',
  },
  comparisonWrapper: {
    flexDirection: 'column',
    gap: 20,
  },
  imageContainer: {
    marginBottom: 20,
  },
  imageTitle: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 10,
    color: '#555',
  },
  emptyBox: {
    width: '100%',
    height: 300,
    borderWidth: 2,
    borderColor: '#ccc',
    borderStyle: 'dashed',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
  },
  placeholderText: {
    color: '#999',
    fontSize: 16,
  },
});

export default DocSubmission;