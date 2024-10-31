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
import CompactPostForm from './posts/CompactPostForm';
import EditProfile from './profile/EditProfile';
import FollowersList from './followers/FollowersList';
import PrivateRoute from './routes/PrivateRoute';
import RestrictedRoute from './routes/RestrictedRoute';

import './App.css';

const App = () => {
    return (
        <AuthProvider>
            <Router>
                {/* NavBar is displayed on all pages */}
                <NavBar />
                <Routes>
                    {/* Public Routes */}
                    <Route path="/" element={<Home />} />
                    
                    {/* Restricted Routes */}
                    <Route 
                        path="/login" 
                        element={
                            <RestrictedRoute>
                                <Login />
                            </RestrictedRoute>
                        } 
                    />
                    <Route 
                        path="/register" 
                        element={
                            <RestrictedRoute>
                                <Register />
                            </RestrictedRoute>
                        } 
                    />
                    
                    {/* Private Routes */}
                    <Route 
                        path="/feed" 
                        element={
                            <PrivateRoute>
                                <Feed />
                            </PrivateRoute>
                        } 
                    />
                    <Route 
                        path="/profile/:id/" 
                        element={
                            <PrivateRoute>
                                <Profile />
                            </PrivateRoute>
                        } 
                    />
                    <Route 
                        path="/edit-profile/:id/" 
                        element={
                            <PrivateRoute>
                                <EditProfile />
                            </PrivateRoute>
                        } 
                    />
                    <Route 
                        path="/profiles" 
                        element={
                            <PrivateRoute>
                                <ProfileList />
                            </PrivateRoute>
                        } 
                    />
                    <Route 
                        path="/:username/followers" 
                        element={
                            <PrivateRoute>
                                <FollowersList />
                            </PrivateRoute>
                        } 
                    />
                    <Route 
                        path="/create_post" 
                        element={
                            <PrivateRoute>
                                <Post />
                            </PrivateRoute>
                        } 
                    />
                    <Route 
                        path="/edit-post/:id/" 
                        element={
                            <PrivateRoute>
                                <Post />
                            </PrivateRoute>
                        } 
                    />
                    <Route 
                        path="/compact_post" 
                        element={
                            <PrivateRoute>
                                <CompactPostForm />
                            </PrivateRoute>
                        } 
                    />
                    <Route 
                        path="/posts" 
                        element={
                            <PrivateRoute>
                                <PostsList />
                            </PrivateRoute>
                        } 
                    />
                </Routes>
            </Router>
        </AuthProvider>
    );
};

export default App;
