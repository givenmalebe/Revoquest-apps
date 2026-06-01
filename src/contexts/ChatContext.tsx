import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AuthContext } from './AuthContext';
import firebaseApiService from '../services/firebaseApi';

interface Message {
  id: string;
  content: string;
  senderId: string;
  senderName: string;
  senderRole: string;
  recipientId?: string;
  recipientRole?: string;
  timestamp: Date;
  isRead: boolean;
  type: 'text' | 'system' | 'notification';
  chatId: string;
}

interface ChatParticipant {
  id: string;
  name: string;
  role: string;
  avatar?: string;
  isOnline: boolean;
  lastSeen?: Date;
}

interface Chat {
  id: string;
  participants: ChatParticipant[];
  messages: Message[];
  lastMessage?: Message;
  unreadCount: number;
  type: 'direct' | 'group' | 'support';
  createdAt: Date;
}

interface ChatContextType {
  chats: Chat[];
  activeChat: string | null;
  setActiveChat: (chatId: string | null) => void;
  sendMessage: (content: string, chatId?: string, recipientId?: string) => Promise<void>;
  createChat: (participants: ChatParticipant[], type: 'direct' | 'group' | 'support') => Promise<string>;
  markAsRead: (chatId: string) => Promise<void>;
  loadMessages: (chatId: string) => Promise<void>;
  deleteChat: (chatId: string) => Promise<void>;
  addGroupMember: (chatId: string, participant: ChatParticipant) => Promise<void>;
  removeGroupMember: (chatId: string, participantId: string) => Promise<void>;
  getUnreadCount: () => number;
  isLoading: boolean;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};

interface ChatProviderProps {
  children: ReactNode;
}

