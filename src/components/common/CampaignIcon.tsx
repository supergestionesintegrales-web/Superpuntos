import React from 'react';
import { 
  Car, 
  Bike, 
  Gamepad2, 
  SendHorizontal, 
  ShieldCheck, 
  BadgePercent, 
  Smartphone, 
  Trophy, 
  Gift, 
  ShoppingBag, 
  CheckCircle2, 
  Sparkles,
  Zap
} from 'lucide-react';

interface CampaignIconProps {
  name: string;
  className?: string;
}

export const CampaignIcon: React.FC<CampaignIconProps> = ({ name, className = 'w-5 h-5' }) => {
  switch (name.toLowerCase()) {
    case 'car':
      return <Car className={className} />;
    case 'bike':
      return <Bike className={className} />;
    case 'gamepad2':
    case 'gamepad':
      return <Gamepad2 className={className} />;
    case 'sendhorizontal':
    case 'send':
      return <SendHorizontal className={className} />;
    case 'shieldcheck':
    case 'shield':
      return <ShieldCheck className={className} />;
    case 'badgepercent':
    case 'percent':
      return <BadgePercent className={className} />;
    case 'smartphone':
    case 'phone':
      return <Smartphone className={className} />;
    case 'trophy':
      return <Trophy className={className} />;
    case 'gift':
      return <Gift className={className} />;
    case 'sparkles':
      return <Sparkles className={className} />;
    case 'zap':
      return <Zap className={className} />;
    default:
      return <ShoppingBag className={className} />;
  }
};
