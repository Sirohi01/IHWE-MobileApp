import React, { useState, useEffect } from 'react';
import { View, TouchableOpacity, Linking, StyleSheet, Animated } from 'react-native';
import { Phone, MessageCircle, X } from 'lucide-react-native';
import { apiClient } from '@/core/api/axios';

export default function FloatingContactButtons() {
  const [expanded, setExpanded] = useState(false);
  const [whatsappNumber, setWhatsappNumber] = useState('9654900525');
  const [whatsappMessage, setWhatsappMessage] = useState('Hello! I would like to know more about the International Health & Wellness Expo 2026.');

  useEffect(() => {
    const fetchSocialConfig = async () => {
      try {
        const res = await apiClient.get('/social-config');
        if (res.data?.success && res.data?.data) {
          if (res.data.data.whatsappNumber) setWhatsappNumber(res.data.data.whatsappNumber);
          if (res.data.data.whatsappMessage) setWhatsappMessage(res.data.data.whatsappMessage);
        }
      } catch (e) {
        console.log('Using default whatsapp details');
      }
    };
    fetchSocialConfig();
  }, []);

  const openWhatsApp = () => {
    const cleanPhone = whatsappNumber.replace(/\D/g, "");
    const url = `whatsapp://send?phone=+91${cleanPhone}&text=${encodeURIComponent(whatsappMessage)}`;
    Linking.canOpenURL(url)
      .then((supported) => {
        if (!supported) {
          Linking.openURL(`https://wa.me/91${cleanPhone}?text=${encodeURIComponent(whatsappMessage)}`);
        } else {
          return Linking.openURL(url);
        }
      })
      .catch((err) => console.error('An error occurred', err));
  };

  const openDialer = () => {
    const cleanPhone = whatsappNumber.replace(/\D/g, "");
    Linking.openURL(`tel:+91${cleanPhone}`);
  };

  return (
    <View style={styles.container}>
      {expanded && (
        <View style={styles.menu}>
          <TouchableOpacity style={[styles.button, styles.whatsapp]} onPress={openWhatsApp}>
            {/* @ts-ignore */}
            <MessageCircle color="white" size={16} />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.button, styles.call]} onPress={openDialer}>
            {/* @ts-ignore */}
            <Phone color="white" size={16} />
          </TouchableOpacity>
        </View>
      )}

      <TouchableOpacity
        style={[styles.mainButton, expanded ? styles.mainActive : null]}
        onPress={() => setExpanded(!expanded)}
      >
        {/* @ts-ignore */}
        {expanded ? <X color="white" size={20} /> : <MessageCircle color="white" size={20} />}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 90,
    right: 20,
    alignItems: 'center',
    zIndex: 9999,
  },
  menu: {
    marginBottom: 10,
    alignItems: 'center',
    gap: 8,
  },
  button: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  whatsapp: {
    backgroundColor: '#25D366',
  },
  call: {
    backgroundColor: '#007AFF',
  },
  mainButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#059669',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 6,
  },
  mainActive: {
    backgroundColor: '#dc2626',
  }
});
