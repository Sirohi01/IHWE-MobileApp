import React, { useRef } from 'react';
import { View, Modal, TouchableOpacity, ActivityIndicator } from 'react-native';
import { WebView } from 'react-native-webview';
import { X } from 'lucide-react-native';

interface RazorpayWebViewProps {
  visible: boolean;
  orderId: string;
  amount: number;
  currency?: string;
  name?: string;
  email?: string;
  contact?: string;
  onClose: () => void;
  onSuccess: (data: any) => void;
  onFailed: (error: any) => void;
}

const RAZORPAY_KEY_ID = 'rzp_test_RTd9y3ngRanKxq';

export function RazorpayWebView({
  visible,
  orderId,
  amount,
  currency = 'INR',
  name = '',
  email = '',
  contact = '',
  onClose,
  onSuccess,
  onFailed
}: RazorpayWebViewProps) {
  const webViewRef = useRef<WebView>(null);

  const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
      <title>Razorpay Checkout</title>
      <script src="https://checkout.razorpay.com/v1/checkout.js"></script>
      <style>
        body, html { margin: 0; padding: 0; width: 100%; height: 100%; background-color: #f4f7f9; display: flex; align-items: center; justify-content: center; }
        .loader { border: 4px solid #f3f3f3; border-top: 4px solid #1a3a7c; border-radius: 50%; width: 30px; height: 30px; animation: spin 1s linear infinite; }
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
      </style>
    </head>
    <body>
      <div class="loader" id="loader"></div>
      <script>
        var options = {
          key: "${RAZORPAY_KEY_ID}",
          amount: "${amount * 100}", // Razorpay expects amount in paise
          currency: "${currency}",
          name: "IHWE 2026",
          description: "Stall Extras Purchase",
          order_id: "${orderId}",
          prefill: {
            name: "${name}",
            email: "${email}",
            contact: "${contact}"
          },
          theme: { color: "#1a3a7c" },
          handler: function (response) {
            window.ReactNativeWebView.postMessage(JSON.stringify({ event: 'success', data: response }));
          },
          modal: {
            ondismiss: function() {
              window.ReactNativeWebView.postMessage(JSON.stringify({ event: 'dismissed' }));
            }
          }
        };

        try {
          var rzp1 = new Razorpay(options);
          rzp1.on('payment.failed', function (response){
            window.ReactNativeWebView.postMessage(JSON.stringify({ event: 'failed', data: response.error }));
          });
          rzp1.open();
          document.getElementById('loader').style.display = 'none';
        } catch (e) {
          window.ReactNativeWebView.postMessage(JSON.stringify({ event: 'error', data: e.message }));
        }
      </script>
    </body>
    </html>
  `;

  const handleMessage = (event: any) => {
    try {
      const parsedData = JSON.parse(event.nativeEvent.data);
      if (parsedData.event === 'success') {
        onSuccess(parsedData.data);
      } else if (parsedData.event === 'failed') {
        onFailed(parsedData.data);
      } else if (parsedData.event === 'dismissed') {
        onClose();
      } else if (parsedData.event === 'error') {
        onFailed(parsedData.data);
      }
    } catch (e) {
      console.log('Error parsing WebView message', e);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
      <View className="flex-1 bg-black/50 justify-end">
        <View className="bg-white h-[90%] rounded-t-3xl overflow-hidden shadow-2xl">
          <View className="flex-row items-center justify-between p-4 border-b border-slate-100 bg-white">
            <View />
            <TouchableOpacity onPress={onClose} className="w-8 h-8 bg-slate-100 rounded-full items-center justify-center">
              {/* @ts-ignore */}
              <X size={18} color="#64748b" />
            </TouchableOpacity>
          </View>
          <WebView
            ref={webViewRef}
            source={{ html: htmlContent }}
            onMessage={handleMessage}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            startInLoadingState={true}
            renderLoading={() => (
              <View className="absolute inset-0 items-center justify-center bg-white z-10">
                <ActivityIndicator size="large" color="#1a3a7c" />
              </View>
            )}
            className="flex-1"
          />
        </View>
      </View>
    </Modal>
  );
}
