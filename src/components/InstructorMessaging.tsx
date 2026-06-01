import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  MessageCircle, 
  Send, 
  Users, 
  User, 
  Shield,
  Clock,
  CheckCircle2,
  MoreVertical
} from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useAuth } from "@/contexts/AuthContext";
import firebaseApiService from "@/services/firebaseApi";
import socketService from "@/services/socketService";
import { NotificationService } from "@/services/notificationService";

interface Message {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: 'instructor' | 'learner' | 'admin';
  recipientId?: string;
  recipientName?: string;
  content: string;
  timestamp: string;
  isRead: boolean;
  type: 'direct' | 'group' | 'broadcast';
}

interface ChatParticipant {
  id: string;
  name: string;
  role: 'learner' | 'admin';
  avatar?: string;
  isOnline: boolean;
  lastSeen?: string;
}

interface InstructorMessagingProps {
  instructorId: string;
  instructorName: string;
  learners: any[];
  onSendMessage?: (message: Message) => void;
}

export const InstructorMessaging: React.FC<InstructorMessagingProps> = ({
  instructorId,
  instructorName,
  learners,
  onSendMessage
}) => {
  const { user } = useAuth();
  const [activeChat, setActiveChat] = useState<string>('admin');
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [participants, setParticipants] = useState<ChatParticipant[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize participants and connect to socket
  useEffect(() => {
    const initializeMessaging = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Check if user is authenticated
        if (!user) {
          setError('Please log in to use messaging features');
          setLoading(false);
          return;
        }

        console.log('Initializing messaging for user:', user);
        
        // Try to connect to Socket.IO (optional for real-time features)
        const token = localStorage.getItem('token');
        if (token) {
          try {
            await socketService.connect(token);
            console.log('Socket.IO connected successfully');
            
            // Set up Socket.IO event listeners
            socketService.on('new_message', (data) => {
              if (data.chatId === activeChat) {
                setMessages(prev => [...prev, data.message]);
              }
            });

            socketService.on('user_typing', (data) => {
              if (data.chatId === activeChat) {
                setTypingUsers(prev => [...prev.filter(u => u !== data.userId), data.userId]);
              }
            });

            socketService.on('user_stopped_typing', (data) => {
              if (data.chatId === activeChat) {
                setTypingUsers(prev => prev.filter(u => u !== data.userId));
              }
            });
          } catch (socketError) {
            console.warn('Socket.IO connection failed, continuing without real-time features:', socketError);
            // Continue without Socket.IO - messaging will still work via HTTP
            // Set up polling to refresh messages every 5 seconds
            refreshIntervalRef.current = setInterval(refreshMessages, 5000);
          }
        } else {
          // No token available, set up polling anyway
          refreshIntervalRef.current = setInterval(refreshMessages, 5000);
        }

        // Fetch instructor's learners
        console.log('Fetching instructor learners...');
        const learnersResponse = await firebaseApiService.messages.getInstructorLearners(user?.id || '');
        console.log('Learners response:', learnersResponse);
        
        console.log('Fetching admin users...');
        const adminResponse = await firebaseApiService.messages.getAdminUsers();
        console.log('Admin response:', adminResponse);

        const participants: ChatParticipant[] = [
          {
            id: 'admin',
            name: 'Admin Team',
            role: 'admin',
            isOnline: true
          },
          ...(learnersResponse.success ? learnersResponse.data.map((learner: any) => ({
            id: learner.id,
            name: learner.name || `${learner.firstName} ${learner.lastName}`,
            role: 'learner' as const,
            avatar: learner.avatar,
            isOnline: false // Will be updated via Socket.IO
          })) : [])
        ];

        setParticipants(participants);

        // Load initial messages for admin chat
        await loadChatMessages('admin');

      } catch (error) {
        console.error('Error initializing messaging:', error);
        setError('Failed to initialize messaging system');
      } finally {
        setLoading(false);
      }
    };

    initializeMessaging();

    // Cleanup on unmount
    return () => {
      socketService.off('new_message');
      socketService.off('user_typing');
      socketService.off('user_stopped_typing');
      
      // Clear refresh interval
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    };
  }, [user?.token, activeChat]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Function to refresh messages when Socket.IO is not available
  const refreshMessages = async () => {
    if (!socketService.isSocketConnected() && activeChat) {
      try {
        const response = await firebaseApiService.messages.getChatMessages(activeChat);
        if (response.success) {
          setMessages(response.data);
        }
      } catch (error) {
        console.warn('Failed to refresh messages:', error);
      }
    }
  };

  const loadChatMessages = async (chatId: string) => {
    try {
      if (chatId === 'admin') {
        // For admin chat, we'll use a special approach
        // You might want to create a specific admin chat endpoint
        setMessages([]);
        return;
      }

      const response = await firebaseApiService.messages.getChatMessages(chatId);
      if (response.success) {
        setMessages(response.data);
      }
    } catch (error) {
      console.error('Error loading chat messages:', error);
    }
  };

  const handleChatChange = async (chatId: string) => {
    setActiveChat(chatId);
    setMessages([]);
    setTypingUsers([]);
    
    // Leave previous chat and join new one
    if (socketService.isSocketConnected()) {
      socketService.leaveChat(activeChat);
      socketService.joinChat(chatId);
    }
    
    await loadChatMessages(chatId);
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!message.trim()) return;

    try {
      let response;
      
      if (activeChat === 'admin') {
        // Send to admin team
        response = await firebaseApiService.messages.sendToAdminTeam(message.trim(), user?.id || '');
      } else {
        // Send to specific learner
        response = await firebaseApiService.messages.sendMessage(activeChat, message.trim(), user?.id || '');
      }

      if (response.success) {
        setMessage('');
        
        // Send notification to the recipient
        try {
          if (activeChat === 'admin') {
            // Notify admin team about the message
            await NotificationService.notifyNewMessage(
              'admin-team', // Admin team ID
              user?.id || 'instructor-001',
              `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || 'Instructor',
              message.trim(),
              undefined, // No specific course
              'admin-chat'
            );
          } else {
            // Notify the specific learner
            const recipient = participants.find(p => p.id === activeChat);
            if (recipient) {
              await NotificationService.notifyNewMessage(
                activeChat,
                user?.id || 'instructor-001',
                `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || 'Instructor',
                message.trim(),
                recipient.courseTitle,
                activeChat
              );
            }
          }
        } catch (notificationError) {
          console.log('Notification failed, but message was sent:', notificationError);
        }
        
        // Stop typing indicator (if Socket.IO is connected)
        if (socketService.isSocketConnected()) {
          socketService.stopTyping(activeChat);
        } else {
          // If Socket.IO is not connected, refresh messages to show the new message
          setTimeout(refreshMessages, 500);
        }
        
        if (onSendMessage) {
          onSendMessage(response.data.message || response.data);
        }
      } else {
        setError('Failed to send message');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setError('Failed to send message');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    } else if (e.key !== 'Enter') {
      // Handle typing indicator
      if (!isTyping && socketService.isSocketConnected()) {
        setIsTyping(true);
        socketService.startTyping(activeChat);
      }

      // Clear existing timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      // Set new timeout to stop typing
      typingTimeoutRef.current = setTimeout(() => {
        if (isTyping && socketService.isSocketConnected()) {
          setIsTyping(false);
          socketService.stopTyping(activeChat);
        }
      }, 1000);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessage(e.target.value);
  };

  const getUnreadCount = (participantId: string) => {
    return messages.filter(msg => 
      msg.senderId === participantId && 
      msg.senderRole !== 'instructor' && 
      !msg.isRead
    ).length;
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      return `${Math.floor(diffInHours * 60)}m ago`;
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const activeParticipant = participants.find(p => p.id === activeChat);
  const activeMessages = messages.filter(msg => 
    (msg.senderId === activeChat && msg.recipientId === instructorId) ||
    (msg.senderId === instructorId && msg.recipientId === activeChat) ||
    (activeChat === 'admin' && msg.senderId === 'admin')
  );

  return (
    <Card className="h-[600px] flex flex-col">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5" />
          Messages
        </CardTitle>
        <CardDescription>
          Communicate with learners and admin team
        </CardDescription>
      </CardHeader>
      
      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : error ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-red-600 mb-2">{error}</p>
            <Button onClick={() => window.location.reload()} size="sm">
              Retry
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex flex-1 overflow-hidden">
        {/* Participants List */}
        <div className="w-1/3 border-r border-gray-200 flex flex-col">
          <div className="p-3 border-b border-gray-200">
            <h3 className="font-semibold text-sm text-gray-700">Conversations</h3>
          </div>
          
          <ScrollArea className="flex-1">
            <div className="p-2 space-y-1">
              {participants.map((participant) => {
                const unreadCount = getUnreadCount(participant.id);
                const isActive = activeChat === participant.id;
                
                return (
                <div
                  key={participant.id}
                  onClick={() => handleChatChange(participant.id)}
                  className={`p-3 rounded-lg cursor-pointer transition-colors ${
                    isActive 
                      ? 'bg-blue-50 border border-blue-200' 
                      : 'hover:bg-gray-50'
                  }`}
                >
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={participant.avatar} />
                          <AvatarFallback>
                            {participant.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        {participant.isOnline && (
                          <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="font-medium text-sm truncate">{participant.name}</p>
                          {unreadCount > 0 && (
                            <Badge variant="destructive" className="text-xs h-5 min-w-5 flex items-center justify-center">
                              {unreadCount}
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-1 mt-1">
                          {participant.role === 'admin' ? (
                            <Shield className="h-3 w-3 text-blue-600" />
                          ) : (
                            <User className="h-3 w-3 text-green-600" />
                          )}
                          <span className="text-xs text-gray-500 capitalize">{participant.role}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col">
          {/* Chat Header */}
          <div className="p-4 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={activeParticipant?.avatar} />
                  <AvatarFallback>
                    {activeParticipant?.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold">{activeParticipant?.name}</h3>
                  <div className="flex items-center gap-1">
                    {activeParticipant?.role === 'admin' ? (
                      <Shield className="h-3 w-3 text-blue-600" />
                    ) : (
                      <User className="h-3 w-3 text-green-600" />
                    )}
                    <span className="text-xs text-gray-500 capitalize">
                      {activeParticipant?.role}
                      {activeParticipant?.isOnline && ' • Online'}
                    </span>
                  </div>
                </div>
              </div>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem>Mark as read</DropdownMenuItem>
                  <DropdownMenuItem>Archive conversation</DropdownMenuItem>
                  <DropdownMenuItem>Block user</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Messages */}
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4">
              {activeMessages.map((msg) => {
                const isInstructor = msg.senderRole === 'instructor';
                const isAdmin = msg.senderRole === 'admin';
                
                return (
                  <div
                    key={msg.id}
                    className={`flex ${isInstructor ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[70%] ${isInstructor ? 'order-2' : 'order-1'}`}>
                      <div className={`flex items-end gap-2 ${isInstructor ? 'flex-row-reverse' : 'flex-row'}`}>
                        <Avatar className="h-6 w-6">
                          <AvatarFallback className="text-xs">
                            {msg.senderName.split(' ').map(n => n[0]).join('').toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        
                        <div className={`rounded-lg px-3 py-2 ${
                          isInstructor 
                            ? 'bg-blue-600 text-white' 
                            : isAdmin 
                            ? 'bg-purple-100 text-purple-900 border border-purple-200'
                            : 'bg-gray-100 text-gray-900'
                        }`}>
                          <p className="text-sm">{msg.content}</p>
                          <div className={`flex items-center gap-1 mt-1 ${
                            isInstructor ? 'text-blue-100' : 'text-gray-500'
                          }`}>
                            <Clock className="h-3 w-3" />
                            <span className="text-xs">{formatTime(msg.timestamp)}</span>
                            {msg.isRead && isInstructor && (
                              <CheckCircle2 className="h-3 w-3" />
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          {/* Message Input */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex gap-2">
              <Input
                value={message}
                onChange={handleInputChange}
                onKeyPress={handleKeyPress}
                placeholder={`Message ${activeParticipant?.name}...`}
                className="flex-1"
                disabled={loading}
              />
              <Button 
                onClick={handleSendMessage}
                disabled={!message.trim() || loading}
                size="sm"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
            {typingUsers.length > 0 && (
              <div className="mt-2 text-sm text-gray-500">
                {typingUsers.map(userId => {
                  const user = participants.find(p => p.id === userId);
                  return user ? `${user.name} is typing...` : 'Someone is typing...';
                }).join(', ')}
              </div>
            )}
          </div>
        </div>
      </div>
      )}
    </Card>
  );
};
