import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { User, Mail, Phone, MapPin, Briefcase, GraduationCap, Save } from 'lucide-react';

const Profile = () => {
  const { currentUser } = useAuth();
  
  // Mock profile data
  const [profile, setProfile] = useState({
    name: currentUser?.name || 'User Name',
    email: currentUser?.email || 'user@example.com',
    phone: '+1 (555) 123-4567',
    address: '123 Education St, Learning City, 12345',
    role: currentUser?.role || 'student',
    bio: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
    avatar: '',
  });
  
  const [isEditing, setIsEditing] = useState(false);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile({
      ...profile,
      [name]: value,
    });
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    // Here you would typically save the profile data to the server
    setIsEditing(false);
  };
  
  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white shadow-sm rounded-lg overflow-hidden">
        {/* Profile Header */}
        <div className="bg-primary p-6 sm:p-8 text-white">
          <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-6">
            <div className="h-24 w-24 sm:h-32 sm:w-32 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
              {profile.avatar ? (
                <img
                  src={profile.avatar}
                  alt="Profile"
                  className="h-full w-full rounded-full object-cover"
                />
              ) : (
                <User size={64} className="text-white" />
              )}
            </div>
            <div className="text-center sm:text-left">
              <h1 className="text-2xl sm:text-3xl font-bold">{profile.name}</h1>
              <p className="text-blue-100 mb-2">{profile.email}</p>
              <div className="inline-block px-3 py-1 rounded-full bg-white bg-opacity-20 text-sm capitalize">
                {profile.role}
              </div>
            </div>
          </div>
        </div>
        
        {/* Profile Content */}
        <div className="p-6 sm:p-8">
          <div className="flex justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-800">Profile Information</h2>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="text-primary hover:text-primary-dark font-medium"
            >
              {isEditing ? 'Cancel' : 'Edit Profile'}
            </button>
          </div>
          
          <form onSubmit={handleSubmit}>
            <div className="space-y-6">
              {/* Personal Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="name"
                      value={profile.name}
                      onChange={handleChange}
                      className="w-full p-2 border border-gray-300 rounded-md"
                    />
                  ) : (
                    <div className="flex items-center">
                      <User size={18} className="text-gray-400 mr-2" />
                      <span>{profile.name}</span>
                    </div>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  {isEditing ? (
                    <input
                      type="email"
                      name="email"
                      value={profile.email}
                      onChange={handleChange}
                      className="w-full p-2 border border-gray-300 rounded-md"
                    />
                  ) : (
                    <div className="flex items-center">
                      <Mail size={18} className="text-gray-400 mr-2" />
                      <span>{profile.email}</span>
                    </div>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  {isEditing ? (
                    <input
                      type="tel"
                      name="phone"
                      value={profile.phone}
                      onChange={handleChange}
                      className="w-full p-2 border border-gray-300 rounded-md"
                    />
                  ) : (
                    <div className="flex items-center">
                      <Phone size={18} className="text-gray-400 mr-2" />
                      <span>{profile.phone}</span>
                    </div>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="address"
                      value={profile.address}
                      onChange={handleChange}
                      className="w-full p-2 border border-gray-300 rounded-md"
                    />
                  ) : (
                    <div className="flex items-center">
                      <MapPin size={18} className="text-gray-400 mr-2" />
                      <span>{profile.address}</span>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Role and Bio */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <div className="flex items-center">
                  {profile.role === 'admin' && <Briefcase size={18} className="text-gray-400 mr-2" />}
                  {profile.role === 'teacher' && <Briefcase size={18} className="text-gray-400 mr-2" />}
                  {profile.role === 'student' && <GraduationCap size={18} className="text-gray-400 mr-2" />}
                  <span className="capitalize">{profile.role}</span>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                {isEditing ? (
                  <textarea
                    name="bio"
                    value={profile.bio}
                    onChange={handleChange}
                    rows={4}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  />
                ) : (
                  <p className="text-gray-600">{profile.bio}</p>
                )}
              </div>
              
              {/* Save Button */}
              {isEditing && (
                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="flex items-center bg-primary hover:bg-primary-dark text-white font-medium py-2 px-4 rounded-md transition-colors duration-200"
                  >
                    <Save size={18} className="mr-2" />
                    Save Changes
                  </button>
                </div>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Profile;