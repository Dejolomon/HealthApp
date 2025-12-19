import { Tabs } from 'expo-router';



import { Image } from 'react-native';



import { HapticTab } from '@/components/haptic-tab';


import { Colors } from '@/constants/theme';

import { useColorScheme } from '@/hooks/use-color-scheme';



export default function TabLayout() {

  const colorScheme = useColorScheme();



  return (

    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarShowLabel: true,
      }}>

      <Tabs.Screen

        name="index"

        options={{

          title: 'Home',

          tabBarIcon: () => (

            <Image

              source={require('../../assets/images/Home_icon.png')}

              style={{ width: 26, height: 26, resizeMode: 'contain' }}

            />

          ),

        }}

      />

      <Tabs.Screen

        name="insights"

        options={{

          title: 'Insights',

          tabBarIcon: () => (
            <Image
              source={require('../../assets/images/Insights.png')}
              style={{ width: 26, height: 26, resizeMode: 'contain' }}
            />
          ),

        }}

      />

      <Tabs.Screen
        name="plan"
        options={{
          title: 'Meal Plan',
          tabBarIcon: () => (
            <Image
              source={require('../../assets/images/Meal_Plan.png')}
              style={{ width: 26, height: 26, resizeMode: 'contain' }}
            />
          ),
        }}
      />

      <Tabs.Screen

        name="resources"

        options={{

          title: 'Resources',

          tabBarIcon: () => (

            <Image

              source={require('../../assets/images/Resources.png')}

              style={{ width: 26, height: 26, resizeMode: 'contain' }}

            />

          ),

        }}

      />

      <Tabs.Screen

        name="profile"

        options={{

          title: 'Profile',

          tabBarIcon: () => (
            <Image
              source={require('../../assets/images/Profile.png')}
              style={{ width: 26, height: 26, resizeMode: 'contain' }}
            />
          ),

        }}

      />

    </Tabs>

  );

}

