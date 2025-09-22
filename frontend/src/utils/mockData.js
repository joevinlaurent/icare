export const mockUsers = [
  {
    id: 1,
    email: "demo@icare.com",
    password: "demo123",
    name: "Utilisateur Demo",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
    bio: "Reprendre le contrôle de mon temps sur les réseaux sociaux 🎯",
    subscription: "free",
    timeSaved: 1247, // minutes
    createdAt: "2024-01-15T10:00:00Z",
    referralCode: "DEMO2024"
  },
  {
    id: 2,
    email: "premium@icare.com", 
    password: "premium123",
    name: "Marie Dupont",
    avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
    bio: "Super Icare membre 💎 Plus jamais dans le scroll infini !",
    subscription: "premium",
    timeSaved: 3890,
    createdAt: "2023-11-20T14:30:00Z", 
    referralCode: "MARIE789"
  }
];

export const socialNetworks = [
  {
    id: 'instagram',
    name: 'Instagram',
    icon: '📷',
    color: 'bg-gradient-to-r from-purple-500 to-pink-500',
    url: 'https://www.instagram.com',
    description: 'Photos et stories sans distractions'
  }
];

export const mockStats = {
  totalUsers: 12847,
  timesSaved: 2847293, // minutes
  reelsBlocked: 145832,
  storiesSkipped: 67432
};