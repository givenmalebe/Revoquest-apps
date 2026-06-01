import React from 'react';
import UserProfile from '@/components/UserProfile';

const ProfilePage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <UserProfile />
      </div>
    </div>
  );
};

export default ProfilePage;
