import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { Tabs, router } from 'expo-router';
import { Home, Users, QrCode, MessageSquare, Menu, Bell } from 'lucide-react-native';
import * as SecureStore from 'expo-secure-store';
import TourOverlay from '@/components/dashboard/TourOverlay';
// import FloatingContactButtons from '@/components/dashboard/FloatingContactButtons';

export default function TabLayout() {
  const [checkingAuth, setCheckingAuth] = React.useState(true);

  React.useEffect(() => {
    SecureStore.getItemAsync('exhibitorToken')
      .then((token) => {
        if (!token) {
          router.replace('/(auth)/login');
        }
      })
      .finally(() => setCheckingAuth(false));
  }, []);

  if (checkingAuth) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#23471d" />
      </View>
    );
  }

  return (
    <>
      <Tabs screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#23471d',
        tabBarInactiveTintColor: '#9ca3af',
        tabBarStyle: {
          backgroundColor: '#ffffff',
          borderTopWidth: 1,
          borderTopColor: '#f3f4f6',
          paddingBottom: 8,
          paddingTop: 8,
          minHeight: 65,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        }
      }}>
        <Tabs.Screen
          name="home"
          options={{
            title: 'Home',
            tabBarIcon: ({ color, size }) => (
              // @ts-ignore
              <Home color={color} size={size} />
            )
          }}
        />
        <Tabs.Screen
          name="meetings"
          options={{
            title: 'Meetings',
            tabBarIcon: ({ color, size }) => (
              // @ts-ignore
              <Users color={color} size={size} />
            )
          }}
        />
        <Tabs.Screen
          name="scanner"
          options={{
            title: 'Scan',
            tabBarIcon: ({ color, size }) => (
              <View className="bg-ihwe-green p-3 rounded-full -mt-6 shadow-lg border-4 border-white">
                {/* @ts-ignore */}
                <QrCode color="#ffdd00" size={28} />
              </View>
            ),
            tabBarLabel: () => null,
          }}
        />
        <Tabs.Screen
          name="chat"
          options={{
            title: 'Chat',
            tabBarIcon: ({ color, size }) => (
              // @ts-ignore
              <MessageSquare color={color} size={size} />
            )
          }}
        />
        <Tabs.Screen
          name="more"
          options={{
            title: 'Menu',
            tabBarIcon: ({ color, size }) => (
              // @ts-ignore
              <Menu color={color} size={size} />
            )
          }}
        />
        <Tabs.Screen
          name="reminders"
          options={{
            href: null,
            title: 'Alerts'
          }}
        />
        <Tabs.Screen
          name="my-leads"
          options={{
            href: null,
            title: 'My Leads'
          }}
        />
        <Tabs.Screen
          name="myevent"
          options={{
            href: null,
            title: 'My Event'
          }}
        />
        <Tabs.Screen
          name="relationship-manager"
          options={{
            href: null,
            title: 'Relationship Manager'
          }}
        />
        <Tabs.Screen
          name="stall-information"
          options={{
            href: null,
            title: 'Stall Information'
          }}
        />
        <Tabs.Screen
          name="invoices"
          options={{
            href: null,
            title: 'Invoices & Receipts'
          }}
        />
        <Tabs.Screen
          name="add-on-services"
          options={{
            href: null,
            title: 'Add On Services'
          }}
        />
        <Tabs.Screen
          name="passes-and-hospitality"
          options={{
            href: null,
            title: 'Passes & Hospitality'
          }}
        />
        <Tabs.Screen
          name="profile-details"
          options={{
            href: null,
            title: 'Profile Details'
          }}
        />
        <Tabs.Screen
          name="my-products"
          options={{
            href: null,
            title: 'My Products'
          }}
        />
        <Tabs.Screen
          name="e-promotion"
          options={{
            href: null,
            title: 'E-Promotion'
          }}
        />
        <Tabs.Screen
          name="policy/[id]"
          options={{
            href: null,
            title: 'Policy'
          }}
        />
        <Tabs.Screen
          name="buyers-management"
          options={{
            href: null,
            title: 'Buyers Management'
          }}
        />
        <Tabs.Screen
          name="make-payment"
          options={{
            href: null,
            title: 'Make Payment'
          }}
        />
        <Tabs.Screen
          name="msme-documentation"
          options={{
            href: null,
            title: 'MSME Documentation'
          }}
        />
        <Tabs.Screen
          name="become-seller"
          options={{
            href: null,
            title: 'Become a Seller'
          }}
        />
        <Tabs.Screen
          name="feedback"
          options={{
            href: null,
            title: 'Feedback'
          }}
        />
        <Tabs.Screen
          name="document-center"
          options={{
            href: null,
            title: 'Document Center'
          }}
        />
      </Tabs>
      <TourOverlay />
      {/* <FloatingContactButtons /> */}
    </>
  );
}
