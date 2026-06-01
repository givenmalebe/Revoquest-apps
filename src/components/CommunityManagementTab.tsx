import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { useAuth } from '@/contexts/AuthContext';
import { DatabaseService, CommunityPost } from '@/firebase/database';
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Pin, Megaphone, Calendar as CalendarIcon } from 'lucide-react';

export const CommunityManagementTab = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [editingPost, setEditingPost] = useState<CommunityPost | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    type: 'announcement' as CommunityPost['type'],
    targetAudience: 'all' as CommunityPost['targetAudience'],
    isPublished: false,
    isPinned: false,
    metadataLink: '',
    metadataLinkText: '',
    metadataImageUrl: '',
    targetCourseId: '',
  });

  const fetchPosts = useCallback(async () => {
    try {
      setLoading(true);
      const allPosts = await DatabaseService.getAllCommunityPosts();
      setPosts(allPosts);
    } catch (error) {
      console.error('Error fetching community posts:', error);
      toast.error('Failed to load community posts');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const resetForm = () => {
    setFormData({
      title: '',
      content: '',
      type: 'announcement',
      targetAudience: 'all',
      isPublished: false,
      isPinned: false,
      metadataLink: '',
      metadataLinkText: '',
      metadataImageUrl: '',
      targetCourseId: '',
    });
    setEditingPost(null);
  };

  const handleOpenCreate = () => {
    resetForm();
    setShowDialog(true);
  };

  const handleOpenEdit = (post: CommunityPost) => {
    setEditingPost(post);
    setFormData({
      title: post.title,
      content: post.content,
      type: post.type,
      targetAudience: post.targetAudience,
      isPublished: post.isPublished,
      isPinned: post.isPinned,
      metadataLink: post.metadata?.link || '',
      metadataLinkText: post.metadata?.linkText || '',
      metadataImageUrl: post.metadata?.imageUrl || '',
      targetCourseId: post.targetCourseId || '',
    });
    setShowDialog(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      const postData = {
        title: formData.title,
        content: formData.content,
        type: formData.type,
        targetAudience: formData.targetAudience,
        isPublished: formData.isPublished,
        isPinned: formData.isPinned,
        targetCourseId: formData.targetCourseId || undefined,
        authorId: user.id,
        authorName: `${user.firstName} ${user.lastName}`,
        authorRole: user.role as 'admin' | 'instructor',
        authorAvatar: user.avatar,
        metadata: {
          link: formData.metadataLink || undefined,
          linkText: formData.metadataLinkText || undefined,
          imageUrl: formData.metadataImageUrl || undefined,
        },
      };

      if (editingPost) {
        await DatabaseService.updateCommunityPost(editingPost.id, postData);
        toast.success('Community post updated successfully');
      } else {
        await DatabaseService.createCommunityPost(postData);
        toast.success('Community post created successfully');
      }

      setShowDialog(false);
      resetForm();
      fetchPosts();
    } catch (error) {
      console.error('Error saving community post:', error);
      toast.error(editingPost ? 'Failed to update post' : 'Failed to create post');
    }
  };

  const handleDelete = async (postId: string) => {
    if (!confirm('Are you sure you want to delete this post?')) return;

    try {
      await DatabaseService.deleteCommunityPost(postId);
      toast.success('Post deleted successfully');
      fetchPosts();
    } catch (error) {
      console.error('Error deleting post:', error);
      toast.error('Failed to delete post');
    }
  };

  const getTypeBadgeVariant = (type: CommunityPost['type']) => {
    switch (type) {
      case 'announcement': return 'default';
      case 'event': return 'secondary';
      case 'promotion': return 'outline';
      case 'sale': return 'destructive';
      case 'news': return 'default';
      default: return 'outline';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Community Posts</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Create and manage announcements, events, and promotions for learners
          </p>
        </div>
        <Button onClick={handleOpenCreate} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          New Post
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {posts.map(post => (
            <Card key={post.id} className={`overflow-hidden ${post.isPinned ? 'border-orange-300 dark:border-orange-700' : ''}`}>
              {post.isPinned && (
                <div className="bg-orange-100 dark:bg-orange-900/30 px-3 py-1 flex items-center gap-2">
                  <Pin className="w-3 h-3 text-orange-600 dark:text-orange-400" />
                  <span className="text-xs font-medium text-orange-600 dark:text-orange-400">Pinned</span>
                </div>
              )}
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start gap-2">
                  <CardTitle className="text-base line-clamp-2">{post.title}</CardTitle>
                  <Badge variant={getTypeBadgeVariant(post.type)} className="flex items-center gap-1 shrink-0">
                    <Megaphone className="w-3 h-3" />
                    {post.type}
                  </Badge>
                </div>
                <CardDescription className="text-xs">
                  by {post.authorName} • {post.isPublished ? 'Published' : 'Draft'}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-sm text-slate-600 dark:text-slate-300 line-clamp-3 mb-4">
                  {post.content.replace(/<[^>]*>/g, '').slice(0, 150)}...
                </p>
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <div className="flex items-center gap-3">
                    {post.metadata?.link && (
                      <span className="flex items-center gap-1">
                        <ExternalLink className="w-3 h-3" /> link
                      </span>
                    )}
                    {post.metadata?.imageUrl && (
                      <span className="flex items-center gap-1">
                        <Image className="w-3 h-3" /> image
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleOpenEdit(post)}
                      className="h-7 px-2"
                    >
                      <Pencil className="w-3 h-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDelete(post.id)}
                      className="h-7 px-2 text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          {posts.length === 0 && (
            <Card className="col-span-full">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Megaphone className="w-12 h-12 text-slate-300 mb-4" />
                <p className="text-slate-500">No community posts yet</p>
                <Button onClick={handleOpenCreate} variant="outline" className="mt-4">
                  Create your first post
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingPost ? 'Edit Community Post' : 'Create Community Post'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </div>

            <div>
              <Label htmlFor="content">Content *</Label>
              <Textarea
                id="content"
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                required
                rows={6}
              />
              <p className="text-xs text-slate-500 mt-1">HTML is supported for rich formatting</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="type">Type *</Label>
                <Select value={formData.type} onValueChange={(value: CommunityPost['type']) => setFormData({ ...formData, type: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="announcement">Announcement</SelectItem>
                    <SelectItem value="event">Event</SelectItem>
                    <SelectItem value="promotion">Promotion</SelectItem>
                    <SelectItem value="sale">Sale</SelectItem>
                    <SelectItem value="news">News</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="targetAudience">Target Audience *</Label>
                <Select value={formData.targetAudience} onValueChange={(value: CommunityPost['targetAudience']) => setFormData({ ...formData, targetAudience: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Enrolled Learners</SelectItem>
                    <SelectItem value="course">Specific Course</SelectItem>
                    <SelectItem value="specific">Specific Learners</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {formData.targetAudience === 'course' && (
              <div>
                <Label htmlFor="targetCourseId">Target Course ID</Label>
                <Input
                  id="targetCourseId"
                  value={formData.targetCourseId}
                  onChange={(e) => setFormData({ ...formData, targetCourseId: e.target.value })}
                  placeholder="Enter course ID (optional)"
                />
              </div>
            )}

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="isPublished">Publish immediately</Label>
                <Switch
                  id="isPublished"
                  checked={formData.isPublished}
                  onCheckedChange={(checked) => setFormData({ ...formData, isPublished: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="isPinned">Pin to top</Label>
                <Switch
                  id="isPinned"
                  checked={formData.isPinned}
                  onCheckedChange={(checked) => setFormData({ ...formData, isPinned: checked })}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="metadataLink">Call-to-Action Link (optional)</Label>
              <Input
                id="metadataLink"
                value={formData.metadataLink}
                onChange={(e) => setFormData({ ...formData, metadataLink: e.target.value })}
                placeholder="https://..."
              />
            </div>

            <div>
              <Label htmlFor="metadataLinkText">Link Text (optional)</Label>
              <Input
                id="metadataLinkText"
                value={formData.metadataLinkText}
                onChange={(e) => setFormData({ ...formData, metadataLinkText: e.target.value })}
                placeholder="Learn More"
              />
            </div>

            <div>
              <Label htmlFor="metadataImageUrl">Image URL (optional)</Label>
              <Input
                id="metadataImageUrl"
                value={formData.metadataImageUrl}
                onChange={(e) => setFormData({ ...formData, metadataImageUrl: e.target.value })}
                placeholder="https://..."
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => { setShowDialog(false); resetForm(); }}>
                Cancel
              </Button>
              <Button type="submit">
                {editingPost ? 'Update' : 'Create'} Post
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};
