import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Calendar, Pin, ExternalLink, Image as ImageIcon, Megaphone, Tag } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { DatabaseService, CommunityPost } from '@/firebase/database';
import { formatDistanceToNow } from 'date-fns';

export const CommunityPage = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'announcement' | 'event' | 'promotion' | 'news'>('all');

  const fetchPosts = useCallback(async () => {
    try {
      setLoading(true);
      const fetchedPosts = await DatabaseService.getCommunityPostsForLearner(user?.id || '', {
        includeExpired: false,
        includeUnpublished: false,
      });
      setPosts(fetchedPosts);
    } catch (error) {
      console.error('Error fetching community posts:', error);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchPosts();
    // Optional: subscribe to real-time updates
    // const unsubscribe = DatabaseService.subscribeToCommunityPosts(setPosts);
    // return () => unsubscribe();
  }, [fetchPosts]);

  const getTypeIcon = (type: CommunityPost['type']) => {
    switch (type) {
      case 'announcement': return <Megaphone className="w-4 h-4" />;
      case 'event': return <Calendar className="w-4 h-4" />;
      case 'promotion': return <Tag className="w-4 h-4" />;
      case 'sale': return <Tag className="w-4 h-4" />;
      case 'news': return <Megaphone className="w-4 h-4" />;
      default: return <Megaphone className="w-4 h-4" />;
    }
  };

  const getTypeLabel = (type: CommunityPost['type']) => {
    return type.charAt(0).toUpperCase() + type.slice(1);
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch {
      return new Date(dateString).toLocaleDateString();
    }
  };

  const filteredPosts = filter === 'all'
    ? posts
    : posts.filter(post => post.type === filter);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Community</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            stay updated with announcements, events, and news from your instructors
          </p>
        </div>
        <div className="flex gap-2">
          <Badge
            variant={filter === 'all' ? 'default' : 'outline'}
            className="cursor-pointer"
            onClick={() => setFilter('all')}
          >
            All
          </Badge>
          <Badge
            variant={filter === 'announcement' ? 'default' : 'outline'}
            className="cursor-pointer"
            onClick={() => setFilter('announcement')}
          >
            Announcements
          </Badge>
          <Badge
            variant={filter === 'event' ? 'default' : 'outline'}
            className="cursor-pointer"
            onClick={() => setFilter('event')}
          >
            Events
          </Badge>
          <Badge
            variant={filter === 'promotion' ? 'default' : 'outline'}
            className="cursor-pointer"
            onClick={() => setFilter('promotion')}
          >
            Promotions
          </Badge>
        </div>
      </div>

      {filteredPosts.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Megaphone className="w-12 h-12 text-gray-300 mb-4" />
            <p className="text-gray-500 dark:text-gray-400">No community posts yet</p>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
              Check back later for announcements and updates
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredPosts.map(post => (
            <Card key={post.id} className={`overflow-hidden ${post.isPinned ? 'border-orange-300 dark:border-orange-700' : ''}`}>
              {post.isPinned && (
                <div className="bg-orange-100 dark:bg-orange-900/30 px-4 py-1 flex items-center gap-2">
                  <Pin className="w-3 h-3 text-orange-600 dark:text-orange-400" />
                  <span className="text-xs font-medium text-orange-600 dark:text-orange-400">Pinned</span>
                </div>
              )}
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <Avatar className="w-10 h-10">
                      {post.authorAvatar ? (
                        <img src={post.authorAvatar} alt={post.authorName} />
                      ) : (
                        <AvatarFallback className="bg-orange-100 text-orange-600 dark:bg-orange-900 dark:text-orange-400">
                          {getInitials(post.authorName)}
                        </AvatarFallback>
                      )}
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-lg">{post.title}</CardTitle>
                        <Badge variant="secondary" className="flex items-center gap-1">
                          {getTypeIcon(post.type)}
                          {getTypeLabel(post.type)}
                        </Badge>
                      </div>
                      <CardDescription className="mt-1">
                        by {post.authorName} • {formatDate(post.publishedAt || post.createdAt)}
                      </CardDescription>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div
                  className="prose prose-sm dark:prose-invert max-w-none mb-4"
                  dangerouslySetInnerHTML={{ __html: post.content }}
                />

                {post.metadata?.imageUrl && (
                  <div className="mb-4">
                    <img
                      src={post.metadata.imageUrl}
                      alt=""
                      className="max-w-full h-auto rounded-lg max-h-96 object-cover"
                    />
                  </div>
                )}

                {post.metadata?.link && (
                  <Button asChild variant="outline" size="sm">
                    <a href={post.metadata.link} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                      {post.metadata.linkText || 'Learn More'}
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
