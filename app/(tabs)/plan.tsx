import { useMemo, useState } from 'react';
import { Image, Modal, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useHealthData } from '@/hooks/use-health-data';
import { useProfile } from '@/hooks/use-profile';

type Meal = {
  id: string;
  name: string;
  category: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  calories: number;
  protein: number; // grams
  carbs: number; // grams
  fat: number; // grams
  image?: string;
  ingredients: string[];
  steps: string[];
  prepTime: number; // minutes
  cookTime: number; // minutes
};

const mealDatabase: Meal[] = [
  {
    id: '1',
    name: 'Greek Yogurt Parfait',
    category: 'breakfast',
    calories: 320,
    protein: 20,
    carbs: 45,
    fat: 8,
    image: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400&h=300&fit=crop',
    ingredients: [
      '1 cup Greek yogurt',
      '1/2 cup fresh berries',
      '1/4 cup granola',
      '1 tbsp honey',
      '1 tbsp chia seeds',
    ],
    steps: [
      'Layer Greek yogurt in a glass or bowl',
      'Add fresh berries on top',
      'Sprinkle granola over berries',
      'Drizzle with honey',
      'Top with chia seeds and serve',
    ],
    prepTime: 5,
    cookTime: 0,
  },
  {
    id: '2',
    name: 'Avocado Toast with Eggs',
    category: 'breakfast',
    calories: 380,
    protein: 18,
    carbs: 32,
    fat: 22,
    image: 'https://images.unsplash.com/photo-1541519227354-08fa5d50c44d?w=400&h=300&fit=crop',
    ingredients: [
      '2 slices whole grain bread',
      '1 ripe avocado',
      '2 eggs',
      'Salt and pepper',
      'Red pepper flakes (optional)',
    ],
    steps: [
      'Toast bread until golden brown',
      'Mash avocado and spread on toast',
      'Fry or poach eggs to desired doneness',
      'Place eggs on avocado toast',
      'Season with salt, pepper, and red pepper flakes',
    ],
    prepTime: 5,
    cookTime: 10,
  },
  {
    id: '3',
    name: 'Overnight Oats',
    category: 'breakfast',
    calories: 350,
    protein: 15,
    carbs: 55,
    fat: 10,
    image: 'https://images.unsplash.com/photo-1570197788417-0e82375c9371?w=400&h=300&fit=crop',
    ingredients: [
      '1/2 cup rolled oats',
      '1/2 cup milk or almond milk',
      '1/2 banana, sliced',
      '1 tbsp almond butter',
      '1 tsp maple syrup',
      '1/4 tsp cinnamon',
    ],
    steps: [
      'Mix oats and milk in a jar',
      'Add banana slices',
      'Stir in almond butter and maple syrup',
      'Sprinkle with cinnamon',
      'Refrigerate overnight and enjoy in the morning',
    ],
    prepTime: 5,
    cookTime: 0,
  },
  {
    id: '4',
    name: 'Grilled Chicken Salad',
    category: 'lunch',
    calories: 420,
    protein: 35,
    carbs: 25,
    fat: 18,
    image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop',
    ingredients: [
      '4 oz grilled chicken breast',
      '2 cups mixed greens',
      '1/2 cup cherry tomatoes',
      '1/4 cup cucumber, sliced',
      '1/4 cup red onion',
      '2 tbsp olive oil vinaigrette',
    ],
    steps: [
      'Grill chicken breast until cooked through',
      'Let chicken rest, then slice',
      'Arrange mixed greens on a plate',
      'Add tomatoes, cucumber, and red onion',
      'Top with sliced chicken',
      'Drizzle with vinaigrette and serve',
    ],
    prepTime: 10,
    cookTime: 15,
  },
  {
    id: '5',
    name: 'Quinoa Buddha Bowl',
    category: 'lunch',
    calories: 450,
    protein: 18,
    carbs: 65,
    fat: 15,
    image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=300&fit=crop',
    ingredients: [
      '1 cup cooked quinoa',
      '1/2 cup chickpeas',
      '1/2 cup roasted sweet potato',
      '1/2 cup steamed broccoli',
      '1/4 avocado, sliced',
      '2 tbsp tahini dressing',
    ],
    steps: [
      'Cook quinoa according to package directions',
      'Roast sweet potato cubes at 400°F for 20 minutes',
      'Steam broccoli until tender',
      'Arrange quinoa in a bowl',
      'Top with chickpeas, sweet potato, and broccoli',
      'Add avocado and drizzle with tahini dressing',
    ],
    prepTime: 15,
    cookTime: 25,
  },
  {
    id: '6',
    name: 'Turkey Wrap',
    category: 'lunch',
    calories: 380,
    protein: 28,
    carbs: 35,
    fat: 14,
    image: 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=400&h=300&fit=crop',
    ingredients: [
      '1 large whole wheat tortilla',
      '3 oz sliced turkey',
      '1/4 cup hummus',
      '1/2 cup spinach',
      '1/4 cup bell peppers, sliced',
      '1/4 cup carrots, shredded',
    ],
    steps: [
      'Spread hummus on tortilla',
      'Layer spinach on top',
      'Add turkey slices',
      'Top with bell peppers and carrots',
      'Roll tightly and slice in half',
    ],
    prepTime: 5,
    cookTime: 0,
  },
  {
    id: '7',
    name: 'Salmon with Vegetables',
    category: 'dinner',
    calories: 520,
    protein: 42,
    carbs: 30,
    fat: 25,
    image: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400&h=300&fit=crop',
    ingredients: [
      '6 oz salmon fillet',
      '1 cup roasted vegetables (asparagus, zucchini)',
      '1/2 cup brown rice',
      '1 lemon, sliced',
      '2 tbsp olive oil',
      'Salt and pepper',
    ],
    steps: [
      'Preheat oven to 400°F',
      'Season salmon with salt, pepper, and olive oil',
      'Roast vegetables on a sheet pan for 15 minutes',
      'Add salmon to pan and cook for 12-15 minutes',
      'Cook brown rice according to package',
      'Serve salmon over rice with vegetables and lemon',
    ],
    prepTime: 10,
    cookTime: 25,
  },
  {
    id: '8',
    name: 'Lean Beef Stir-Fry',
    category: 'dinner',
    calories: 480,
    protein: 38,
    carbs: 45,
    fat: 16,
    image: 'https://images.unsplash.com/photo-1505252585461-04c69a4d8d37?w=400&h=300&fit=crop',
    ingredients: [
      '4 oz lean beef, sliced',
      '1 cup mixed vegetables (bell peppers, broccoli, carrots)',
      '1/2 cup brown rice',
      '2 tbsp low-sodium soy sauce',
      '1 tsp ginger, minced',
      '1 clove garlic, minced',
    ],
    steps: [
      'Cook brown rice according to package',
      'Heat a wok or large pan over high heat',
      'Stir-fry beef until browned, remove and set aside',
      'Add vegetables and stir-fry for 3-4 minutes',
      'Add ginger and garlic, cook for 1 minute',
      'Return beef to pan, add soy sauce, and toss',
      'Serve over brown rice',
    ],
    prepTime: 15,
    cookTime: 15,
  },
  {
    id: '9',
    name: 'Vegetarian Pasta',
    category: 'dinner',
    calories: 460,
    protein: 18,
    carbs: 72,
    fat: 12,
    image: 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=400&h=300&fit=crop',
    ingredients: [
      '2 oz whole wheat pasta',
      '1 cup marinara sauce',
      '1/2 cup mushrooms, sliced',
      '1/2 cup spinach',
      '2 tbsp parmesan cheese',
      '1 tbsp olive oil',
    ],
    steps: [
      'Cook pasta according to package directions',
      'Heat olive oil in a pan',
      'Sauté mushrooms until tender',
      'Add spinach and cook until wilted',
      'Add marinara sauce and heat through',
      'Toss with cooked pasta',
      'Top with parmesan cheese and serve',
    ],
    prepTime: 5,
    cookTime: 15,
  },
  {
    id: '10',
    name: 'Apple with Almond Butter',
    category: 'snack',
    calories: 220,
    protein: 6,
    carbs: 28,
    fat: 12,
    image: 'https://images.unsplash.com/photo-1606312619070-d48b4bc8fcc0?w=400&h=300&fit=crop',
    ingredients: ['1 medium apple', '2 tbsp almond butter'],
    steps: ['Slice apple into wedges', 'Serve with almond butter for dipping'],
    prepTime: 2,
    cookTime: 0,
  },
  {
    id: '11',
    name: 'Greek Yogurt with Berries',
    category: 'snack',
    calories: 150,
    protein: 12,
    carbs: 20,
    fat: 3,
    image: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400&h=300&fit=crop',
    ingredients: ['1 cup Greek yogurt', '1/2 cup mixed berries'],
    steps: ['Scoop yogurt into a bowl', 'Top with fresh berries'],
    prepTime: 2,
    cookTime: 0,
  },
  {
    id: '12',
    name: 'Hummus with Veggies',
    category: 'snack',
    calories: 180,
    protein: 8,
    carbs: 22,
    fat: 8,
    image: 'https://images.unsplash.com/photo-1571155326901-cadd8df22912?w=400&h=300&fit=crop',
    ingredients: ['1/4 cup hummus', '1 cup mixed vegetables (carrots, celery, bell peppers)'],
    steps: ['Cut vegetables into sticks', 'Serve with hummus for dipping'],
    prepTime: 5,
    cookTime: 0,
  },
];

