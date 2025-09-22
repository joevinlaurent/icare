import { useState } from 'react';
import { useUser } from '../contexts/UserContext';
import { useTheme } from '../contexts/ThemeContext';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Switch } from '../components/ui/switch';
import { Label } from '../components/ui/label';
import { Input } from '../components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { useToast } from '../hooks/use-toast';
import { Settings as SettingsIcon, Shield, Moon, Sun, Lock, Clock, Zap } from 'lucide-react';

const Settings = () => {
  const { preferences, updatePreferences, enableLockMode, isLockModeActive } = useUser();
  const { theme, toggleTheme } = useTheme();
  const { toast } = useToast();
  const [lockHours, setLockHours] = useState(2);
  const [showLockDialog, setShowLockDialog] = useState(false);

  const handlePreferenceChange = (key, value) => {
    if (isLockModeActive()) {
      toast({
        title: "Mode verrou actif",
        description: "Impossible de modifier les réglages en mode verrou",
        variant: "destructive"
      });
      return;
    }
    updatePreferences({ [key]: value });
    toast({
      title: "Réglage mis à jour",
      description: `${key === 'hideReels' ? 'Reels' : key === 'hideStories' ? 'Stories' : 'Suggestions'} ${value ? 'masqués' : 'affichés'}`
    });
  };

  const handleEnableLock = () => {
    enableLockMode(lockHours);
    setShowLockDialog(false);
    toast({
      title: "Mode verrou activé",
      description: `Réglages verrouillés pour ${lockHours}h`,
      variant: "default"
    });
  };

  const lockEndTime = preferences.lockEndTime ? new Date(preferences.lockEndTime) : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
      <div className="container mx-auto px-4 py-6 max-w-md">
        {/* Header */}
        <div className="flex items-center space-x-3 mb-6">
          <div className="bg-primary/10 p-2 rounded-lg">
            <SettingsIcon className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Réglages</h1>
            <p className="text-muted-foreground text-sm">Personnalise ton expérience</p>
          </div>
        </div>

        {/* Lock Mode Status */}
        {isLockModeActive() && (
          <Card className="mb-6 border-orange-200 bg-orange-50 dark:bg-orange-950/20">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <Shield className="w-5 h-5 text-orange-600" />
                <div className="flex-1">
                  <p className="font-medium text-orange-800 dark:text-orange-200">Mode verrou actif</p>
                  <p className="text-sm text-orange-600 dark:text-orange-400">
                    Verrouillé jusqu'à {lockEndTime?.toLocaleString()}
                  </p>
                </div>
                <Lock className="w-4 h-4 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Content Preferences */}
        <Card className="mb-6 border-none shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Zap className="w-5 h-5 text-primary" />
              <span>Filtres de contenu</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <Label htmlFor="hide-reels" className="text-base font-medium">
                  Masquer les Reels
                </Label>
                <p className="text-sm text-muted-foreground">
                  Cache les vidéos courtes addictives
                </p>
              </div>
              <Switch
                id="hide-reels"
                checked={preferences.hideReels}
                onCheckedChange={(checked) => handlePreferenceChange('hideReels', checked)}
                disabled={isLockModeActive()}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex-1">
                <Label htmlFor="hide-stories" className="text-base font-medium">
                  Masquer les Stories
                </Label>
                <p className="text-sm text-muted-foreground">
                  Cache les stories en haut de l'écran
                </p>
              </div>
              <Switch
                id="hide-stories"
                checked={preferences.hideStories}
                onCheckedChange={(checked) => handlePreferenceChange('hideStories', checked)}
                disabled={isLockModeActive()}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex-1">
                <Label htmlFor="hide-suggestions" className="text-base font-medium">
                  Masquer les suggestions
                </Label>
                <p className="text-sm text-muted-foreground">
                  Cache les comptes suggérés
                </p>
              </div>
              <Switch
                id="hide-suggestions"
                checked={preferences.hideSuggestions}
                onCheckedChange={(checked) => handlePreferenceChange('hideSuggestions', checked)}
                disabled={isLockModeActive()}
              />
            </div>
          </CardContent>
        </Card>

        {/* Lock Mode */}
        <Card className="mb-6 border-none shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Shield className="w-5 h-5 text-primary" />
              <span>Mode verrou</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Verrouille temporairement tes réglages pour éviter les modifications impulsives
            </p>
            
            <Dialog open={showLockDialog} onOpenChange={setShowLockDialog}>
              <DialogTrigger asChild>
                <Button 
                  variant="outline" 
                  className="w-full"
                  disabled={isLockModeActive()}
                >
                  <Lock className="w-4 h-4 mr-2" />
                  {isLockModeActive() ? 'Mode verrou actif' : 'Activer le mode verrou'}
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Activer le mode verrou</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Pendant combien de temps veux-tu verrouiller tes réglages ?
                  </p>
                  <div>
                    <Label htmlFor="lock-hours">Nombre d'heures</Label>
                    <Input
                      id="lock-hours"
                      type="number"
                      min="1"
                      max="24"
                      value={lockHours}
                      onChange={(e) => setLockHours(parseInt(e.target.value))}
                      className="mt-1"
                    />
                  </div>
                  <div className="flex space-x-2">
                    <Button variant="outline" onClick={() => setShowLockDialog(false)} className="flex-1">
                      Annuler
                    </Button>
                    <Button onClick={handleEnableLock} className="flex-1">
                      Verrouiller
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>

        {/* Appearance */}
        <Card className="mb-6 border-none shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              {theme === 'light' ? <Sun className="w-5 h-5 text-primary" /> : <Moon className="w-5 h-5 text-primary" />}
              <span>Apparence</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <Label htmlFor="theme-toggle" className="text-base font-medium">
                  Thème sombre
                </Label>
                <p className="text-sm text-muted-foreground">
                  Interface sombre pour tes yeux
                </p>
              </div>
              <Switch
                id="theme-toggle"
                checked={theme === 'dark'}
                onCheckedChange={toggleTheme}
              />
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <Card className="border-none bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <Clock className="w-5 h-5 text-blue-600" />
              <div>
                <p className="font-medium text-blue-800 dark:text-blue-200">Tes préférences sont sauvegardées</p>
                <p className="text-sm text-blue-600 dark:text-blue-400">
                  Automatiquement synchronisées sur tous tes appareils
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Settings;