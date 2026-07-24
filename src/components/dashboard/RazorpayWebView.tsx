import React, { useRef, useState } from 'react';
import { View, Modal, TouchableOpacity, ActivityIndicator, Text, Linking } from 'react-native';
import { WebView } from 'react-native-webview';
import { X, AlertCircle } from 'lucide-react-native';
import { RAZORPAY_KEY_ID } from '@/core/config/env';

interface RazorpayWebViewProps {
  visible: boolean;
  orderId: string;
  amount: number;
  keyId?: string;
  currency?: string;
  name?: string;
  email?: string;
  contact?: string;
  onClose: () => void;
  onSuccess: (data: any) => void;
  onFailed: (error: any) => void;
}

export function RazorpayWebView({
  visible,
  orderId,
  amount,
  keyId,
  currency = 'INR',
  name = '',
  email = '',
  contact = '',
  onClose,
  onSuccess,
  onFailed
}: RazorpayWebViewProps) {
  const webViewRef = useRef<WebView>(null);
  const [hasError, setHasError] = useState(false);
  const [loading, setLoading] = useState(true);

  // Reset state when modal opens
  const handleShow = () => {
    setHasError(false);
    setLoading(true);
  };

  // Escape values to prevent template literal / JS injection issues
  const safe = (v: string) => String(v || '').replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/`/g, '\\`');
  const checkoutKeyId = keyId || RAZORPAY_KEY_ID;

  const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <title>Secure Checkout</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    html, body {
      width: 100%; height: 100%;
      background: #f1f5f9;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      display: flex; align-items: center; justify-content: center;
    }
    .container {
      text-align: center; padding: 24px;
    }
    .spinner {
      width: 48px; height: 48px;
      border: 4px solid #e2e8f0;
      border-top-color: #1a3a7c;
      border-radius: 50%;
      animation: spin 0.9s linear infinite;
      margin: 0 auto 16px;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
    .label { color: #64748b; font-size: 14px; font-weight: 600; }
    .amount { color: #1a3a7c; font-size: 22px; font-weight: 800; margin-top: 8px; }
  </style>
</head>
<body>
  <div class="container" id="loading-view">
    <div class="spinner"></div>
    <p class="label">Opening Secure Checkout...</p>
    <p class="amount">${currency} ${Number(amount).toLocaleString('en-IN')}</p>
  </div>

  <script>
    function notifyRN(payload) {
      try {
        window.ReactNativeWebView.postMessage(JSON.stringify(payload));
      } catch(e) {}
    }

    function loadRazorpay() {
      if (!"${safe(checkoutKeyId)}") {
        notifyRN({ event: 'error', data: 'Razorpay key is not configured for this payment.' });
        return;
      }
      var script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = function() { openCheckout(); };
      script.onerror = function() {
        notifyRN({ event: 'error', data: 'Failed to load Razorpay SDK. Please check internet connection.' });
      };
      document.head.appendChild(script);
    }

    function openCheckout() {
      var options = {
        key: "${safe(checkoutKeyId)}",
        amount: ${Math.round(amount * 100)},
        currency: "${safe(currency)}",
        name: "IHWE 2026",
        description: "Exhibition Pass / Stall Payment",
        order_id: "${safe(orderId)}",
        prefill: {
          name: "${safe(name)}",
          email: "${safe(email)}",
          contact: "${safe(contact)}"
        },
        theme: { color: "#1a3a7c" },
        handler: function(response) {
          notifyRN({ event: 'success', data: response });
        },
        modal: {
          ondismiss: function() {
            notifyRN({ event: 'dismissed' });
          },
          escape: true,
          backdropclose: false
        }
      };

      try {
        var rzp = new Razorpay(options);
        rzp.on('payment.failed', function(resp) {
          notifyRN({ event: 'failed', data: resp.error });
        });
        document.getElementById('loading-view').style.display = 'none';
        rzp.open();
      } catch(e) {
        notifyRN({ event: 'error', data: e.message || 'Could not initialize payment.' });
      }
    }

    loadRazorpay();
  </script>
</body>
</html>`;

  const handleMessage = (event: any) => {
    try {
      const parsed = JSON.parse(event.nativeEvent.data);
      if (parsed.event === 'success') {
        onSuccess(parsed.data);
      } else if (parsed.event === 'failed') {
        onFailed(parsed.data);
      } else if (parsed.event === 'dismissed') {
        onClose();
      } else if (parsed.event === 'error') {
        setHasError(true);
        onFailed({ description: parsed.data });
      }
    } catch (e) {
      console.log('WebView message parse error:', e);
    }
  };

  const handleNavigationRequest = (request: any) => {
    const url = String(request?.url || '');
    const isWebUrl =
      url.startsWith('http://') ||
      url.startsWith('https://') ||
      url.startsWith('about:') ||
      url.startsWith('data:') ||
      url.startsWith('blob:');

    if (isWebUrl) return true;

    Linking.openURL(url).catch(() => {
      onFailed({ description: 'The selected UPI app is not installed or could not be opened.' });
    });
    return false;
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onShow={handleShow}
      onRequestClose={onClose}
    >
      <View style={{ flex: 1, backgroundColor: '#f1f5f9' }}>
        {/* Header bar */}
        <View style={{
          flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
          paddingHorizontal: 16, paddingTop: 52, paddingBottom: 12,
          backgroundColor: '#1a3a7c'
        }}>
          <View>
            <Text style={{ color: '#93c5fd', fontSize: 10, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase' }}>Secure Payment</Text>
            <Text style={{ color: '#fff', fontSize: 16, fontWeight: '800' }}>IHWE 2026</Text>
          </View>
          <TouchableOpacity
            onPress={onClose}
            style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center' }}
          >
            {/* @ts-ignore */}
            <X size={20} color="#fff" />
          </TouchableOpacity>
        </View>

        {hasError ? (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 }}>
            {/* @ts-ignore */}
            <AlertCircle size={48} color="#ef4444" style={{ marginBottom: 16 }} />
            <Text style={{ fontSize: 18, fontWeight: '800', color: '#1e293b', marginBottom: 8, textAlign: 'center' }}>Payment Error</Text>
            <Text style={{ fontSize: 14, color: '#64748b', textAlign: 'center', marginBottom: 24 }}>
              Could not load the payment gateway. Please check your internet connection and try again.
            </Text>
            <TouchableOpacity
              onPress={onClose}
              style={{ backgroundColor: '#1a3a7c', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12 }}
            >
              <Text style={{ color: '#fff', fontWeight: '700', fontSize: 14 }}>Close</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <WebView
            ref={webViewRef}
            source={{ html: htmlContent, baseUrl: 'https://checkout.razorpay.com' }}
            onMessage={handleMessage}
            onShouldStartLoadWithRequest={handleNavigationRequest}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            originWhitelist={['*']}
            mixedContentMode="compatibility"
            allowsInlineMediaPlayback={true}
            mediaPlaybackRequiresUserAction={false}
            setSupportMultipleWindows={false}
            allowsBackForwardNavigationGestures={false}
            onLoadStart={() => setLoading(true)}
            onLoadEnd={() => setLoading(false)}
            onError={(e) => {
              if (e.nativeEvent.code === -10) return;
              console.error('WebView error:', e.nativeEvent);
              setHasError(true);
            }}
            onHttpError={(e) => {
              if (e.nativeEvent.statusCode >= 500) setHasError(true);
            }}
            style={{ flex: 1, backgroundColor: '#f1f5f9' }}
            renderLoading={() => (
              <View style={{ position: 'absolute', inset: 0, alignItems: 'center', justifyContent: 'center', backgroundColor: '#f1f5f9', zIndex: 10 }}>
                <ActivityIndicator size="large" color="#1a3a7c" />
                <Text style={{ color: '#1a3a7c', marginTop: 12, fontWeight: '600', fontSize: 13 }}>Loading payment gateway...</Text>
              </View>
            )}
            startInLoadingState={true}
          />
        )}
      </View>
    </Modal>
  );
}