export default function PlanScreen() {
  const { goals, today } = useHealthData();
  const { profile } = useProfile();
  const [selectedMeal, setSelectedMeal] = useState<Meal | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<'all' | Meal['category']>('all');

  // Calculate remaining calories for the day
  const remainingCalories = Math.max(0, goals.calories - today.calories);

  // Filter meals based on category and nutritional requirements
  const filteredMeals = useMemo(() => {
    let meals = mealDatabase;

    // Filter by category
    if (selectedCategory !== 'all') {
      meals = meals.filter((m) => m.category === selectedCategory);
    }

    // Filter by remaining calories (show meals that fit within remaining calories)
    meals = meals.filter((m) => m.calories <= remainingCalories + 200); // Allow some flexibility

    // Sort by protein content (prioritize high protein if user needs it)
    return meals.sort((a, b) => b.protein - a.protein);
  }, [selectedCategory, remainingCalories]);

  const categories: Array<{ key: 'all' | Meal['category']; label: string }> = [
    { key: 'all', label: 'All' },
    { key: 'breakfast', label: 'Breakfast' },
    { key: 'lunch', label: 'Lunch' },
    { key: 'dinner', label: 'Dinner' },
    { key: 'snack', label: 'Snacks' },
  ];

  return (
    <View style={styles.screen}>
      <ThemedText type="title" style={styles.header} lightColor="#1a1f2e">
        Meal Plan
      </ThemedText>
      <ThemedText style={styles.subtitle} lightColor="#4b5563">
        Based on your goal of {goals.calories} calories/day
      </ThemedText>

      {/* Category filter */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoryScroll}
        contentContainerStyle={styles.categoryContainer}
      >
        {categories.map((cat) => (
          <TouchableOpacity
            key={cat.key}
            style={[styles.categoryButton, selectedCategory === cat.key && styles.categoryButtonActive]}
            onPress={() => setSelectedCategory(cat.key)}
          >
            <ThemedText
              style={[styles.categoryLabel, selectedCategory === cat.key && styles.categoryLabelActive]}
              lightColor={selectedCategory === cat.key ? '#ffffff' : '#4b5563'}
            >
              {cat.label}
            </ThemedText>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Meal tiles grid */}
      <ScrollView style={styles.mealsContainer} contentContainerStyle={styles.mealsGrid}>
        {filteredMeals.map((meal) => (
          <TouchableOpacity
            key={meal.id}
            style={styles.mealTile}
            onPress={() => setSelectedMeal(meal)}
            activeOpacity={0.8}
          >
            <ThemedView style={styles.mealTileContent}>
              {meal.image && (
                <Image source={{ uri: meal.image }} style={styles.mealImage} resizeMode="cover" />
              )}
              <ThemedText type="defaultSemiBold" style={styles.mealName} lightColor="#1a1f2e">
                {meal.name}
              </ThemedText>
              <View style={styles.mealInfo}>
                <ThemedText style={styles.mealCalories} lightColor="#4b5563">
                  {meal.calories} cal
                </ThemedText>
                <ThemedText style={styles.mealMacros} lightColor="#6b7280">
                  P: {meal.protein}g • C: {meal.carbs}g • F: {meal.fat}g
                </ThemedText>
              </View>
              <ThemedText style={styles.mealTime} lightColor="#9ca3af">
                {meal.prepTime + meal.cookTime} min
              </ThemedText>
            </ThemedView>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Meal detail modal */}
      <Modal visible={selectedMeal !== null} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <ThemedView style={styles.modalContent}>
            <ScrollView>
              <View style={styles.modalHeader}>
                <ThemedText type="title" style={styles.modalTitle} lightColor="#1a1f2e">
                  {selectedMeal?.name}
                </ThemedText>
                <TouchableOpacity onPress={() => setSelectedMeal(null)} style={styles.closeButton}>
                  <ThemedText style={styles.closeButtonText} lightColor="#1a1f2e">
                    ✕
                  </ThemedText>
                </TouchableOpacity>
              </View>

              {selectedMeal && (
                <>
                  {selectedMeal.image && (
                    <Image source={{ uri: selectedMeal.image }} style={styles.modalImage} resizeMode="cover" />
                  )}
                  <View style={styles.modalStats}>
                    <View style={styles.statItem}>
                      <ThemedText style={styles.statValue} lightColor="#1a1f2e">
                        {selectedMeal.calories}
                      </ThemedText>
                      <ThemedText style={styles.statLabel} lightColor="#6b7280">
                        Calories
                      </ThemedText>
                    </View>
                    <View style={styles.statItem}>
                      <ThemedText style={styles.statValue} lightColor="#1a1f2e">
                        {selectedMeal.protein}g
                      </ThemedText>
                      <ThemedText style={styles.statLabel} lightColor="#6b7280">
                        Protein
                      </ThemedText>
                    </View>
                    <View style={styles.statItem}>
                      <ThemedText style={styles.statValue} lightColor="#1a1f2e">
                        {selectedMeal.prepTime + selectedMeal.cookTime} min
                      </ThemedText>
                      <ThemedText style={styles.statLabel} lightColor="#6b7280">
                        Total Time
                      </ThemedText>
                    </View>
                  </View>

                  <ThemedView style={styles.modalSection}>
                    <ThemedText type="subtitle" style={styles.sectionTitle} lightColor="#1a1f2e">
                      Ingredients
                    </ThemedText>
                    {selectedMeal.ingredients.map((ingredient, idx) => (
                      <View key={idx} style={styles.ingredientItem}>
                        <ThemedText style={styles.bullet} lightColor="#36c690">
                          •
                        </ThemedText>
                        <ThemedText style={styles.ingredientText} lightColor="#4b5563">
                          {ingredient}
                        </ThemedText>
                      </View>
                    ))}
                  </ThemedView>

                  <ThemedView style={styles.modalSection}>
                    <ThemedText type="subtitle" style={styles.sectionTitle} lightColor="#1a1f2e">
                      Instructions
                    </ThemedText>
                    {selectedMeal.steps.map((step, idx) => (
                      <View key={idx} style={styles.stepItem}>
                        <ThemedView style={styles.stepNumber}>
                          <ThemedText style={styles.stepNumberText} lightColor="#ffffff">
                            {idx + 1}
                          </ThemedText>
                        </ThemedView>
                        <ThemedText style={styles.stepText} lightColor="#4b5563">
                          {step}
                        </ThemedText>
                      </View>
                    ))}
                  </ThemedView>
                </>
              )}
            </ScrollView>
          </ThemedView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    padding: 20,
    paddingBottom: 8,
    fontWeight: '800',
  },
  subtitle: {
    paddingHorizontal: 20,
    paddingBottom: 16,
    fontSize: 14,
    fontWeight: '600',
  },
  categoryScroll: {
    maxHeight: 50,
  },
  categoryContainer: {
    paddingHorizontal: 20,
    gap: 10,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  categoryButtonActive: {
    backgroundColor: '#36c690',
    borderColor: '#36c690',
  },
  categoryLabel: {
    fontSize: 13,
    fontWeight: '700',
  },
  categoryLabelActive: {
    color: '#ffffff',
  },
  mealsContainer: {
    flex: 1,
  },
  mealsGrid: {
    padding: 20,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 14,
    justifyContent: 'space-between',
  },
  mealTile: {
    width: '47%',
    marginBottom: 14,
  },
  mealTileContent: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 0,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  mealImage: {
    width: '100%',
    height: 120,
    backgroundColor: '#f3f4f6',
  },
  mealName: {
    fontSize: 15,
    fontWeight: '800',
    paddingHorizontal: 14,
    paddingTop: 10,
  },
  mealInfo: {
    gap: 4,
    paddingHorizontal: 14,
  },
  mealCalories: {
    fontSize: 13,
    fontWeight: '700',
  },
  mealMacros: {
    fontSize: 11,
    fontWeight: '600',
  },
  mealTime: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 4,
    paddingHorizontal: 14,
    paddingBottom: 14,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
    padding: 0,
    overflow: 'hidden',
  },
  modalImage: {
    width: '100%',
    height: 200,
    backgroundColor: '#f3f4f6',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '800',
    flex: 1,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    fontSize: 18,
    fontWeight: '800',
  },
  modalStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 24,
    marginHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#f9fafb',
    borderRadius: 16,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '800',
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
  },
  modalSection: {
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 12,
  },
  ingredientItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
    gap: 8,
  },
  bullet: {
    fontSize: 18,
    fontWeight: '800',
    marginTop: 2,
  },
  ingredientText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 20,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
    gap: 12,
  },
  stepNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#36c690',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  stepNumberText: {
    fontSize: 14,
    fontWeight: '800',
  },
  stepText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 20,
  },
});
