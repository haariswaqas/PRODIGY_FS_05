import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Home from './home/Home';
import Feed from './home/Feed';
import Login from './login/Login';
import Register from './register/Register';
import Profile from './profile/Profile';
import ProfileList from './profile/ProfileList';
import NavBar from './navbar/NavBar';
import Post from './posts/Post';
import PostsList from './posts/PostsList';
import Comment from './comments/Comment';
import CompactPostForm from './posts/CompactPostForm';

import './App.css';
import EditProfile from './profile/EditProfile';

const App = () => {
    return (
        <AuthProvider>
            <Router>
                {/* NavBar is displayed on all pages */}
                <NavBar />
                <Routes>
                    {/* Public Routes */}
                    <Route path="/" element={<Home />} />
                    <Route path="/feed" element={<Feed />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    
                    {/* Profile Route with dynamic ID */}
                    <Route path="/profile/:id/" element={<Profile />} />
                    <Route path="/edit-profile/:id/" element={<EditProfile />} />
                    <Route path="/profiles" element={<ProfileList />} />

                    {/* Posts and Post Creation Routes */}
                    <Route path="/create_post" element={<Post />} />
                    <Route path="/edit-post/:id/" element={<Post />} />
                    <Route path="/compact_post" element={<CompactPostForm />} />

                    <Route path="/posts" element={<PostsList />} />

                    <Route path="/create_comment" element={<Comment />} />
                </Routes>
            </Router>
        </AuthProvider>
    );
};

export default App;
