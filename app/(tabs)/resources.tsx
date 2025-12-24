
import { router } from 'expo-router';
import { Alert, Image, Linking, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import React from 'react';

type ResourceCategory = 'Nutrition' | 'Exercise' | 'Mental health';

type Resource = {
  title: string;
  url: string;
  tag: string;
  category: ResourceCategory;
  image: string;
};

type VideoTutorial = {
  id: string;
  title: string;
  channel: string;
};

const resources: Resource[] = [
  // Nutrition
  {
    title: 'Healthy Plate: Nutrition Basics',
    url: 'https://www.hsph.harvard.edu/nutritionsource/healthy-eating-plate/',
    tag: 'Nutrition',
    category: 'Nutrition',
    image: 'https://img.youtube.com/vi/n5u8CTYPvV8/hqdefault.jpg',
  },
  {
    title: 'Hydration 101',
    url: 'https://www.hsph.harvard.edu/nutritionsource/water/',
    tag: 'Hydration',
    category: 'Nutrition',
    image: 'https://img.youtube.com/vi/9iMGFqMmUFs/hqdefault.jpg',
  },
  {
    title: 'Mediterranean Diet Overview',
    url: 'https://www.hsph.harvard.edu/nutritionsource/healthy-weight/diet-reviews/mediterranean-diet/',
    tag: 'Heart-healthy',
    category: 'Nutrition',
    image: 'https://img.youtube.com/vi/3M9cPpVODKA/hqdefault.jpg',
  },
  {
    title: 'Understanding Food Labels',
    url: 'https://www.fda.gov/food/nutrition-education-resources-materials/new-nutrition-facts-label',
    tag: 'Food labels',
    category: 'Nutrition',
    image: 'https://img.youtube.com/vi/9P3GxJ2Bn4U/hqdefault.jpg',
  },
  {
    title: 'Fiber and Gut Health',
    url: 'https://www.hsph.harvard.edu/nutritionsource/carbohydrates/fiber/',
    tag: 'Gut health',
    category: 'Nutrition',
    image: 'https://img.youtube.com/vi/Z1-q3j4jM0U/hqdefault.jpg',
  },
  {
    title: 'Healthy Snacking Tips',
    url: 'https://www.eatright.org/health/wellness/healthy-eating/healthy-snacks',
    tag: 'Snacks',
    category: 'Nutrition',
    image: 'https://img.youtube.com/vi/8pCi5s9cV1Y/hqdefault.jpg',
  },

  // Exercise
  {
    title: 'CDC Physical Activity Guidelines',
    url: 'https://www.cdc.gov/physicalactivity/basics/index.htm',
    tag: 'Activity basics',
    category: 'Exercise',
    image: 'https://img.youtube.com/vi/ml6cT4AZdqI/hqdefault.jpg',
  },
  {
    title: 'Beginner Strength & Balance Tips',
    url: 'https://www.cdc.gov/physicalactivity/basics/older_adults/index.htm',
    tag: 'Strength & balance',
    category: 'Exercise',
    image: 'https://img.youtube.com/vi/UBMk30rjy0o/hqdefault.jpg',
  },
  {
    title: 'Stretching for Flexibility',
    url: 'https://www.acefitness.org/resources/everyone/blog/7441/stretching-101-how-to-stretch-like-a-pro/',
    tag: 'Stretching',
    category: 'Exercise',
    image: 'https://img.youtube.com/vi/V8vT6N_xGSM/hqdefault.jpg',
  },
  {
    title: 'Walking for Health',
    url: 'https://www.cdc.gov/physicalactivity/walking/index.htm',
    tag: 'Walking',
    category: 'Exercise',
    image: 'https://img.youtube.com/vi/Q5g0h2KB7hM/hqdefault.jpg',
  },
  {
    title: 'Beginner Cardio Workouts',
    url: 'https://www.heart.org/en/healthy-living/fitness/fitness-basics/a-beginners-guide-to-working-out',
    tag: 'Cardio',
    category: 'Exercise',
    image: 'https://img.youtube.com/vi/H3jJ29oE8Zg/hqdefault.jpg',
  },
  {
    title: 'Desk and Workplace Exercises',
    url: 'https://www.mayoclinic.org/healthy-lifestyle/adult-health/multimedia/office-stretches/vid-20084795',
    tag: 'At work',
    category: 'Exercise',
    image: 'https://img.youtube.com/vi/5oUf7F98EKs/hqdefault.jpg',
  },

  // Mental health
  {
    title: 'Sleep Hygiene Tips',
    url: 'https://www.sleepfoundation.org/sleep-hygiene',
    tag: 'Sleep',
    category: 'Mental health',
    image: 'https://img.youtube.com/vi/gy1iH_Gxn0Q/hqdefault.jpg',
  },
  {
    title: 'Managing Stress & Anxiety',
    url: 'https://www.apa.org/topics/stress',
    tag: 'Stress',
    category: 'Mental health',
    image: 'https://img.youtube.com/vi/lr5dDmTyrdc/hqdefault.jpg',
  },
  {
    title: 'Mindfulness for Beginners',
    url: 'https://www.mindful.org/meditation/mindfulness-getting-started/',
    tag: 'Mindfulness',
    category: 'Mental health',
    image: 'https://img.youtube.com/vi/w6T02g5hnT4/hqdefault.jpg',
  },
  {
    title: 'Coping With Anxiety',
    url: 'https://www.anxietycanada.com/articles/facing-fears/',
    tag: 'Anxiety',
    category: 'Mental health',
    image: 'https://img.youtube.com/vi/alQw5A-wXNI/hqdefault.jpg',
  },
  {
    title: 'Building Resilience',
    url: 'https://www.apa.org/topics/resilience',
    tag: 'Resilience',
    category: 'Mental health',
    image: 'https://img.youtube.com/vi/NWH8N-BvhAw/hqdefault.jpg',
  },
  {
    title: 'Social Connection & Well-being',
    url: 'https://www.cdc.gov/aging/publications/features/lonely-older-adults.html',
    tag: 'Connection',
    category: 'Mental health',
    image: 'https://img.youtube.com/vi/rkZl2gsLUp4/hqdefault.jpg',
  },
];

const videoTutorials: VideoTutorial[] = [
  {
    id: 'uAqRC7gA4Ok',
    title: '10-Min Bodyweight Workout for Starters',
    channel: 'Level 1 Fitness',
  },
  {
    id: 'v7AYKMP6rOE',
    title: 'Yoga for Complete Beginners',
    channel: 'Yoga With Adriene',
  },
  {
    id: 'ml6cT4AZdqI',
    title: '20-Min Full Body Workout at Home',
    channel: 'MadFit',
  },
  {
    id: 'UBMk30rjy0o',
    title: '10-Min Daily Full-Body Stretch Routine',
    channel: 'MadFit',
  },
  {
    id: 'H3jJ29oE8Zg',
    title: '15-Min Beginner Cardio Workout',
    channel: 'Fitness Blender',
  },
  {
    id: 'Q5g0h2KB7hM',
    title: '10-Min Low Impact Walking Workout',
    channel: 'Walk at Home',
  },
  {
    id: 'qXr7xHZUxvY',
    title: '20-Min Standing Abs Workout',
    channel: 'MadFit',
  },
];

export default function ResourcesScreen() {
  const [selectedCategory, setSelectedCategory] = React.useState<ResourceCategory>('Nutrition');

  const filteredResources = resources.filter((r) => r.category === selectedCategory);

  const handleMealLogPress = () => {
    router.push('/meal-log');
  };

  const handleExerciseLogPress = () => {
    router.push('/exercise-log');
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <ThemedText type="title" style={styles.screenTitle} lightColor="#1a1f2e">
        Resources
      </ThemedText>

      <ThemedView style={styles.cardContainer}>
        <View style={styles.categoryRow}>
          {(['Nutrition', 'Exercise', 'Mental health'] as ResourceCategory[]).map((category) => {
            const isActive = selectedCategory === category;
            return (
              <TouchableOpacity
                key={category}
                style={[styles.categoryButton, isActive && styles.categoryButtonActive]}
                onPress={() => setSelectedCategory(category)}
              >
                <ThemedText
                  type="defaultSemiBold"
                  style={[styles.categoryLabel, isActive && styles.categoryLabelActive]}
                  lightColor={isActive ? '#ffffff' : '#1f2933'}
                >
                  {category}
                </ThemedText>
              </TouchableOpacity>
            );
          })}
        </View>

        <ThemedText type="subtitle" style={styles.subtitle} lightColor="#1a1f2e">
          Featured resources
        </ThemedText>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.featuredList}
        >
          {filteredResources.map((item) => (
            <TouchableOpacity key={item.url} onPress={() => Linking.openURL(item.url)}>
              <ThemedView style={styles.resourceCard}>
                <Image source={{ uri: item.image }} style={styles.resourceImage} />
                <ThemedText type="defaultSemiBold" lightColor="#1a1f2e">
                  {item.title}
                </ThemedText>
                <ThemedText style={styles.tag} lightColor="#718096">
                  {item.tag}
                </ThemedText>
                <ThemedText style={styles.link} lightColor="#0369a1">
                  Open
                </ThemedText>
              </ThemedView>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <ThemedText type="subtitle" style={styles.videosHeading} lightColor="#1a1f2e">
          Video tutorials
        </ThemedText>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.videoList}
        >
          {videoTutorials.map((video) => (
            <TouchableOpacity
              key={video.id}
              activeOpacity={0.85}
              onPress={() => Linking.openURL(`https://www.youtube.com/watch?v=${video.id}`)}
            >
              <ThemedView style={styles.videoCard}>
                <Image
                  source={{ uri: `https://img.youtube.com/vi/${video.id}/hqdefault.jpg` }}
                  style={styles.videoThumbnail}
                />
                <ThemedText
                  numberOfLines={2}
                  style={styles.videoTitle}
                  lightColor="#111827"
                >
                  {video.title}
                </ThemedText>
                <ThemedText style={styles.videoMeta} lightColor="#6b7280">
                  {video.channel}
                </ThemedText>
              </ThemedView>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={styles.logButtonsRow}>
          <TouchableOpacity style={styles.logButton} onPress={handleMealLogPress}>
            <ThemedText type="defaultSemiBold" style={styles.logButtonText} lightColor="#ffffff">
              Meal log
            </ThemedText>
          </TouchableOpacity>
          <TouchableOpacity style={styles.logButton} onPress={handleExerciseLogPress}>
            <ThemedText type="defaultSemiBold" style={styles.logButtonText} lightColor="#ffffff">
              Exercise log
            </ThemedText>
          </TouchableOpacity>
        </View>
      </ThemedView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#f5f7fb',
  },
  content: {
    padding: 20,
    paddingBottom: 32,
    gap: 20,
  },
  screenTitle: {
    textAlign: 'center',
    fontSize: 24,
    marginTop: 4,
  },
  cardContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    gap: 16,
  },
  title: {
    marginBottom: 4,
  },
  subtitle: {
    marginBottom: 4,
  },
  categoryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    marginBottom: 8,
    gap: 10,
  },
  categoryButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  categoryButtonActive: {
    backgroundColor: '#2563eb',
    borderColor: '#2563eb',
  },
  categoryLabel: {
    fontSize: 14,
    color: '#1f2933',
    textAlign: 'center',
  },
  categoryLabelActive: {
    color: '#ffffff',
  },
  featuredList: {
    paddingVertical: 8,
    gap: 12,
  },
  resourceCard: {
    backgroundColor: '#f9fafb',
    borderRadius: 18,
    padding: 16,
    gap: 6,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginRight: 12,
    width: 220,
  },
  resourceImage: {
    width: '100%',
    height: 90,
    borderRadius: 12,
    marginBottom: 6,
  },
  tag: {
    color: '#718096',
    fontWeight: '800',
    fontSize: 13,
  },
  link: {
    color: '#0369a1',
    fontWeight: '800',
    fontSize: 15,
  },
  videosHeading: {
    marginTop: 8,
  },
  videoList: {
    paddingVertical: 4,
    gap: 12,
  },
  videoCard: {
    width: 200,
    marginRight: 12,
    borderRadius: 16,
    backgroundColor: '#f9fafb',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  videoThumbnail: {
    width: '100%',
    height: 110,
    resizeMode: 'cover',
  },
  videoTitle: {
    marginTop: 8,
    marginHorizontal: 10,
    fontSize: 14,
    fontWeight: '600',
  },
  videoMeta: {
    marginHorizontal: 10,
    marginTop: 2,
    marginBottom: 10,
    fontSize: 12,
  },
  logButtonsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  logButton: {
    flex: 1,
    backgroundColor: '#22c55e',
    borderRadius: 999,
    paddingVertical: 12,
    alignItems: 'center',
  },
  logButtonText: {
    fontSize: 14,
    color: '#ffffff',
  },
});
