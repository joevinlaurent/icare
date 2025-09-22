import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useUser } from '../contexts/UserContext';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { useToast } from '../hooks/use-toast';
import { 
  User, 
  Clock, 
  Trophy, 
  Share2, 
  Crown, 
  LogOut, 
  Copy,
  TrendingUp,
  Shield,
  Zap
} from 'lucide-react';

const Profile = () => {
  const { user, logout } = useAuth();
  const { timeSaved } = useUser();
  const { toast } = useToast();
  const [showReferralDialog, setShowReferralDialog] = useState(false);

  const formatTime = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (days > 0) {
      return `${days}j ${hours % 24}h`;
    } else if (hours > 0) {
      return `${hours}h ${minutes % 60}min`;
    }
    return `${minutes}min`;
  };

  const copyReferralCode = () => {
    navigator.clipboard.writeText(user?.referralCode || 'DEMO2024');
    toast({
      title: "Code copié !",
      description: "Partage-le avec tes amis pour gagner du temps bonus"
    });
  };

  const shareProfile = () => {
    if (navigator.share) {
      navigator.share({
        title: 'iCare - Reprends le contrôle !',
        text: `J'ai économisé ${formatTime(timeSaved)} grâce à iCare ! Rejoins-moi avec le code ${user?.referralCode}`,
        url: window.location.origin
      });
    } else {
      copyReferralCode();
    }
  };

  const getInitials = (name) => {
    return name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U';
  };

  const getSubscriptionBadge = () => {
    if (user?.subscription === 'premium') {
      return (
        <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-none">
          <Crown className="w-3 h-3 mr-1" />
          Super iCare
        </Badge>
      );
    }
    return (
      <Badge variant="secondary">
        Gratuit
      </Badge>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
      <div className="container mx-auto px-4 py-6 max-w-md">
        {/* Profile Header */}
        <Card className="mb-6 border-none shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-primary to-purple-600 p-6 text-white">
            <div className="flex items-center space-x-4">
              <Avatar className="w-16 h-16 border-2 border-white/20">
                <AvatarImage src={user?.avatar} alt={user?.name} />
                <AvatarFallback className="bg-white/20 text-white font-bold text-lg">
                  {getInitials(user?.name)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h1 className="text-xl font-bold">{user?.name}</h1>
                <p className="text-white/80 text-sm mb-2">{user?.bio || "Utilisateur iCare"}</p>
                {getSubscriptionBadge()}
              </div>
            </div>
          </div>
          <CardContent className="p-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-emerald-600">{formatTime(timeSaved)}</p>
                <p className="text-sm text-muted-foreground">Temps récupéré</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">
                  {new Date(user?.createdAt).toLocaleDateString() === new Date().toLocaleDateString() ? '1' : 
                   Math.floor((new Date() - new Date(user?.createdAt)) / (1000 * 60 * 60 * 24)) + 1}
                </p>
                <p className="text-sm text-muted-foreground">Jours actif</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <Card className="border-none shadow-lg bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20">
            <CardContent className="p-4 text-center">
              <div className="bg-emerald-100 dark:bg-emerald-900/30 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2">
                <TrendingUp className="w-6 h-6 text-emerald-600" />
              </div>
              <p className="text-lg font-bold text-emerald-600">+{Math.floor(timeSaved * 0.15)}min</p>
              <p className="text-xs text-muted-foreground">Cette semaine</p>
            </CardContent>
          </Card>

          <Card className="border-none shadow-lg bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20">
            <CardContent className="p-4 text-center">
              <div className="bg-blue-100 dark:bg-blue-900/30 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2">
                <Shield className="w-6 h-6 text-blue-600" />
              </div>
              <p className="text-lg font-bold text-blue-600">{Math.floor(timeSaved / 15)}</p>
              <p className="text-xs text-muted-foreground">Sessions protégées</p>
            </CardContent>
          </Card>
        </div>

        {/* Actions */}
        <div className="space-y-4 mb-6">
          <Dialog open={showReferralDialog} onOpenChange={setShowReferralDialog}>
            <DialogTrigger asChild>
              <Button variant="outline" className="w-full justify-start border-none shadow-lg">
                <Share2 className="w-4 h-4 mr-3" />
                Inviter des amis
                <Badge variant="secondary" className="ml-auto">+30min</Badge>
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Inviter des amis</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Partage ton code de parrainage et gagne 30 minutes de temps bonus pour chaque ami qui s'inscrit !
                </p>
                <div>
                  <Label htmlFor="referral-code">Ton code de parrainage</Label>
                  <div className="flex space-x-2 mt-1">
                    <Input
                      id="referral-code"
                      value={user?.referralCode || 'DEMO2024'}
                      readOnly
                      className="flex-1"
                    />
                    <Button onClick={copyReferralCode} size="sm">
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <Button onClick={shareProfile} className="w-full">
                  <Share2 className="w-4 h-4 mr-2" />
                  Partager
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          {user?.subscription === 'free' && (
            <Button className="w-full justify-start bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white border-none shadow-lg">
              <Crown className="w-4 h-4 mr-3" />
              Passer à Super iCare
              <Badge variant="secondary" className="ml-auto bg-white/20 text-white border-white/30">
                Premium
              </Badge>
            </Button>
          )}
        </div>

        {/* Achievements */}
        <Card className="mb-6 border-none shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Trophy className="w-5 h-5 text-primary" />
              <span>Succès</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center space-x-3 p-3 bg-emerald-50 dark:bg-emerald-950/20 rounded-lg">
              <div className="bg-emerald-100 dark:bg-emerald-900/30 p-2 rounded-full">
                <Clock className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-emerald-800 dark:text-emerald-200">Premier pas</p>
                <p className="text-sm text-emerald-600 dark:text-emerald-400">Première heure récupérée</p>
              </div>
              <Badge className="bg-emerald-600 text-white">✓</Badge>
            </div>

            <div className={`flex items-center space-x-3 p-3 rounded-lg ${
              timeSaved >= 1440 
                ? 'bg-blue-50 dark:bg-blue-950/20' 
                : 'bg-muted/50'
            }`}>
              <div className={`p-2 rounded-full ${
                timeSaved >= 1440 
                  ? 'bg-blue-100 dark:bg-blue-900/30' 
                  : 'bg-muted'
              }`}>
                <Zap className={`w-4 h-4 ${
                  timeSaved >= 1440 
                    ? 'text-blue-600' 
                    : 'text-muted-foreground'
                }`} />
              </div>
              <div className="flex-1">
                <p className={`font-medium ${
                  timeSaved >= 1440 
                    ? 'text-blue-800 dark:text-blue-200' 
                    : 'text-muted-foreground'
                }`}>
                  Maître du temps
                </p>
                <p className={`text-sm ${
                  timeSaved >= 1440 
                    ? 'text-blue-600 dark:text-blue-400' 
                    : 'text-muted-foreground'
                }`}>
                  24 heures récupérées
                </p>
              </div>
              <Badge variant={timeSaved >= 1440 ? "default" : "outline"}>
                {timeSaved >= 1440 ? '✓' : `${Math.floor(timeSaved/1440*100)}%`}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Logout */}
        <Button 
          variant="outline" 
          onClick={logout}
          className="w-full justify-start text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
        >
          <LogOut className="w-4 h-4 mr-3" />
          Se déconnecter
        </Button>
      </div>
    </div>
  );
};

export default Profile;