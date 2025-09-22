import { useState, useEffect } from "react";
import "./App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "./contexts/ThemeContext";
import { AuthProvider } from "./contexts/AuthContext";
import { UserProvider } from "./contexts/UserContext";
import { Toaster } from "./components/ui/toaster";
import Navigation from "./components/Navigation";
import Home from "./pages/Home";
import SocialView from "./pages/SocialView";
import Settings from "./pages/Settings";
import Profile from "./pages/Profile";
import Auth from "./pages/Auth";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <div className="App">
      <ThemeProvider>
        <AuthProvider>
          <UserProvider>
            <BrowserRouter>
              <div className="min-h-screen bg-background text-foreground">
                <Routes>
                  <Route path="/auth" element={<Auth />} />
                  <Route path="/" element={
                    <ProtectedRoute>
                      <div className="pb-16">
                        <Home />
                      </div>
                      <Navigation />
                    </ProtectedRoute>
                  } />
                  <Route path="/social/:platform" element={
                    <ProtectedRoute>
                      <SocialView />
                    </ProtectedRoute>
                  } />
                  <Route path="/settings" element={
                    <ProtectedRoute>
                      <div className="pb-16">
                        <Settings />
                      </div>
                      <Navigation />
                    </ProtectedRoute>
                  } />
                  <Route path="/profile" element={
                    <ProtectedRoute>
                      <div className="pb-16">
                        <Profile />
                      </div>
                      <Navigation />
                    </ProtectedRoute>
                  } />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
                <Toaster />
              </div>
            </BrowserRouter>
          </UserProvider>
        </AuthProvider>
      </ThemeProvider>
    </div>
  );
}

export default App;