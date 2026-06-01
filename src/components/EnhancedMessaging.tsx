import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { 
  MessageCircle, 
  Send, 
  User, 
  Users, 
  Plus, 
  Search,
  MoreVertical,
  Phone,
  Video,
  Paperclip,
  Smile,
  Clock,
  Check,
  CheckCheck,
  Reply,
  Forward,
  Archive,
  Trash2,
  Star,
  StarOff,
  X
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useDataSync } from "@/contexts/DataSyncContext";

interface User {
  id: string;
  name: string;
  email: string;
  role: 'instructor' | 'learner' | 'admin';
  avatar?: string;
  isOnline?: boolean;
  lastSeen?: string;
}

interface Message {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: 'instructor' | 'learner' | 'admin';
  recipientId: string;
  recipientName: string;
  content: string;
  timestamp: string;
  isRead: boolean;
  isEdited?: boolean;
  editedAt?: string;
  replyTo?: {
    id: string;
    content: string;
    senderName: string;
  };
  attachments?: Array<{
    id: string;
    name: string;
    url: string;
    type: string;
    size: number;
  }>;
  reactions?: Array<{
    emoji: string;
    userId: string;
    userName: string;
  }>;
}

interface Conversation {
  id: string;
  participants: User[];
  lastMessage?: Message;
  unreadCount: number;
  isPinned: boolean;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
}

interface EnhancedMessagingProps {
  userRole: 'instructor' | 'student' | 'admin';
}