export const ChatProvider: React.FC<ChatProviderProps> = ({ children }) => {
  const authContext = useContext(AuthContext);
  const { user, isAuthenticated } = authContext || { user: null, isAuthenticated: false };
  const [chats, setChats] = useState<Chat[]>([]);
  const [activeChat, setActiveChat] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Define loadMessages function first
  const loadMessages = async (chatId: string) => {
    try {
      const response = await firebaseApiService.messages.getChatMessages(chatId);
      if (response.success) {
        // The API returns data directly, not wrapped in a data property
        const apiMessages = (response.data || []).map((msg: any) => ({
          id: msg.id || `msg-${Date.now()}`,
          content: msg.content || '',
          senderId: msg.senderId || '',
          senderName: msg.senderName || 'Unknown',
          senderRole: msg.senderRole || 'learner',
          recipientId: msg.recipientId || '',
          recipientRole: msg.recipientRole || 'learner',
          timestamp: new Date(msg.timestamp || Date.now()),
          isRead: msg.isRead || false,
          type: msg.type || 'text',
          chatId: msg.chatId || chatId
        }));

        // Update chat with messages
        setChats(prevChats => 
          prevChats.map(chat => 
            chat.id === chatId 
              ? { ...chat, messages: apiMessages }
              : chat
          )
        );
      } else {
        // If API call fails, ensure messages array exists
        setChats(prevChats => 
          prevChats.map(chat => 
            chat.id === chatId 
              ? { ...chat, messages: chat.messages || [] }
              : chat
          )
        );
      }
    } catch (error) {
      console.error('Error loading messages:', error);
      // Ensure messages array exists even on error
      setChats(prevChats => 
        prevChats.map(chat => 
          chat.id === chatId 
            ? { ...chat, messages: chat.messages || [] }
            : chat
        )
      );
    }
  };

  // Load chats from API
  useEffect(() => {
    if (!user || !isAuthenticated) return;

    const loadChats = async () => {
      try {
        const response = await firebaseApiService.messages.getChats(user?.id || '');
        if (response.success && response.data) {
          const apiChats = response.data.map((chat: any) => ({
            id: chat.id,
            type: chat.type,
            participants: chat.participants || [],
            messages: [],
            unreadCount: 0,
            createdAt: new Date(chat.createdAt)
          }));
          
          setChats(apiChats);
        } else {
          console.log('No chats data available or API call failed');
          setChats([]);
        }
      } catch (error) {
        console.error('Error loading chats:', error);
        setChats([]);
      }
    };

    loadChats();
  }, [user, isAuthenticated]);

  // Real-time listener for messages
  useEffect(() => {
    if (!activeChat) return;

    const loadMessagesForActiveChat = async () => {
      try {
        await loadMessages(activeChat);
      } catch (error) {
        console.error('Error loading messages for active chat:', error);
      }
    };

    loadMessagesForActiveChat();
  }, [activeChat, loadMessages]);

  const sendMessage = async (content: string, chatId?: string, recipientId?: string) => {
    if (!content.trim() || !user) return;

    const targetChatId = chatId || activeChat;
    if (!targetChatId) return;

    setIsLoading(true);

    try {
      // Find the chat to get recipient
      const chat = chats.find(c => c.id === targetChatId);
      if (!chat) return;

      const recipient = chat.participants.find(p => p.id !== user.id);
      if (!recipient) return;

      // Send message to API
      const response = await firebaseApiService.messages.sendMessage(recipient.id, content.trim(), user?.id || '');

      if (response.success) {
        // Create a local message immediately for better UX
        const newMessage: Message = {
          id: `msg-${Date.now()}`,
          content: content.trim(),
          senderId: user.id,
          senderName: `${user.firstName} ${user.lastName}`,
          senderRole: user.role || 'learner',
          recipientId: recipient.id,
          recipientRole: recipient.role,
          timestamp: new Date(),
          isRead: false,
          type: 'text',
          chatId: targetChatId
        };

        // Update local state
        setChats(prevChats => 
          prevChats.map(chat => 
            chat.id === targetChatId 
              ? {
                  ...chat,
                  messages: [...chat.messages, newMessage],
                  lastMessage: newMessage
                }
              : chat
          )
        );
      }
    } catch (error) {
      console.error('Error sending message:', error);
      // Fallback to local behavior
      const newMessage: Message = {
        id: Date.now().toString(),
        content: content.trim(),
        senderId: user.id,
        senderName: `${user.firstName} ${user.lastName}`,
        senderRole: user.role,
        recipientId,
        recipientRole: recipientId ? chats.find(c => c.participants.some(p => p.id === recipientId))?.participants.find(p => p.id === recipientId)?.role : undefined,
        timestamp: new Date(),
        isRead: false,
        type: 'text',
        chatId: targetChatId
      };

      setChats(prevChats => 
        prevChats.map(chat => 
          chat.id === targetChatId 
            ? {
                ...chat,
                messages: [...chat.messages, newMessage],
                lastMessage: newMessage
              }
            : chat
        )
      );
    } finally {
      setIsLoading(false);
    }
  };


  const createChat = async (participants: ChatParticipant[], type: 'direct' | 'group' | 'support'): Promise<string> => {
    if (!user) return '';
    
    try {
      // For direct chats, find if chat already exists
      if (type === 'direct' && participants.length === 2) {
        const existingChat = chats.find(chat => 
          chat.type === 'direct' && 
          chat.participants.length === 2 &&
          chat.participants.some(p => p.id === participants[0].id) &&
          chat.participants.some(p => p.id === participants[1].id)
        );
        
        if (existingChat) {
          setActiveChat(existingChat.id);
          return existingChat.id;
        }
      }

      // Create new chat via API
      const response = await firebaseApiService.messages.createChat(
        participants.find(p => p.id !== user.id)?.id || '',
        user.id,
        type
      );

      if (response.success) {
        const chatId = response.data.id;
        const newChat: Chat = {
          id: chatId,
          participants,
          messages: [],
          unreadCount: 0,
          type,
          createdAt: new Date()
        };

        setChats(prevChats => [...prevChats, newChat]);
        setActiveChat(chatId);
        return chatId;
      } else {
        console.error('Failed to create chat:', response.message);
      }
    } catch (error) {
      console.error('Error creating chat:', error);
    }

    // Fallback to local creation
    const chatId = `chat-${Date.now()}`;
    const newChat: Chat = {
      id: chatId,
      participants,
      messages: [],
      unreadCount: 0,
      type,
      createdAt: new Date()
    };

    setChats(prevChats => [...prevChats, newChat]);
    setActiveChat(chatId);
    return chatId;
  };


  const markAsRead = async (chatId: string) => {
    try {
      await firebaseApiService.messages.markAsRead(chatId, user?.id || '');
      
      setChats(prevChats => 
        prevChats.map(chat => 
          chat.id === chatId 
            ? {
                ...chat,
                unreadCount: 0,
                messages: chat.messages.map(msg => ({ ...msg, isRead: true }))
              }
            : chat
        )
      );
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  };

  const deleteChat = async (chatId: string) => {
    try {
      await firebaseApiService.messages.deleteChat(chatId);
      
      // Remove chat from local state
      setChats(prevChats => prevChats.filter(chat => chat.id !== chatId));
      
      // If the deleted chat was active, clear the active chat
      if (activeChat === chatId) {
        setActiveChat(null);
      }
    } catch (error) {
      console.error('Error deleting chat:', error);
    }
  };

  const addGroupMember = async (chatId: string, participant: ChatParticipant) => {
    try {
      await firebaseApiService.messages.addGroupMember(chatId, participant);
      
      // Update local state
      setChats(prevChats => 
        prevChats.map(chat => 
          chat.id === chatId 
            ? { ...chat, participants: [...chat.participants, participant] }
            : chat
        )
      );
    } catch (error) {
      console.error('Error adding group member:', error);
    }
  };

  const removeGroupMember = async (chatId: string, participantId: string) => {
    try {
      await firebaseApiService.messages.removeGroupMember(chatId, participantId);
      
      // Update local state
      setChats(prevChats => 
        prevChats.map(chat => 
          chat.id === chatId 
            ? { ...chat, participants: chat.participants.filter(p => p.id !== participantId) }
            : chat
        )
      );
    } catch (error) {
      console.error('Error removing group member:', error);
    }
  };

  const getUnreadCount = (): number => {
    return chats.reduce((total, chat) => total + chat.unreadCount, 0);
  };

  const value: ChatContextType = {
    chats,
    activeChat,
    setActiveChat,
    sendMessage,
    createChat,
    markAsRead,
    loadMessages,
    deleteChat,
    addGroupMember,
    removeGroupMember,
    getUnreadCount,
    isLoading
  };

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
};
