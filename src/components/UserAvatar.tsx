import React, { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

interface UserAvatarProps {
  user?: {
    avatar?: string;
    firstName?: string;
    lastName?: string;
    name?: string; // For backward compatibility
    email?: string;
  };
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showName?: boolean;
  fallbackClassName?: string;
}

const sizeClasses = {
  sm: 'w-6 h-6',
  md: 'w-8 h-8',
  lg: 'w-12 h-12',
  xl: 'w-20 h-20'
};

const textSizeClasses = {
  sm: 'text-xs',
  md: 'text-sm',
  lg: 'text-base',
  xl: 'text-lg'
};

export const UserAvatar: React.FC<UserAvatarProps> = ({
  user,
  size = 'md',
  className,
  showName = false,
  fallbackClassName
}) => {
  const [imageLoading, setImageLoading] = useState(false);
  const [imageError, setImageError] = useState(false);

  if (!user) {
    return (
      <Avatar className={cn(sizeClasses[size], className)}>
        <AvatarFallback className={cn(
          'bg-gray-100 text-gray-600',
          textSizeClasses[size],
          fallbackClassName
        )}>
          ?
        </AvatarFallback>
      </Avatar>
    );
  }

  // Get initials from firstName/lastName, name, or email — never a generic "U"
  const getInitials = () => {
    const first = (user.firstName || '').trim();
    const last = (user.lastName || '').trim();
    if (first && last) {
      return `${first[0]}${last[0]}`.toUpperCase();
    }
    if (first) return first[0].toUpperCase();
    if (last) return last[0].toUpperCase();
    if (user.name?.trim()) {
      return user.name
        .split(/\s+/)
        .filter(Boolean)
        .map((n) => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase();
    }
    if (user.email?.trim()) return user.email.trim()[0].toUpperCase();
    return '?';
  };

  const initials = getInitials();

  const handleImageLoad = () => {
    setImageLoading(false);
    setImageError(false);
  };

  const handleImageError = () => {
    setImageLoading(false);
    setImageError(true);
  };

  const handleImageLoadStart = () => {
    setImageLoading(true);
    setImageError(false);
  };

  return (
    <div className={cn('flex items-center gap-2', showName && 'flex-col')}>
      <Avatar className={cn(sizeClasses[size], className)}>
        {user.avatar && !imageError ? (
          <>
            <AvatarImage 
              src={user.avatar} 
              onLoad={handleImageLoad}
              onError={handleImageError}
              onLoadStart={handleImageLoadStart}
            />
            {imageLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                <Loader2 className={cn('animate-spin text-gray-400', textSizeClasses[size])} />
              </div>
            )}
          </>
        ) : null}
        <AvatarFallback className={cn(
          'bg-blue-100 text-blue-600',
          textSizeClasses[size],
          fallbackClassName
        )}>
          {initials}
        </AvatarFallback>
      </Avatar>
      {showName && (
        <span className="text-sm font-medium text-gray-900 truncate max-w-20">
          {user.firstName && user.lastName 
            ? `${user.firstName} ${user.lastName}`
            : user.name || user.email || 'Unknown User'
          }
        </span>
      )}
    </div>
  );
};

export default UserAvatar;