export const EnhancedMessaging: React.FC<EnhancedMessagingProps> = ({ userRole }) => {
  const { user } = useAuth();
  const { 
    messages, 
    sendMessage: sendMessageToContext, 
    getMessages,
    subscribeToUpdates,
    users,
    getUsersInSameGroup,
    instructorAssignments
  } = useDataSync();

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [conversationMessages, setConversationMessages] = useState<Message[]>([]);
  const [messageInput, setMessageInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showNewMessageDialog, setShowNewMessageDialog] = useState(false);
  const [selectedRecipient, setSelectedRecipient] = useState<string>('');
  const [newMessageContent, setNewMessageContent] = useState('');
  const [replyToMessage, setReplyToMessage] = useState<Message | null>(null);
  const [showUserSearch, setShowUserSearch] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Get available users based on instructor assignments
  const availableUsers = user ? getUsersInSameGroup(user.id) : [];

  // Generate conversations from real data
  useEffect(() => {
    if (!user || availableUsers.length === 0) {
      setConversations([]);
      return;
    }

    // Create conversations for each available user
    const generatedConversations: Conversation[] = availableUsers.map((otherUser, index) => {
      // Find messages between current user and this user
      const userMessages = getMessages().filter(msg => 
        (msg.senderId === user.id && msg.recipientId === otherUser.id) ||
        (msg.senderId === otherUser.id && msg.recipientId === user.id)
      );

      const lastMessage = userMessages.length > 0 
        ? userMessages.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0]
        : undefined;

      const unreadCount = userMessages.filter(msg => 
        msg.recipientId === user.id && !msg.isRead
      ).length;

      return {
        id: `conv-${otherUser.id}`,
        participants: [
          { id: user.id, name: user.name || user.email || 'You', email: user.email || '', role: userRole },
          otherUser
        ],
        lastMessage,
        unreadCount,
        isPinned: false,
        isArchived: false,
        createdAt: lastMessage?.timestamp || new Date().toISOString(),
        updatedAt: lastMessage?.timestamp || new Date().toISOString()
      };
    });

    // Sort conversations by last message time
    const sortedConversations = generatedConversations.sort((a, b) => 
      new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );

    setConversations(sortedConversations);
  }, [user, availableUsers, getMessages, userRole]);

  // Subscribe to message updates
  useEffect(() => {
    const unsubscribe = subscribeToUpdates((updateType, data) => {
      if (updateType === 'message_created' || updateType === 'message_updated') {
        console.log('📨 Message update received:', updateType, data);
        // Refresh conversations and messages
        loadConversationMessages(selectedConversation);
      }
    });

    return unsubscribe;
  }, [subscribeToUpdates, selectedConversation]);

  // Load messages for selected conversation
  const loadConversationMessages = (conversationId: string | null) => {
    if (!conversationId || !user) {
      setConversationMessages([]);
      return;
    }

    const conversation = conversations.find(c => c.id === conversationId);
    if (!conversation) return;

    // Get messages between current user and the other participant
    const otherParticipant = conversation.participants.find(p => p.id !== user.id);
    if (!otherParticipant) return;

    const conversationMsgs = getMessages().filter(msg => 
      (msg.senderId === user.id && msg.recipientId === otherParticipant.id) ||
      (msg.senderId === otherParticipant.id && msg.recipientId === user.id)
    );

    setConversationMessages(conversationMsgs.sort((a, b) => 
      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    ));
  };

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversationMessages]);

  const handleSendMessage = async (content: string) => {
    if (!content.trim() || !selectedConversation) return;

    const conversation = conversations.find(c => c.id === selectedConversation);
    if (!conversation) return;

    const recipient = conversation.participants.find(p => p.id !== user?.id);
    if (!recipient) return;

    try {
      await sendMessageToContext({
        senderId: user?.id || '',
        senderName: user?.name || user?.email || 'You',
        senderRole: userRole,
        recipientId: recipient.id,
        recipientName: recipient.name,
        content: content.trim(),
        priority: 'medium'
      });

      setMessageInput('');
      setReplyToMessage(null);
      
      // Refresh conversation messages
      loadConversationMessages(selectedConversation);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleNewMessage = async () => {
    if (!newMessageContent.trim() || !selectedRecipient) return;

    const recipient = availableUsers.find(u => u.id === selectedRecipient);
    if (!recipient) return;

    try {
      await sendMessageToContext({
        senderId: user?.id || '',
        senderName: user?.name || user?.email || 'You',
        senderRole: userRole,
        recipientId: recipient.id,
        recipientName: recipient.name,
        content: newMessageContent.trim(),
        priority: 'medium'
      });

      setNewMessageContent('');
      setSelectedRecipient('');
      setShowNewMessageDialog(false);
      
      // Refresh conversations
      console.log('New message sent successfully');
    } catch (error) {
      console.error('Error sending new message:', error);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(messageInput);
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 168) { // 7 days
      return date.toLocaleDateString([], { weekday: 'short', hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'instructor':
        return 'bg-blue-100 text-blue-800';
      case 'admin':
        return 'bg-purple-100 text-purple-800';
      case 'learner':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredConversations = conversations.filter(conv => {
    if (!searchQuery) return true;
    const participantNames = conv.participants
      .filter(p => p.id !== user?.id)
      .map(p => p.name.toLowerCase());
    return participantNames.some(name => name.includes(searchQuery.toLowerCase()));
  });

  const currentConversation = conversations.find(c => c.id === selectedConversation);
  const otherParticipant = currentConversation?.participants.find(p => p.id !== user?.id);

  return (
    <div className="flex h-[600px] bg-white rounded-lg border">
      {/* Conversations Sidebar */}
      <div className="w-1/3 border-r flex flex-col">
        {/* Header */}
        <div className="p-4 border-b">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Messages</h2>
            <Dialog open={showNewMessageDialog} onOpenChange={setShowNewMessageDialog}>
              <DialogTrigger asChild>
                <Button size="sm" className="flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  New Message
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>New Message</DialogTitle>
                  <DialogDescription>
                    Send a message to another user
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="recipient">Send to</Label>
                    <Select value={selectedRecipient} onValueChange={setSelectedRecipient}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a user" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableUsers
                          .filter(u => u.id !== user?.id)
                          .map(availableUser => (
                            <SelectItem key={availableUser.id} value={availableUser.id}>
                              <div className="flex items-center gap-2">
                                <Avatar className="w-6 h-6">
                                  <AvatarImage src={availableUser.avatar} />
                                  <AvatarFallback>{availableUser.name.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <span>{availableUser.name}</span>
                                <Badge className={getRoleColor(availableUser.role)}>
                                  {availableUser.role}
                                </Badge>
                              </div>
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="message">Message</Label>
                    <Textarea
                      id="message"
                      value={newMessageContent}
                      onChange={(e) => setNewMessageContent(e.target.value)}
                      placeholder="Type your message..."
                      rows={4}
                    />
                  </div>
                </div>

                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowNewMessageDialog(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleNewMessage} disabled={!selectedRecipient || !newMessageContent.trim()}>
                    Send Message
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
          
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Conversations List */}
        <ScrollArea className="flex-1">
          <div className="p-2 space-y-2">
            {filteredConversations.map((conversation) => {
              const otherParticipant = conversation.participants.find(p => p.id !== user?.id);
              const isUnread = conversation.unreadCount > 0;
              
              return (
                <Card
                  key={conversation.id}
                  className={`cursor-pointer transition-colors hover:bg-gray-50 ${
                    selectedConversation === conversation.id ? 'bg-blue-50 border-blue-200' : ''
                  } ${isUnread ? 'border-l-4 border-l-blue-500' : ''}`}
                  onClick={() => {
                    setSelectedConversation(conversation.id);
                    loadConversationMessages(conversation.id);
                  }}
                >
                  <CardContent className="p-3">
                    <div className="flex items-start gap-3">
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={otherParticipant?.avatar} />
                        <AvatarFallback>
                          {otherParticipant?.name.charAt(0) || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="font-medium text-sm truncate">
                            {conversation.participants.length > 2 
                              ? `${conversation.participants.length - 1} participants`
                              : otherParticipant?.name
                            }
                          </h3>
                          <div className="flex items-center gap-1">
                            {conversation.isPinned && (
                              <Star className="w-3 h-3 text-yellow-500 fill-current" />
                            )}
                            {conversation.lastMessage && (
                              <span className="text-xs text-gray-500">
                                {formatTime(conversation.lastMessage.timestamp)}
                              </span>
                            )}
                          </div>
                        </div>
                        
                        {conversation.lastMessage && (
                          <p className="text-sm text-gray-600 truncate mb-1">
                            {conversation.lastMessage.senderId === user?.id ? 'You: ' : ''}
                            {conversation.lastMessage.content}
                          </p>
                        )}
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {otherParticipant && (
                              <Badge className={`text-xs ${getRoleColor(otherParticipant.role)}`}>
                                {otherParticipant.role}
                              </Badge>
                            )}
                            {otherParticipant?.isOnline && (
                              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            )}
                          </div>
                          
                          {isUnread && (
                            <Badge className="bg-blue-500 text-white text-xs">
                              {conversation.unreadCount}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </ScrollArea>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedConversation ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={otherParticipant?.avatar} />
                    <AvatarFallback>
                      {otherParticipant?.name.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-medium">
                      {currentConversation?.participants.length > 2 
                        ? `${currentConversation.participants.length - 1} participants`
                        : otherParticipant?.name
                      }
                    </h3>
                    <div className="flex items-center gap-2">
                      {otherParticipant && (
                        <Badge className={`text-xs ${getRoleColor(otherParticipant.role)}`}>
                          {otherParticipant.role}
                        </Badge>
                      )}
                      {otherParticipant?.isOnline ? (
                        <span className="text-xs text-green-600">Online</span>
                      ) : (
                        <span className="text-xs text-gray-500">
                          Last seen {otherParticipant?.lastSeen}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="outline">
                    <Phone className="w-4 h-4" />
                  </Button>
                  <Button size="sm" variant="outline">
                    <Video className="w-4 h-4" />
                  </Button>
                  <Button size="sm" variant="outline">
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {conversationMessages.map((message) => {
                  const isOwnMessage = message.senderId === user?.id;
                  const sender = availableUsers.find(u => u.id === message.senderId) || 
                    (message.senderId === user?.id ? 
                      { id: user.id, name: user.name || user.email || 'You', email: user.email || '', role: userRole } : 
                      null
                    );
                  
                  return (
                    <div
                      key={message.id}
                      className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`flex gap-2 max-w-[70%] ${isOwnMessage ? 'flex-row-reverse' : 'flex-row'}`}>
                        {!isOwnMessage && (
                          <Avatar className="w-8 h-8">
                            <AvatarImage src={sender?.avatar} />
                            <AvatarFallback>
                              {sender?.name.charAt(0) || 'U'}
                            </AvatarFallback>
                          </Avatar>
                        )}
                        
                        <div className={`flex flex-col ${isOwnMessage ? 'items-end' : 'items-start'}`}>
                          {!isOwnMessage && (
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-sm font-medium">{message.senderName}</span>
                              <Badge className={`text-xs ${getRoleColor(message.senderRole)}`}>
                                {message.senderRole}
                              </Badge>
                            </div>
                          )}
                          
                          <div
                            className={`px-4 py-2 rounded-lg ${
                              isOwnMessage
                                ? 'bg-blue-500 text-white'
                                : 'bg-gray-100 text-gray-900'
                            }`}
                          >
                            {message.replyTo && (
                              <div className={`text-xs mb-2 p-2 rounded border-l-2 ${
                                isOwnMessage ? 'bg-blue-400 border-blue-300' : 'bg-gray-200 border-gray-300'
                              }`}>
                                <div className="font-medium">{message.replyTo.senderName}</div>
                                <div className="truncate">{message.replyTo.content}</div>
                              </div>
                            )}
                            
                            <p className="text-sm">{message.content}</p>
                            
                            {message.attachments && message.attachments.length > 0 && (
                              <div className="mt-2 space-y-1">
                                {message.attachments.map((attachment) => (
                                  <div key={attachment.id} className="flex items-center gap-2 text-xs">
                                    <Paperclip className="w-3 h-3" />
                                    <span>{attachment.name}</span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                          
                          <div className={`flex items-center gap-1 mt-1 text-xs text-gray-500 ${
                            isOwnMessage ? 'flex-row-reverse' : 'flex-row'
                          }`}>
                            <span>{formatTime(message.timestamp)}</span>
                            {isOwnMessage && (
                              <div className="flex items-center">
                                {message.isRead ? (
                                  <CheckCheck className="w-3 h-3 text-blue-500" />
                                ) : (
                                  <Check className="w-3 h-3" />
                                )}
                              </div>
                            )}
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
            <div className="p-4 border-t bg-gray-50">
              {replyToMessage && (
                <div className="mb-3 p-2 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs font-medium text-blue-600">
                        Replying to {replyToMessage.senderName}
                      </div>
                      <div className="text-xs text-blue-500 truncate">
                        {replyToMessage.content}
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setReplyToMessage(null)}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              )}
              
              <div className="flex items-end gap-2">
                <div className="flex-1">
                  <Textarea
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Type a message..."
                    className="min-h-[40px] max-h-[120px] resize-none"
                    rows={1}
                  />
                </div>
                
                <div className="flex items-center gap-1">
                  <Button size="sm" variant="ghost">
                    <Paperclip className="w-4 h-4" />
                  </Button>
                  <Button size="sm" variant="ghost">
                    <Smile className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => handleSendMessage(messageInput)}
                    disabled={!messageInput.trim()}
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            <div className="text-center">
              <MessageCircle className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium mb-2">Select a conversation</h3>
              <p>Choose a conversation from the sidebar to start messaging</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
