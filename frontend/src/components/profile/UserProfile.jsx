import React, { useState, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { User, Mail, CreditCard, Camera, Upload } from 'lucide-react';

function UserProfile() {
  const { user } = useAuth();
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const fileInputRef = useRef(null);

  const handleImageSelect = (event) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleSaveProfilePic = async () => {
    if (!selectedImage) return;
    try {
      const formData = new FormData();
      formData.append('profilePicture', selectedImage);
      const token = localStorage.getItem('uniplay_token');
      const API_URL = import.meta.env.VITE_API_URL;
      const response = await fetch(`${API_URL}/api/users/profile-picture`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });
      if (response.ok) {
        const data = await response.json();
        const currentUser = JSON.parse(localStorage.getItem('uniplay_user') || '{}');
        const updatedUser = { ...currentUser, avatar: data.user.avatar };
        localStorage.setItem('uniplay_user', JSON.stringify(updatedUser));
        window.location.reload();
        alert('Profile picture updated successfully!');
      } else {
        const errorText = await response.text();
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch (e) {
          errorData = { error: errorText || 'Unknown error' };
        }
        throw new Error(errorData.error || 'Failed to upload profile picture');
      }
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to upload profile picture. Please try again.');
    }
  };

  const currentAvatar = previewUrl || user?.avatar || `https://ui-avatars.com/api/?name=${user?.name || 'U'}&background=6d28d9&color=fff&size=128`;

  return (
    <div className="space-y-10">
      {/* Profile Header */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-orange-500 rounded-3xl shadow-xl p-10 flex flex-col md:flex-row md:items-center gap-8 relative overflow-hidden">
        <div className="z-10 relative">
          <img
            src={currentAvatar}
            alt={user?.name}
            className="w-28 h-28 rounded-full object-cover border-4 border-white shadow-xl mb-4 md:mb-0"
          />
          <button
            onClick={handleUploadClick}
            className="absolute bottom-2 right-2 bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full shadow-lg transition-colors z-20"
            title="Change profile picture"
          >
            <Camera className="w-5 h-5" />
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageSelect}
            className="hidden"
          />
        </div>
        <div className="flex-1 text-white z-10">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-4xl font-extrabold tracking-tight drop-shadow">{user?.name}</h1>
          </div>
          <p className="text-blue-100 mb-4 text-lg">Student ID: {user?.studentId}</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <div className="flex items-center gap-3">
                <span className="font-bold text-2xl drop-shadow">{user?.points || 0}</span>
                <span className="text-sm text-blue-100">Total Points</span>
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <div className="flex items-center gap-3">
                <span className="font-bold text-2xl drop-shadow">{user?.clubsJoined || 0}</span>
                <span className="text-sm text-blue-100">Clubs Joined</span>
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <div className="flex items-center gap-3">
                <span className="font-bold text-2xl drop-shadow">{user?.rank || '-'}</span>
                <span className="text-sm text-blue-100">Rank</span>
              </div>
            </div>
          </div>
        </div>
        {/* Decorative Circles */}
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl z-0" />
        <div className="absolute -bottom-10 -left-10 w-52 h-52 bg-white/10 rounded-full blur-2xl z-0" />
      </div>
      {/* Profile Picture Upload Section */}
      {selectedImage && (
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
          <h2 className="text-2xl font-bold text-blue-900 mb-6">Update Profile Picture</h2>
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="relative">
              <img
                src={previewUrl}
                alt="Preview"
                className="w-32 h-32 rounded-full object-cover border-4 border-blue-200 shadow-lg"
              />
              <div className="absolute -top-2 -right-2 bg-green-500 text-white rounded-full w-6 h-6 flex items-center justify-center">
                <Upload className="w-3 h-3" />
              </div>
            </div>
            <div className="flex-1">
              <p className="text-gray-600 mb-4">
                <strong>Selected file:</strong> {selectedImage.name}
              </p>
              <p className="text-sm text-gray-500 mb-4">
                Click "Save Profile Picture" to upload this image as your new profile picture.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={handleSaveProfilePic}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors flex items-center gap-2"
                >
                  <Upload className="w-4 h-4" />
                  Save Profile Picture
                </button>
                <button
                  onClick={() => {
                    setSelectedImage(null);
                    setPreviewUrl(null);
                  }}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-lg font-semibold transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Profile Information */}
      <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-10">
        <h2 className="text-2xl font-bold text-blue-900 mb-8">Profile Information</h2>
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-blue-900 mb-2">Full Name</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-blue-400" />
              <div className="w-full pl-10 pr-4 py-3 border border-blue-200 rounded-lg bg-gray-50 text-blue-900">
                {user?.name}
              </div>
            </div>
          </div>
          <div>
            <label className="block text-sm font-bold text-blue-900 mb-2">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-blue-400" />
              <div className="w-full pl-10 pr-4 py-3 border border-blue-200 rounded-lg bg-gray-50 text-blue-900">
                {user?.email}
              </div>
            </div>
          </div>
          <div>
            <label className="block text-sm font-bold text-blue-900 mb-2">Student ID</label>
            <div className="relative">
              <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-blue-400" />
              <div className="w-full pl-10 pr-4 py-3 border border-blue-200 rounded-lg bg-gray-50 text-blue-900">
                {user?.studentId}
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Game History & Badges - Empty State */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-12 flex flex-col items-center justify-center text-center">
          <span className="text-5xl mb-4">🎮</span>
          <h3 className="text-2xl font-bold text-blue-900 mb-2">No game history yet</h3>
          <p className="text-blue-400 mb-4">Join or play games to see your history here.</p>
        </div>
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-12 flex flex-col items-center justify-center text-center">
          <span className="text-5xl mb-4">🏅</span>
          <h3 className="text-2xl font-bold text-blue-900 mb-2">No badges earned yet</h3>
          <p className="text-blue-400 mb-4">Participate and win to earn badges!</p>
        </div>
      </div>
    </div>
  );
}

export default UserProfile; 