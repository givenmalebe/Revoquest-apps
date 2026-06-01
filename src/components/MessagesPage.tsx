import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  MessageCircle, 
  Send, 
  User, 
  Users, 
  Plus, 
  Search, 
  Phone, 
  Video, 
  MoreVertical,
  Star,
  Pin,
  Archive,
  Trash2,
  Settings,
  UserPlus,
  Hash,
  BookOpen,
  GraduationCap,
  Crown,
  AlertTriangle,
  UserMinus,
  Edit3,
  Check,
  X
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useChat } from "@/contexts/ChatContext";
import { useDataSync } from "@/contexts/DataSyncContext";

export const MessagesPage = () => {
  const { user } = useAuth();
  const { chats, activeChat, setActiveChat, sendMessage, markAsRead, loadMessages, isLoading, createChat, deleteChat, addGroupMember, removeGroupMember } = useChat();
  const { courses, students } = useDataSync();
  const [messageInput, setMessageInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showNewChatDialog, setShowNewChatDialog] = useState(false);
  const [selectedInstructor, setSelectedInstructor] = useState('');
  const [newGroupName, setNewGroupName] = useState('');
  const [selectedGroupMembers, setSelectedGroupMembers] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState('all');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [chatToDelete, setChatToDelete] = useState<string | null>(null);
  const [showGroupManagement, setShowGroupManagement] = useState(false);
  const [selectedLearners, setSelectedLearners] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const [isUserScrolling, setIsUserScrolling] = useState(false);
  const [isNearBottom, setIsNearBottom] = useState(true);

  const currentChat = chats.find(chat => chat.id === activeChat);

  // Get instructors from courses
  const instructors = useMemo(() => {
    const instructorMap = new Map();
    courses.forEach(course => {
      if (course.instructorId && course.instructor) {
        instructorMap.set(course.instructorId, {
          id: course.instructorId,
          name: course.instructor,
          role: 'instructor',
          courseTitle: course.title,
          isOnline: false
        });
      }
    });
    
    // For instructors, also include other instructors
    if (user?.role === 'instructor') {
      // Add other instructors from the same courses or all instructors
      courses.forEach(course => {
        if (course.instructorId && course.instructor && course.instructorId !== user?.id) {
          instructorMap.set(course.instructorId, {
            id: course.instructorId,
            name: course.instructor,
            role: 'instructor',
            courseTitle: course.title,
            isOnline: false
          });
        }
      });
    }
    
    return Array.from(instructorMap.values());
  }, [courses, user?.role, user?.id]);

  // Get other learners (for learners) or all learners (for instructors)
  const otherLearners = useMemo(() => {
    if (user?.role === 'instructor') {
      // For instructors, show all learners
      return students.map(student => ({
        id: student.id,
        name: `${student.firstName} ${student.lastName}`,
        role: 'learner',
        isOnline: false
      }));
    } else {
      // For learners, show other learners
      return students
        .filter(student => student.id !== user?.id)
        .map(student => ({
          id: student.id,
          name: `${student.firstName} ${student.lastName}`,
          role: 'learner',
          isOnline: false
        }));
    }
  }, [students, user?.id, user?.role]);

  // Filter chats based on search and tab
  const filteredChats = useMemo(() => {
    let filtered = chats;
    
    // Filter by tab
    if (activeTab === 'instructors') {
      filtered = chats.filter(chat => 
        chat.participants.some(p => p.role === 'instructor')
      );
    } else if (activeTab === 'groups') {
      filtered = chats.filter(chat => chat.type === 'group');
    } else if (activeTab === 'learners') {
      filtered = chats.filter(chat => 
        chat.participants.every(p => p.role === 'learner')
      );
    }
    
    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(chat => 
        chat.participants.some(p => 
          p.name.toLowerCase().includes(searchQuery.toLowerCase())
        ) ||
        (chat.lastMessage?.content.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }
    
    return filtered;
  }, [chats, activeTab, searchQuery]);

  // Load messages when chat changes
  useEffect(() => {
    if (activeChat) {
      loadMessages(activeChat);
    }
  }, [activeChat, loadMessages]);

  // Mark messages as read when chat becomes active
  useEffect(() => {
    if (activeChat) {
      markAsRead(activeChat);
    }
  }, [activeChat, markAsRead]);

  // Handle scroll events to detect user scrolling and position
  useEffect(() => {
    const scrollContainer = scrollAreaRef.current;
    if (!scrollContainer) return;

    let scrollTimeout: NodeJS.Timeout;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = scrollContainer;
      const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
      
      // Consider "near bottom" if within 50px of bottom
      const nearBottom = distanceFromBottom < 50;
      setIsNearBottom(nearBottom);
      
      // Detect if user is actively scrolling
      setIsUserScrolling(true);
      
      // Clear existing timeout
      clearTimeout(scrollTimeout);
      
      // Reset user scrolling flag after a shorter delay
      scrollTimeout = setTimeout(() => setIsUserScrolling(false), 150);
    };

    scrollContainer.addEventListener('scroll', handleScroll);
    return () => {
      scrollContainer.removeEventListener('scroll', handleScroll);
      clearTimeout(scrollTimeout);
    };
  }, []);

  // Auto-scroll to bottom when new messages arrive (only if user is near bottom and not scrolling)
  useEffect(() => {
    if (scrollAreaRef.current && isNearBottom && !isUserScrolling && currentChat?.messages) {
      // Use requestAnimationFrame for smoother scrolling
      requestAnimationFrame(() => {
        if (scrollAreaRef.current) {
          scrollAreaRef.current.scrollTo({
            top: scrollAreaRef.current.scrollHeight,
            behavior: 'smooth'
          });
        }
      });
    }
  }, [currentChat?.messages, isNearBottom, isUserScrolling]);

  // Scroll when activeChat changes (always scroll to bottom for new chat)
  useEffect(() => {
    if (scrollAreaRef.current && activeChat) {
      // Reset scroll state when switching chats
      setIsNearBottom(true);
      setIsUserScrolling(false);
      
      // Scroll to bottom after a short delay to ensure messages are loaded
      setTimeout(() => {
        if (scrollAreaRef.current) {
          scrollAreaRef.current.scrollTo({
            top: scrollAreaRef.current.scrollHeight,
            behavior: 'smooth'
          });
        }
      }, 100);
    }
  }, [activeChat]);

  const handleSendMessage = async (content: string) => {
    if (!content.trim() || !activeChat) return;
    
    // Mark as near bottom before sending (user is sending, so they want to see their message)
    setIsNearBottom(true);
    setIsUserScrolling(false);
    
    await sendMessage(content, activeChat);
    setMessageInput('');
    
    // Scroll to bottom after sending message
    requestAnimationFrame(() => {
      if (scrollAreaRef.current) {
        scrollAreaRef.current.scrollTo({
          top: scrollAreaRef.current.scrollHeight,
          behavior: 'smooth'
        });
      }
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(messageInput);
    }
  };

  const handleCreateInstructorChat = async () => {
    if (!selectedInstructor || !user) return;
    
    const instructor = instructors.find(inst => inst.id === selectedInstructor);
    if (!instructor) return;

    const userParticipant = {
      id: user.id,
      name: `${user.firstName} ${user.lastName}`,
      role: user.role || 'learner',
      isOnline: true
    };

    const chatId = await createChat([instructor, userParticipant], 'direct');
    setActiveChat(chatId);
    setShowNewChatDialog(false);
    setSelectedInstructor('');
  };

  const handleCreateGroupChat = async () => {
    if (!newGroupName || selectedGroupMembers.length === 0 || !user) return;
    
    const groupMembers = selectedGroupMembers.map(memberId => {
      const member = otherLearners.find(l => l.id === memberId);
      return member || { id: memberId, name: 'Unknown', role: 'learner', isOnline: false };
    });

    const userParticipant = {
      id: user.id,
      name: `${user.firstName} ${user.lastName}`,
      role: user.role || 'learner',
      isOnline: true
    };
    
    const chatId = await createChat([userParticipant, ...groupMembers], 'group');
    setActiveChat(chatId);
    setShowNewChatDialog(false);
    setNewGroupName('');
    setSelectedGroupMembers([]);
  };

  const handleDeleteChat = (chatId: string) => {
    setChatToDelete(chatId);
    setShowDeleteDialog(true);
  };

  const confirmDeleteChat = async () => {
    if (chatToDelete) {
      await deleteChat(chatToDelete);
      setShowDeleteDialog(false);
      setChatToDelete(null);
    }
  };

  const handleAddLearnersToGroup = async () => {
    if (!activeChat || selectedLearners.length === 0) return;
    
    const learnersToAdd = selectedLearners.map(learnerId => {
      const learner = students.find(s => s.id === learnerId);
      return {
        id: learnerId,
        name: learner ? `${learner.firstName} ${learner.lastName}` : 'Unknown',
        role: 'learner',
        isOnline: false
      };
    });

    for (const learner of learnersToAdd) {
      await addGroupMember(activeChat, learner);
    }
    
    setSelectedLearners([]);
    setShowGroupManagement(false);
  };

  const handleRemoveLearnerFromGroup = async (participantId: string) => {
    if (!activeChat) return;
    await removeGroupMember(activeChat, participantId);
  };

  const formatTime = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return timestamp.toLocaleDateString();
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400';
      case 'instructor': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'learner': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin': return <Crown className="w-3 h-3" />;
      case 'instructor': return <GraduationCap className="w-3 h-3" />;
      case 'learner': return <User className="w-3 h-3" />;
      default: return <User className="w-3 h-3" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageCircle className="w-6 h-6 text-blue-600" />
          <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Messages
          </h2>
        </div>
        
        <Dialog open={showNewChatDialog} onOpenChange={setShowNewChatDialog}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white">
              <Plus className="w-4 h-4 mr-2" />
              New Chat
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Start a New Chat</DialogTitle>
              <DialogDescription>
                Choose who you'd like to message
              </DialogDescription>
            </DialogHeader>
            
            <Tabs defaultValue="instructor" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="instructor">Instructor</TabsTrigger>
                <TabsTrigger value="group">Group</TabsTrigger>
              </TabsList>
              
              <TabsContent value="instructor" className="space-y-4">
                <div>
                  <Label htmlFor="instructor-select">Select Instructor</Label>
                  <Select value={selectedInstructor} onValueChange={setSelectedInstructor}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose an instructor..." />
                    </SelectTrigger>
                    <SelectContent>
                      {instructors.map((instructor) => (
                        <SelectItem key={instructor.id} value={instructor.id}>
      <div className="flex items-center gap-2">
                            <GraduationCap className="w-4 h-4" />
                            <span>{instructor.name}</span>
                            <span className="text-xs text-muted-foreground">({instructor.courseTitle})</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowNewChatDialog(false)}>
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleCreateInstructorChat}
                    disabled={!selectedInstructor}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    Start Chat
                  </Button>
                </DialogFooter>
              </TabsContent>
              
              <TabsContent value="group" className="space-y-4">
                <div>
                  <Label htmlFor="group-name">Group Name</Label>
                  <Input
                    id="group-name"
                    value={newGroupName}
                    onChange={(e) => setNewGroupName(e.target.value)}
                    placeholder="Enter group name..."
                  />
                </div>
                
                <div>
                  <Label>Select Members</Label>
                  <div className="max-h-40 overflow-y-auto space-y-2 mt-2">
                    {otherLearners.map((learner) => (
                      <div key={learner.id} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id={learner.id}
                          checked={selectedGroupMembers.includes(learner.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedGroupMembers([...selectedGroupMembers, learner.id]);
                            } else {
                              setSelectedGroupMembers(selectedGroupMembers.filter(id => id !== learner.id));
                            }
                          }}
                        />
                        <label htmlFor={learner.id} className="flex items-center gap-2 text-sm">
                          <User className="w-4 h-4" />
                          {learner.name}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
                
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowNewChatDialog(false)}>
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleCreateGroupChat}
                    disabled={!newGroupName || selectedGroupMembers.length === 0}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    Create Group
                  </Button>
                </DialogFooter>
              </TabsContent>
            </Tabs>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Chat List */}
        <Card className="lg:col-span-1">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Conversations</CardTitle>
              <Badge variant="secondary">{filteredChats.length}</Badge>
            </div>
            
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="all" className="text-xs">All</TabsTrigger>
                <TabsTrigger value="instructors" className="text-xs">Instructors</TabsTrigger>
                <TabsTrigger value="groups" className="text-xs">Groups</TabsTrigger>
                <TabsTrigger value="learners" className="text-xs">Learners</TabsTrigger>
              </TabsList>
            </Tabs>
          </CardHeader>
          
          <CardContent className="p-0">
            <ScrollArea className="h-96">
              <div className="p-4 space-y-2">
                {filteredChats.length === 0 ? (
                  <div className="text-center text-muted-foreground py-8">
                    <MessageCircle className="w-8 h-8 mx-auto mb-2" />
                    <p className="text-sm">No conversations found</p>
                    <p className="text-xs mt-1">Start a new chat to begin messaging</p>
                  </div>
                ) : (
                  filteredChats.map((chat) => {
                    const otherParticipants = chat.participants.filter(p => p.id !== user?.id);
                    const isGroup = chat.type === 'group';
                    const displayName = isGroup 
                      ? chat.participants.length > 2 
                        ? `${chat.participants.length} members`
                        : otherParticipants.map(p => p.name).join(', ')
                      : otherParticipants[0]?.name || 'Unknown';
                    
                    return (
                    <div
                      key={chat.id}
                        className={`p-3 rounded-lg transition-all duration-200 ${
                        activeChat === chat.id 
                            ? 'bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 shadow-md' 
                            : 'hover:bg-gray-50 hover:shadow-sm'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div 
                          className="flex-1 flex items-center gap-3 cursor-pointer"
                          onClick={() => setActiveChat(chat.id)}
                        >
                          <Avatar className="w-10 h-10">
                              <AvatarFallback className={`${
                                isGroup ? 'bg-gradient-to-br from-green-100 to-blue-100' : 'bg-gradient-to-br from-blue-100 to-purple-100'
                              }`}>
                                {isGroup ? <Users className="w-5 h-5" /> : displayName.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                                <h3 className="font-medium text-sm truncate flex items-center gap-1">
                                  {isGroup && <Hash className="w-3 h-3 text-muted-foreground" />}
                                  {displayName}
                              </h3>
                              {chat.unreadCount > 0 && (
                                  <Badge variant="destructive" className="text-xs min-w-[20px] h-5 flex items-center justify-center">
                                  {chat.unreadCount}
                                </Badge>
                              )}
                            </div>
                            
                            <div className="flex items-center gap-2 mt-1">
                                {otherParticipants.map((participant, index) => (
                                  <Badge 
                                    key={participant.id} 
                                    variant="outline" 
                                    className={`text-xs ${getRoleColor(participant.role)} flex items-center gap-1`}
                                  >
                                    {getRoleIcon(participant.role)}
                                    {participant.role}
                              </Badge>
                                ))}
                            </div>
                            
                            {chat.lastMessage && (
                              <p className="text-xs text-muted-foreground mt-1 truncate">
                                  {chat.lastMessage.senderId === user?.id ? 'You: ' : ''}
                                {chat.lastMessage.content}
                              </p>
                            )}
                          </div>
                        </div>
                        
                        {/* Delete Button */}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteChat(chat.id);
                          }}
                          className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    );
                  })
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Chat Area */}
        <Card className="lg:col-span-3">
          {currentChat ? (
            <>
              <CardHeader className="pb-3 border-b">
                <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="w-10 h-10">
                      <AvatarFallback className={`${
                        currentChat.type === 'group' 
                          ? 'bg-gradient-to-br from-green-100 to-blue-100' 
                          : 'bg-gradient-to-br from-blue-100 to-purple-100'
                      }`}>
                        {currentChat.type === 'group' ? <Users className="w-5 h-5" /> : 
                         currentChat.participants.find(p => p.id !== user?.id)?.name.charAt(0) || '?'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                      <CardTitle className="text-lg flex items-center gap-2">
                        {currentChat.type === 'group' ? (
                          <>
                            <Hash className="w-4 h-4 text-muted-foreground" />
                            {currentChat.participants.length > 2 
                              ? `${currentChat.participants.length} members`
                              : currentChat.participants.filter(p => p.id !== user?.id).map(p => p.name).join(', ')
                            }
                          </>
                        ) : (
                          currentChat.participants.find(p => p.id !== user?.id)?.name || 'Unknown'
                        )}
                    </CardTitle>
                      <div className="flex items-center gap-2">
                        {currentChat.participants
                          .filter(p => p.id !== user?.id)
                          .map((participant) => (
                            <Badge 
                              key={participant.id}
                              variant="outline" 
                              className={`text-xs ${getRoleColor(participant.role)} flex items-center gap-1`}
                            >
                              {getRoleIcon(participant.role)}
                              {participant.role}
                    </Badge>
                          ))
                        }
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {user?.role === 'instructor' && currentChat.type === 'group' && (
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => setShowGroupManagement(true)}
                        className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                      >
                        <Edit3 className="w-4 h-4 mr-1" />
                        Manage Group
                      </Button>
                    )}
                    <Button variant="ghost" size="sm">
                      <Phone className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Video className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="p-0">
                {/* Messages */}
                <div ref={scrollAreaRef} className="h-96 p-4 overflow-y-auto relative">
                  <div className="space-y-4">
                    {currentChat.messages && currentChat.messages.length > 0 ? currentChat.messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.senderId === user?.id ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`flex gap-2 max-w-[80%] ${message.senderId === user?.id ? 'flex-row-reverse' : 'flex-row'}`}>
                          {message.senderId !== user?.id && (
                            <Avatar className="w-8 h-8">
                              <AvatarFallback className="bg-gray-100 text-xs">
                                {message.senderName.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                          )}
                          
                          <div className={`flex flex-col ${message.senderId === user?.id ? 'items-end' : 'items-start'}`}>
                            <div
                              className={`px-4 py-2 rounded-2xl ${
                                message.senderId === user?.id
                                  ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white'
                                  : 'bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-gray-100'
                              }`}
                            >
                              <p className="text-sm">{message.content}</p>
                            </div>
                            
                            <div className={`flex items-center gap-1 mt-1 ${message.senderId === user?.id ? 'flex-row-reverse' : 'flex-row'}`}>
                              <span className="text-xs text-muted-foreground">
                                {message.senderId === user?.id ? 'You' : message.senderName}
                              </span>
                              <span className="text-xs text-muted-foreground">•</span>
                              <span className="text-xs text-muted-foreground">
                                {formatTime(message.timestamp)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )) : (
                      <div className="text-center text-muted-foreground py-8">
                        <MessageCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
                        <p>No messages yet. Start the conversation!</p>
                      </div>
                    )}
                    
                    {isLoading && (
                      <div className="flex justify-start">
                        <div className="flex gap-2">
                          <Avatar className="w-8 h-8">
                            <AvatarFallback className="bg-gray-100 text-xs">
                              {currentChat.participants.find(p => p.id !== user?.id)?.name.charAt(0) || '?'}
                            </AvatarFallback>
                          </Avatar>
                          <div className="bg-gray-100 px-4 py-2 rounded-2xl">
                            <div className="flex gap-1">
                              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    <div ref={messagesEndRef} />
                  </div>
                  
        {/* Scroll to Bottom Button */}
        {!isNearBottom && (
          <div className="absolute bottom-4 right-4">
            <Button
              size="sm"
              className="rounded-full shadow-lg"
              onClick={() => {
                if (scrollAreaRef.current) {
                  // Mark as user action to prevent auto-scroll interference
                  setIsUserScrolling(true);
                  setIsNearBottom(true);
                  
                  scrollAreaRef.current.scrollTo({
                    top: scrollAreaRef.current.scrollHeight,
                    behavior: 'smooth'
                  });
                  
                  // Reset user scrolling after scroll completes
                  setTimeout(() => setIsUserScrolling(false), 300);
                }
              }}
            >
              <MessageCircle className="w-4 h-4" />
            </Button>
          </div>
        )}
                </div>

                {/* Message Input */}
                <div className="p-4 border-t bg-gray-50/50 dark:bg-gray-900/50">
                  <div className="flex gap-2">
                    <Input
                      value={messageInput}
                      onChange={(e) => setMessageInput(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Type your message..."
                      className="flex-1 rounded-full"
                      disabled={isLoading}
                    />
                    <Button 
                      onClick={() => handleSendMessage(messageInput)}
                      disabled={!messageInput.trim() || isLoading}
                      className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-full px-6"
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </>
          ) : (
            <CardContent className="flex items-center justify-center h-96">
              <div className="text-center">
                <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                  <MessageCircle className="w-12 h-12 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Select a conversation</h3>
                <p className="text-muted-foreground mb-4">
                  Choose a chat from the sidebar to start messaging
                </p>
                <Button 
                  onClick={() => setShowNewChatDialog(true)}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Start New Chat
                </Button>
              </div>
            </CardContent>
          )}
        </Card>
      </div>

      {/* Group Management Dialog */}
      <Dialog open={showGroupManagement} onOpenChange={setShowGroupManagement}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Manage Group Members
            </DialogTitle>
            <DialogDescription>
              Add or remove learners from this group chat.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Current Members */}
            <div>
              <h4 className="font-medium mb-3">Current Members ({currentChat?.participants.length || 0})</h4>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {currentChat?.participants.map((participant) => (
                  <div key={participant.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Avatar className="w-6 h-6">
                        <AvatarFallback className="text-xs">
                          {participant.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm font-medium">{participant.name}</span>
                      <Badge variant="outline" className={`text-xs ${getRoleColor(participant.role)}`}>
                        {participant.role}
                      </Badge>
                    </div>
                    {participant.id !== user?.id && user?.role === 'instructor' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveLearnerFromGroup(participant.id)}
                        className="h-6 w-6 p-0 text-destructive hover:bg-destructive/10"
                      >
                        <UserMinus className="w-3 h-3" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Add New Members */}
            <div>
              <h4 className="font-medium mb-3">Add Learners</h4>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {students
                  .filter(student => !currentChat?.participants.some(p => p.id === student.id))
                  .map((student) => (
                    <div key={student.id} className="flex items-center justify-between p-2 border rounded-lg">
                      <div className="flex items-center gap-2">
                        <Avatar className="w-6 h-6">
                          <AvatarFallback className="text-xs">
                            {student.firstName.charAt(0)}{student.lastName.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm font-medium">
                          {student.firstName} {student.lastName}
                        </span>
                        <Badge variant="outline" className="text-xs">
                          learner
                        </Badge>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          if (selectedLearners.includes(student.id)) {
                            setSelectedLearners(prev => prev.filter(id => id !== student.id));
                          } else {
                            setSelectedLearners(prev => [...prev, student.id]);
                          }
                        }}
                        className={`h-6 w-6 p-0 ${
                          selectedLearners.includes(student.id)
                            ? 'text-green-600 bg-green-50'
                            : 'text-muted-foreground hover:text-green-600'
                        }`}
                      >
                        {selectedLearners.includes(student.id) ? (
                          <Check className="w-3 h-3" />
                        ) : (
                          <UserPlus className="w-3 h-3" />
                        )}
                      </Button>
                    </div>
                  ))}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowGroupManagement(false);
                setSelectedLearners([]);
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddLearnersToGroup}
              disabled={selectedLearners.length === 0}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              <UserPlus className="w-4 h-4 mr-2" />
              Add {selectedLearners.length} Learner{selectedLearners.length !== 1 ? 's' : ''}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-destructive" />
              Delete Conversation
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this conversation? This action cannot be undone and will permanently remove all messages in this chat.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDeleteChat}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete Conversation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};