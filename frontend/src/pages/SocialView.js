import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import { socialNetworks } from '../utils/mockData';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { ArrowLeft, ExternalLink, Shield, Clock, Zap } from 'lucide-react';
import InstagramSimulator from '../components/InstagramSimulator';

const SocialView = () => {
  const { platform } = useParams();
  const navigate = useNavigate();
  const { preferences, addTimeSaved } = useUser();
  const [timeSpent, setTimeSpent] = useState(0);
  const [sessionStart] = useState(Date.now());

  const network = socialNetworks.find(n => n.id === platform);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeSpent(Math.floor((Date.now() - sessionStart) / 1000));
    }, 1000);

    return () => clearInterval(timer);
  }, [sessionStart]);

  const handleClose = () => {
    const minutesSpent = Math.floor(timeSpent / 60);
    const estimatedSaved = Math.floor(minutesSpent * 0.3); // Estimation: 30% de temps sauvé
    if (estimatedSaved > 0) {
      addTimeSaved(estimatedSaved);
    }
    navigate('/');
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!network) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Réseau social non trouvé</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="bg-card border-b border-border p-4 flex items-center justify-between relative z-20">
        <div className="flex items-center space-x-3">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleClose}
            className="p-2"
          >
            <ArrowLeft size={20} />
          </Button>
          <div className="flex items-center space-x-2">
            <span className="text-lg">{network.icon}</span>
            <h1 className="font-semibold">{network.name}</h1>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-1 text-sm">
            <Clock size={14} />
            <span>{formatTime(timeSpent)}</span>
          </div>
        </div>
      </div>

      {/* Active Protections */}
      <div className="p-4 bg-emerald-50 dark:bg-emerald-950/20 border-b relative z-10">
        <div className="flex items-center space-x-2 mb-2">
          <Shield className="w-4 h-4 text-emerald-600" />
          <span className="text-sm font-medium text-emerald-800 dark:text-emerald-200">
            Protections actives
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          {preferences.hideReels && (
            <div className="bg-emerald-100 dark:bg-emerald-900/30 px-2 py-1 rounded-full">
              <span className="text-xs text-emerald-700 dark:text-emerald-300">Reels masqués</span>
            </div>
          )}
          {preferences.hideStories && (
            <div className="bg-emerald-100 dark:bg-emerald-900/30 px-2 py-1 rounded-full">
              <span className="text-xs text-emerald-700 dark:text-emerald-300">Stories masquées</span>
            </div>
          )}
          {preferences.hideSuggestions && (
            <div className="bg-emerald-100 dark:bg-emerald-900/30 px-2 py-1 rounded-full">
              <span className="text-xs text-emerald-700 dark:text-emerald-300">Suggestions masquées</span>
            </div>
          )}
        </div>
      </div>

      {/* Instagram Simulator */}
      <div className="flex-1 relative">
        <InstagramSimulator onTimeSpent={() => {}} />
        
        {/* Overlay for iCare indicator */}
        <div className="absolute top-4 right-4 bg-black/80 text-white px-3 py-2 rounded-lg text-sm z-30">
          <div className="flex items-center space-x-2">
            <Zap className="w-4 h-4 text-yellow-400" />
            <span>iCare actif</span>
          </div>
        </div>
      </div>

      {/* Bottom Stats */}
      <div className="p-4 bg-card border-t border-border relative z-20">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-4">
            <div className="text-center">
              <p className="font-medium">{formatTime(timeSpent)}</p>
              <p className="text-muted-foreground text-xs">Temps passé</p>
            </div>
            <div className="text-center">
              <p className="font-medium text-emerald-600">
                ~{Math.floor(timeSpent * 0.3 / 60)}min
              </p>
              <p className="text-muted-foreground text-xs">Temps sauvé</p>
            </div>
          </div>
          
          <Button 
            onClick={handleClose}
            className="bg-gradient-to-r from-primary to-purple-600"
          >
            Terminer
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SocialView;