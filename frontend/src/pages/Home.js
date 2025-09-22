import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useUser } from '../contexts/UserContext';
import { socialNetworks } from '../utils/mockData';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Clock, Shield, Zap } from 'lucide-react';

const Home = () => {
  const { user } = useAuth();
  const { timeSaved, preferences, isLockModeActive } = useUser();

  const formatTime = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}min`;
    }
    return `${mins}min`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
      <div className="container mx-auto px-4 py-6 max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent mb-2">
            iCare
          </h1>
          <p className="text-muted-foreground">
            Bonjour {user?.name?.split(' ')[0]} 👋
          </p>
        </div>

        {/* Stats Card */}
        <Card className="mb-6 border-none shadow-lg bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Temps récupéré</p>
                <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                  {formatTime(timeSaved)}
                </p>
              </div>
              <div className="bg-emerald-100 dark:bg-emerald-900/30 p-3 rounded-full">
                <Clock className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Lock Mode Status */}
        {isLockModeActive() && (
          <Card className="mb-6 border-orange-200 bg-orange-50 dark:bg-orange-950/20">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <Shield className="w-5 h-5 text-orange-600" />
                <div>
                  <p className="font-medium text-orange-800 dark:text-orange-200">Mode verrou actif</p>
                  <p className="text-sm text-orange-600 dark:text-orange-400">
                    Jusqu'à {new Date(preferences.lockEndTime).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Social Networks */}
        <div className="space-y-4 mb-6">
          <h2 className="text-xl font-semibold flex items-center">
            <Zap className="w-5 h-5 mr-2 text-primary" />
            Réseaux sociaux
          </h2>
          
          {socialNetworks.map((network) => (
            <Link key={network.id} to={`/social/${network.id}`}>
              <Card className="transition-all duration-200 hover:shadow-lg hover:scale-[1.02] cursor-pointer border-none">
                <CardContent className="p-0">
                  <div className={`${network.color} p-4 rounded-t-lg`}>
                    <div className="flex items-center justify-between text-white">
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">{network.icon}</span>
                        <div>
                          <h3 className="font-semibold">{network.name}</h3>
                          <p className="text-sm opacity-90">{network.description}</p>
                        </div>
                      </div>
                      <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                        Protégé
                      </Badge>
                    </div>
                  </div>
                  <div className="p-4 bg-card">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex space-x-4">
                        <div className="flex items-center space-x-1">
                          <div className={`w-2 h-2 rounded-full ${
                            preferences.hideReels ? 'bg-green-500' : 'bg-gray-400'
                          }`}></div>
                          <span className="text-muted-foreground">Reels</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <div className={`w-2 h-2 rounded-full ${
                            preferences.hideStories ? 'bg-green-500' : 'bg-gray-400'
                          }`}></div>
                          <span className="text-muted-foreground">Stories</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <div className={`w-2 h-2 rounded-full ${
                            preferences.hideSuggestions ? 'bg-green-500' : 'bg-gray-400'
                          }`}></div>
                          <span className="text-muted-foreground">Suggestions</span>
                        </div>
                      </div>
                      <span className="text-muted-foreground">→</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {/* Quick Tips */}
        <Card className="border-none bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20">
          <CardContent className="p-4">
            <h3 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">💡 Astuce du jour</h3>
            <p className="text-sm text-blue-600 dark:text-blue-400">
              Active le mode verrou pour éviter de modifier tes réglages pendant les moments de faiblesse.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Home;