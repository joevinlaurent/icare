import { useState, useEffect } from 'react';
import { useUser } from '../contexts/UserContext';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Input } from './ui/input';
import { Heart, MessageCircle, Send, Bookmark, MoreHorizontal, Plus } from 'lucide-react';

const InstagramSimulator = ({ onTimeSpent }) => {
  const { preferences } = useUser();
  const [currentView, setCurrentView] = useState('login');
  const [loginData, setLoginData] = useState({ username: '', password: '' });
  const [timeSpent, setTimeSpent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeSpent(prev => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (onTimeSpent) {
      onTimeSpent(timeSpent);
    }
  }, [timeSpent, onTimeSpent]);

  const handleLogin = (e) => {
    e.preventDefault();
    if (loginData.username && loginData.password) {
      setCurrentView('feed');
    }
  };

  const InstagramLogin = () => (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-light mb-4" style={{ fontFamily: 'serif' }}>Instagram</h1>
        </div>
        
        <form onSubmit={handleLogin} className="space-y-4">
          <Input
            placeholder="Nom d'utilisateur, numéro de téléphone ou e-mail"
            value={loginData.username}
            onChange={(e) => setLoginData({...loginData, username: e.target.value})}
            className="w-full"
          />
          <Input
            type="password"
            placeholder="Mot de passe"
            value={loginData.password}
            onChange={(e) => setLoginData({...loginData, password: e.target.value})}
            className="w-full"
          />
          <Button 
            type="submit" 
            className="w-full bg-blue-500 hover:bg-blue-600 text-white"
            disabled={!loginData.username || !loginData.password}
          >
            Se connecter
          </Button>
        </form>
        
        <div className="text-center mt-4">
          <p className="text-sm text-gray-600">
            Vous n'avez pas de compte ? <span className="text-blue-500 cursor-pointer">Inscrivez-vous</span>
          </p>
        </div>
        
        <div className="mt-8 p-4 bg-emerald-50 rounded-lg border border-emerald-200">
          <div className="flex items-center space-x-2 mb-2">
            <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
            <span className="text-sm font-medium text-emerald-800">iCare Protection Active</span>
          </div>
          <p className="text-xs text-emerald-600">
            Connectez-vous avec n'importe quels identifiants pour tester l'expérience protégée
          </p>
        </div>
      </div>
    </div>
  );

  const InstagramPost = ({ user, image, caption, likes, timeAgo, isReel = false }) => {
    const [liked, setLiked] = useState(false);
    
    // Hide reels if preference is set
    if (isReel && preferences.hideReels) {
      return (
        <div className="bg-gray-100 p-4 text-center border-b">
          <div className="text-gray-500 text-sm">
            📱 Reel masqué par iCare
          </div>
          <div className="text-xs text-gray-400 mt-1">
            Temps sauvé: ~30 secondes
          </div>
        </div>
      );
    }

    return (
      <Card className="mb-4 border-0 border-b border-gray-200 rounded-none">
        <CardContent className="p-0">
          {/* Header */}
          <div className="flex items-center justify-between p-3">
            <div className="flex items-center space-x-3">
              <Avatar className="w-8 h-8">
                <AvatarImage src={user.avatar} />
                <AvatarFallback>{user.name[0]}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold text-sm">{user.username}</p>
                <p className="text-xs text-gray-500">{timeAgo}</p>
              </div>
            </div>
            <MoreHorizontal className="w-5 h-5 text-gray-600" />
          </div>
          
          {/* Image */}
          <div className="relative">
            <img 
              src={image} 
              alt="Post" 
              className="w-full aspect-square object-cover"
            />
            {isReel && (
              <div className="absolute top-2 left-2 bg-black/70 text-white px-2 py-1 rounded text-xs">
                Reel
              </div>
            )}
          </div>
          
          {/* Actions */}
          <div className="p-3">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-4">
                <Heart 
                  className={`w-6 h-6 cursor-pointer ${liked ? 'fill-red-500 text-red-500' : 'text-gray-800'}`}
                  onClick={() => setLiked(!liked)}
                />
                <MessageCircle className="w-6 h-6 text-gray-800 cursor-pointer" />
                <Send className="w-6 h-6 text-gray-800 cursor-pointer" />
              </div>
              <Bookmark className="w-6 h-6 text-gray-800 cursor-pointer" />
            </div>
            
            <p className="font-semibold text-sm mb-1">{likes + (liked ? 1 : 0)} mentions J'aime</p>
            
            <div className="text-sm">
              <span className="font-semibold">{user.username}</span>
              <span className="ml-2">{caption}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const Stories = () => {
    if (preferences.hideStories) {
      return (
        <div className="p-4 border-b bg-gray-50">
          <div className="text-center text-gray-500 text-sm">
            📚 Stories masquées par iCare
          </div>
          <div className="text-xs text-gray-400 text-center mt-1">
            Temps sauvé: ~5 minutes
          </div>
        </div>
      );
    }

    const stories = [
      { id: 1, username: 'Votre story', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=60&h=60&fit=crop&crop=face', hasStory: false, isYours: true },
      { id: 2, username: 'marie_d', avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=60&h=60&fit=crop&crop=face', hasStory: true },
      { id: 3, username: 'alex_photo', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=60&h=60&fit=crop&crop=face', hasStory: true },
      { id: 4, username: 'travel_lover', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=60&h=60&fit=crop&crop=face', hasStory: true }
    ];

    return (
      <div className="flex space-x-4 p-4 border-b bg-white overflow-x-auto">
        {stories.map(story => (
          <div key={story.id} className="flex flex-col items-center space-y-1 flex-shrink-0">
            <div className={`relative ${story.hasStory ? 'ring-2 ring-pink-500 ring-offset-2' : ''} rounded-full`}>
              <Avatar className="w-14 h-14">
                <AvatarImage src={story.avatar} />
                <AvatarFallback>{story.username[0]}</AvatarFallback>
              </Avatar>
              {story.isYours && (
                <div className="absolute bottom-0 right-0 bg-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center">
                  <Plus className="w-3 h-3" />
                </div>
              )}
            </div>
            <span className="text-xs text-gray-600 max-w-[60px] truncate">{story.username}</span>
          </div>
        ))}
      </div>
    );
  };

  const SuggestedUsers = () => {
    if (preferences.hideSuggestions) {
      return null; // Completely hidden
    }

    return (
      <Card className="mb-4 border-0 border-b border-gray-200 rounded-none">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-sm text-gray-800">Suggestions pour vous</h3>
            <span className="text-xs text-blue-500 cursor-pointer">Tout voir</span>
          </div>
          
          <div className="space-y-3">
            {[
              { username: 'photographer_pro', name: 'John Photo', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face' },
              { username: 'food_blogger', name: 'Sarah Food', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&h=40&fit=crop&crop=face' }
            ].map(user => (
              <div key={user.username} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={user.avatar} />
                    <AvatarFallback>{user.name[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold text-sm">{user.username}</p>
                    <p className="text-xs text-gray-500">{user.name}</p>
                  </div>
                </div>
                <Button size="sm" variant="outline" className="text-blue-500 border-blue-500 hover:bg-blue-50">
                  Suivre
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  };

  const InstagramFeed = () => {
    const posts = [
      {
        user: { username: 'marie_d', name: 'Marie', avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=40&h=40&fit=crop&crop=face' },
        image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=400&fit=crop',
        caption: 'Belle journée au parc ! 🌞 #nature #détente',
        likes: 42,
        timeAgo: 'il y a 2h'
      },
      {
        user: { username: 'alex_photo', name: 'Alex', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face' },
        image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=400&fit=crop',
        caption: 'Nouveau projet photo terminé ! 📸',
        likes: 128,
        timeAgo: 'il y a 4h',
        isReel: true
      },
      {
        user: { username: 'food_blogger', name: 'Sarah', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&h=40&fit=crop&crop=face' },
        image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=400&fit=crop',
        caption: 'Délicieux brunch maison 🥐☕️ #foodie #brunch',
        likes: 89,
        timeAgo: 'il y a 6h'
      }
    ];

    return (
      <div className="min-h-screen bg-white">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-4 z-10">
          <h1 className="text-2xl font-light" style={{ fontFamily: 'serif' }}>Instagram</h1>
        </div>
        
        {/* Stories */}
        <Stories />
        
        {/* Feed */}
        <div className="pb-16">
          <SuggestedUsers />
          
          {posts.map((post, index) => (
            <InstagramPost key={index} {...post} />
          ))}
          
          <div className="text-center p-8 text-gray-500">
            <p className="text-sm">Vous êtes à jour</p>
            <p className="text-xs mt-1">Vous avez vu toutes les publications récentes</p>
          </div>
        </div>
      </div>
    );
  };

  if (currentView === 'login') {
    return <InstagramLogin />;
  }

  return <InstagramFeed />;
};

export default InstagramSimulator;