import { Navigate, Route, Routes } from "react-router-dom";
import './App.css';
import { initializeCometChat } from "./config/cometchatConfig";
import HomePage from "./pages/home/HomePage";
import LoginPage from "./pages/auth/login/LoginPage";
import SignUpPage from "./pages/auth/signup/SignUpPage";
import NotificationPage from "./pages/notification/NotificationPage";
import ProfilePage from "./pages/profile/ProfilePage";
import Verticals from "./pages/home/Verticals";
import PasswordResetRequestPage from "./pages/auth/login/PasswordResetRequestPage";
import ChatPage from "./pages/chat/ChatPage";
import { useLocation } from "react-router-dom";

import Sidebar from "./components/common/Sidebar";
import RightPanel from "./components/common/RightPanel";
import Note from "./components/common/Note";
import { Toaster } from "react-hot-toast";
import { useQuery } from "@tanstack/react-query";
import LoadingSpinner from "./components/common/LoadingSpinner";
import Chat from "./pages/chat/chat"
import Whotofollow from "./pages/suggestions/Whotofollow"

import { useEffect } from "react";

import React from "react";


function App() {
	const location = useLocation();

	useEffect(() => {
		// Initialiser CometChat
		initializeCometChat();
	  }, []);

	const { data: authUser, isLoading } = useQuery({
		// we use queryKey to give a unique name to our query and refer to it later
		queryKey: ["authUser"],
		queryFn: async () => {
			try {
				const res = await fetch("/api/auth/me");
				const data = await res.json();
				if (data.error) return null;
				if (!res.ok) {
					throw new Error(data.error || "Something went wrong");
				}
				console.log("authUser is here:", data);
				return data;
			} catch (error) {
				throw new Error(error);
			}
		},
		retry: false,
	});

	if (isLoading) {
		return (
			<div className='h-screen flex justify-center items-center'>
				<LoadingSpinner size='lg' />
			</div>
		);
	}

	console.log("authUser in App.jsx:", authUser);

	return (
		<div className='flex max-w-7xl mx-auto'>
			{/* Common component, bc it's not wrapped with Routes */}
			{authUser && <Sidebar />}
			<Routes>
				<Route path='/' element={authUser ? <HomePage /> : <Navigate to='/login' />} />
				<Route path='/login' element={!authUser ? <LoginPage /> : <Navigate to='/' />} />
				<Route path='/signup' element={!authUser ? <SignUpPage /> : <Navigate to='/' />} />
				<Route path='/notifications' element={authUser ? <NotificationPage /> : <Navigate to='/login' />} />
				<Route path='/profile/:username' element={authUser ? <ProfilePage /> : <Navigate to='/login' />} />
				<Route path="/notes" element={<Note/>}/>
				<Route path="/verticals" element={<Verticals/>}/>
				<Route path="/Suggestions" element={<Whotofollow/>}/>
				<Route path="/password-reset-request" element={<PasswordResetRequestPage />} />
				<Route path="/chatpage" element={<ChatPage />} />
				
				<Route
                  path="/chat"
                  element={
                     authUser ? <Chat userId={authUser._id} /> : <Navigate to="/login" />
                  }
                />
			</Routes>
			{authUser && location.pathname !== '/chat' && <RightPanel />}
			<Toaster />
		</div>
	);
}

export default App;
