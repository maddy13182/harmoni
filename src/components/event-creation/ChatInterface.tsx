/**
 * Chat Interface Component
 * 
 * Provides a chat-style interface for creating events through natural language
 * Features:
 * - Translucent background
 * - User messages (purple, right-aligned)
 * - AI messages (black, left-aligned)
 * - Typing animation
 * - Real-time streaming responses from Foundry AIP Agent
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';
import { Layout } from '../../constants/Layout';
import { createAgentSession, streamContinueSession } from '../../services/foundry/aipAgentService';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

interface ChatInterfaceProps {
  visible: boolean;
  onClose: () => void;
  onEventCreated?: (eventData: any) => void;
  userId: string;
  userTimezone: string;
}

const AGENT_RID = 'ri.aip-agents..agent.4c393e4d-8297-40e1-a861-e2238fdb65c6';

export const ChatInterface: React.FC<ChatInterfaceProps> = ({
  visible,
  onClose,
  onEventCreated,
  userId,
  userTimezone,
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [sessionRid, setSessionRid] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const scrollViewRef = useRef<ScrollView>(null);
  const currentAiMessageRef = useRef<string>('');

  // Create session when component mounts and is visible
  useEffect(() => {
    if (visible && !sessionRid) {
      initializeSession();
    }
  }, [visible]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  // Initialize AIP Agent session
  const initializeSession = async () => {
    console.log('🚀 [ChatInterface] Initializing AIP Agent session...');
    console.log('   User ID:', userId);
    console.log('   User Timezone:', userTimezone);
    
    try {
      const session = await createAgentSession(AGENT_RID);
      setSessionRid(session.rid);
      setError(null);
      console.log('✅ [ChatInterface] Session initialized successfully');
    } catch (err) {
      console.error('❌ [ChatInterface] Failed to initialize session:', err);
      setError('Error connecting to AI bot');
      
      // Show error as a message
      const errorMessage: Message = {
        id: Date.now().toString(),
        text: 'Error connecting to AI bot',
        sender: 'ai',
        timestamp: new Date(),
      };
      setMessages([errorMessage]);
    }
  };

  // Handle sending a message
  const handleSend = async () => {
    if (!inputText.trim() || !sessionRid) {
      console.log('⚠️  [ChatInterface] Cannot send: missing input or session');
      return;
    }

    console.log('📤 [ChatInterface] Sending user message:', inputText.trim());

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText.trim(),
      sender: 'user',
      timestamp: new Date(),
    };

    // Add user message
    setMessages(prev => [...prev, userMessage]);
    const messageText = inputText.trim();
    setInputText('');

    // Show typing indicator
    setIsTyping(true);
    currentAiMessageRef.current = '';

    // Create a placeholder AI message that will be updated with streaming content
    const aiMessageId = (Date.now() + 1).toString();
    const aiMessage: Message = {
      id: aiMessageId,
      text: '',
      sender: 'ai',
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, aiMessage]);

    try {
      console.log('⏳ [ChatInterface] Starting streaming response...');
      
      // Use streaming for real-time response
      await streamContinueSession(
        AGENT_RID,
        sessionRid,
        messageText,
        userId,
        userTimezone,
        // onChunk: Update message as chunks arrive
        (chunk: string) => {
          currentAiMessageRef.current += chunk;
          setMessages(prev =>
            prev.map(msg =>
              msg.id === aiMessageId
                ? { ...msg, text: currentAiMessageRef.current }
                : msg
            )
          );
        },
        // onComplete: Hide typing indicator
        () => {
          console.log('✅ [ChatInterface] Streaming complete');
          setIsTyping(false);
        },
        // onError: Show error message
        (error: string) => {
          console.error('❌ [ChatInterface] Streaming error:', error);
          setIsTyping(false);
          setMessages(prev =>
            prev.map(msg =>
              msg.id === aiMessageId
                ? { ...msg, text: 'Error connecting to AI bot' }
                : msg
            )
          );
        }
      );
    } catch (err) {
      console.error('❌ [ChatInterface] Error in handleSend:', err);
      setIsTyping(false);
      
      // Update the AI message with error
      setMessages(prev =>
        prev.map(msg =>
          msg.id === aiMessageId
            ? { ...msg, text: 'Error connecting to AI bot' }
            : msg
        )
      );
    }
  };

  // Handle closing the chat
  const handleClose = () => {
    console.log('🔒 [ChatInterface] Closing chat interface');
    // Reset state when closing
    setMessages([]);
    setInputText('');
    setIsTyping(false);
    setSessionRid(null);
    setError(null);
    currentAiMessageRef.current = '';
    onClose();
  };

  // Render a single message
  const renderMessage = (message: Message) => {
    const isUser = message.sender === 'user';

    return (
      <View
        key={message.id}
        style={[
          styles.messageContainer,
          isUser ? styles.userMessageContainer : styles.aiMessageContainer,
        ]}
      >
        <View
          style={[
            styles.messageBubble,
            isUser ? styles.userBubble : styles.aiBubble,
          ]}
        >
          <Text
            style={[
              styles.messageText,
              isUser ? styles.userMessageText : styles.aiMessageText,
            ]}
          >
            {message.text}
          </Text>
          <Text
            style={[
              styles.timestamp,
              isUser ? styles.userTimestamp : styles.aiTimestamp,
            ]}
          >
            {message.timestamp.toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </Text>
        </View>
      </View>
    );
  };

  // Render typing indicator
  const renderTypingIndicator = () => {
    if (!isTyping) return null;

    return (
      <View style={[styles.messageContainer, styles.aiMessageContainer]}>
        <View style={[styles.messageBubble, styles.aiBubble, styles.typingBubble]}>
          <View style={styles.typingIndicator}>
            <View style={[styles.typingDot, styles.typingDot1]} />
            <View style={[styles.typingDot, styles.typingDot2]} />
            <View style={[styles.typingDot, styles.typingDot3]} />
          </View>
        </View>
      </View>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={handleClose}
      statusBarTranslucent={false}
    >
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.container}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
        >
            {/* Header */}
            <View style={styles.header}>
              <View style={styles.headerLeft}>
                <Ionicons
                  name="chatbubbles"
                  size={24}
                  color={Colors.primary.lavender}
                />
                <Text style={styles.headerTitle}>Chat to Create Event</Text>
              </View>
              <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
                <Ionicons name="close" size={28} color={Colors.text.primary} />
              </TouchableOpacity>
            </View>

            {/* Messages Area */}
            <ScrollView
              ref={scrollViewRef}
              style={styles.messagesContainer}
              contentContainerStyle={styles.messagesContent}
              showsVerticalScrollIndicator={false}
            >
              {messages.length === 0 && !error && (
                <View style={styles.emptyState}>
                  <Ionicons
                    name="chatbubble-ellipses-outline"
                    size={64}
                    color={Colors.neutral.lightGray}
                  />
                  <Text style={styles.emptyStateTitle}>Start a Conversation</Text>
                  <Text style={styles.emptyStateText}>
                    Tell me about the event you'd like to create
                  </Text>
                </View>
              )}

              {messages.map(renderMessage)}
              {renderTypingIndicator()}
            </ScrollView>

            {/* Input Area */}
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Type your message..."
                placeholderTextColor={Colors.text.tertiary}
                value={inputText}
                onChangeText={setInputText}
                multiline
                maxLength={500}
                onSubmitEditing={handleSend}
                blurOnSubmit={false}
                editable={!!sessionRid && !isTyping}
              />
              <TouchableOpacity
                style={[
                  styles.sendButton,
                  (!inputText.trim() || !sessionRid) && styles.sendButtonDisabled,
                ]}
                onPress={handleSend}
                disabled={!inputText.trim() || !sessionRid || isTyping}
              >
                <Ionicons
                  name="send"
                  size={20}
                  color={inputText.trim() && sessionRid ? Colors.text.inverse : Colors.text.tertiary}
                />
              </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF', // Solid white background for better visibility
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Layout.spacing.md,
    paddingVertical: Layout.spacing.md,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral.lightGray,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Layout.spacing.sm,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text.primary,
  },
  closeButton: {
    padding: Layout.spacing.xs,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: Layout.spacing.md,
    flexGrow: 1,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: Layout.spacing.xl * 2,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text.primary,
    marginTop: Layout.spacing.md,
    marginBottom: Layout.spacing.xs,
  },
  emptyStateText: {
    fontSize: 14,
    color: Colors.text.secondary,
    textAlign: 'center',
    paddingHorizontal: Layout.spacing.xl,
  },
  messageContainer: {
    marginBottom: Layout.spacing.md,
    flexDirection: 'row',
  },
  userMessageContainer: {
    justifyContent: 'flex-end',
  },
  aiMessageContainer: {
    justifyContent: 'flex-start',
  },
  messageBubble: {
    maxWidth: '75%',
    paddingHorizontal: Layout.spacing.md,
    paddingVertical: Layout.spacing.sm,
    borderRadius: Layout.borderRadius.lg,
  },
  userBubble: {
    backgroundColor: Colors.primary.lavender, // Purple for user
    borderBottomRightRadius: Layout.borderRadius.sm,
  },
  aiBubble: {
    backgroundColor: Colors.neutral.darkGray, // Black/dark gray for AI
    borderBottomLeftRadius: Layout.borderRadius.sm,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  userMessageText: {
    color: Colors.text.inverse, // White text on purple
  },
  aiMessageText: {
    color: Colors.text.inverse, // White text on black
  },
  timestamp: {
    fontSize: 11,
    marginTop: Layout.spacing.xs / 2,
  },
  userTimestamp: {
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'right',
  },
  aiTimestamp: {
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'left',
  },
  typingBubble: {
    paddingVertical: Layout.spacing.md,
  },
  typingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Layout.spacing.xs / 2,
  },
  typingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
  },
  typingDot1: {
    opacity: 0.4,
  },
  typingDot2: {
    opacity: 0.6,
  },
  typingDot3: {
    opacity: 0.8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: Layout.spacing.md,
    paddingVertical: Layout.spacing.md,
    paddingBottom: Platform.OS === 'ios' ? Layout.spacing.sm : Layout.spacing.md,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: Colors.neutral.lightGray,
    gap: Layout.spacing.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  input: {
    flex: 1,
    backgroundColor: Colors.background.secondary,
    borderRadius: Layout.borderRadius.lg,
    paddingHorizontal: Layout.spacing.md,
    paddingVertical: Layout.spacing.sm,
    fontSize: 16,
    color: Colors.text.primary,
    maxHeight: 100,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primary.lavender,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: Colors.neutral.lightGray,
  },
});

export default ChatInterface;
