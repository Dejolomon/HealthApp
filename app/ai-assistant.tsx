import { router } from 'expo-router';
import { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useHealthData } from '@/hooks/use-health-data';
import { chatWithAIHealthAssistant, isAIConfigured } from '@/utils/ai-service';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export default function AIAssistantScreen() {
  const { today, goals } = useHealthData();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: "Hi! I'm your AI health assistant. I can help answer questions about nutrition, exercise, wellness, and your health goals. How can I help you today?",
      timestamp: Date.now(),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSendMessage = async () => {
    if (!inputText.trim()) return;

    if (!isAIConfigured()) {
      Alert.alert(
        'AI Not Configured',
        'Please set EXPO_PUBLIC_OPENAI_API_KEY in your environment variables to use the AI assistant.',
      );
      return;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputText.trim(),
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText('');
    setLoading(true);

    try {
      const response = await chatWithAIHealthAssistant(inputText.trim(), {
        currentHealthData: {
          steps: today.steps,
          sleep: today.sleep,
          water: today.water,
          calories: today.calories,
          bmi: today.bmi,
        },
        goals: {
          steps: goals.steps,
          sleep: goals.sleep,
          water: goals.water,
          calories: goals.calories,
        },
      });

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response,
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "I'm having trouble connecting right now. Please try again later or consult with a healthcare professional for immediate concerns.",
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, errorMessage]);
      console.error('Chat error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickQuestion = (question: string) => {
    setInputText(question);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ThemedText style={styles.backButtonText} lightColor="#2563eb">
            ← Back
          </ThemedText>
        </TouchableOpacity>
        <ThemedText type="title" style={styles.title} lightColor="#1a1f2e">
          AI Health Assistant
        </ThemedText>
        <ThemedText style={styles.subtitle} lightColor="#6b7280">
          Ask me anything about health and wellness
        </ThemedText>
      </View>

      <ScrollView
        style={styles.messagesContainer}
        contentContainerStyle={styles.messagesContent}
        ref={(ref) => {
          if (ref) {
            setTimeout(() => ref.scrollToEnd({ animated: true }), 100);
          }
        }}
      >
        {messages.map((message) => (
          <View
            key={message.id}
            style={[
              styles.messageWrapper,
              message.role === 'user' ? styles.userMessageWrapper : styles.assistantMessageWrapper,
            ]}
          >
            <ThemedView
              style={[
                styles.messageBubble,
                message.role === 'user' ? styles.userMessage : styles.assistantMessage,
              ]}
            >
              <ThemedText
                style={[
                  styles.messageText,
                  message.role === 'user' && styles.userMessageText,
                ]}
                lightColor={message.role === 'user' ? '#ffffff' : '#1a1f2e'}
              >
                {message.content}
              </ThemedText>
            </ThemedView>
          </View>
        ))}
        {loading && (
          <View style={styles.loadingWrapper}>
            <ThemedView style={styles.assistantMessage}>
              <ActivityIndicator size="small" color="#2563eb" />
            </ThemedView>
          </View>
        )}
      </ScrollView>

      <View style={styles.quickQuestions}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.quickQuestionsScroll}>
          <TouchableOpacity
            style={styles.quickQuestionButton}
            onPress={() => handleQuickQuestion('What are some healthy breakfast options?')}
          >
            <ThemedText style={styles.quickQuestionText} lightColor="#2563eb">
              Breakfast ideas
            </ThemedText>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.quickQuestionButton}
            onPress={() => handleQuickQuestion('How can I improve my sleep quality?')}
          >
            <ThemedText style={styles.quickQuestionText} lightColor="#2563eb">
              Sleep tips
            </ThemedText>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.quickQuestionButton}
            onPress={() => handleQuickQuestion('What exercises can I do at home?')}
          >
            <ThemedText style={styles.quickQuestionText} lightColor="#2563eb">
              Home workouts
            </ThemedText>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.quickQuestionButton}
            onPress={() => handleQuickQuestion('How much water should I drink daily?')}
          >
            <ThemedText style={styles.quickQuestionText} lightColor="#2563eb">
              Hydration
            </ThemedText>
          </TouchableOpacity>
        </ScrollView>
      </View>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={inputText}
          onChangeText={setInputText}
          placeholder="Ask a health question..."
          placeholderTextColor="#9ca3af"
          multiline
          maxLength={500}
        />
        <TouchableOpacity
          style={[styles.sendButton, (!inputText.trim() || loading) && styles.sendButtonDisabled]}
          onPress={handleSendMessage}
          disabled={!inputText.trim() || loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#ffffff" />
          ) : (
            <ThemedText style={styles.sendButtonText} lightColor="#ffffff">
              Send
            </ThemedText>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f7fb',
  },
  header: {
    padding: 20,
    paddingBottom: 12,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  backButton: {
    marginBottom: 8,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: 20,
    paddingBottom: 10,
  },
  messageWrapper: {
    marginBottom: 16,
  },
  userMessageWrapper: {
    alignItems: 'flex-end',
  },
  assistantMessageWrapper: {
    alignItems: 'flex-start',
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 14,
    borderRadius: 18,
  },
  userMessage: {
    backgroundColor: '#2563eb',
    borderBottomRightRadius: 4,
  },
  assistantMessage: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 20,
  },
  userMessageText: {
    color: '#ffffff',
  },
  loadingWrapper: {
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  quickQuestions: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  quickQuestionsScroll: {
    flexDirection: 'row',
  },
  quickQuestionButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#eff6ff',
    borderWidth: 1,
    borderColor: '#bfdbfe',
    marginRight: 8,
  },
  quickQuestionText: {
    fontSize: 13,
    fontWeight: '600',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    alignItems: 'flex-end',
    gap: 12,
  },
  input: {
    flex: 1,
    minHeight: 44,
    maxHeight: 100,
    backgroundColor: '#f9fafb',
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    color: '#1a1f2e',
  },
  sendButton: {
    backgroundColor: '#2563eb',
    borderRadius: 22,
    paddingHorizontal: 20,
    paddingVertical: 12,
    minWidth: 70,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  sendButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#ffffff',
  },
});

