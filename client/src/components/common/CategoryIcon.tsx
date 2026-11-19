import React from 'react';
import {
  Utensils,
  ShoppingCart,
  Home,
  Car,
  Zap,
  HeartPulse,
  Film,
  ShoppingBag,
  GraduationCap,
  TrendingUp,
  MoreHorizontal,
  Briefcase,
  Laptop,
  LineChart,
  Building2,
  Key,
  Gift,
  Wallet,
  Tag,
  Dumbbell,
  Plane,
  Coffee,
  Smartphone,
  BookOpen,
  LucideProps,
} from 'lucide-react';

const ICON_MAP: Record<string, React.FC<LucideProps>> = {
  Utensils,
  ShoppingCart,
  Home,
  Car,
  Zap,
  HeartPulse,
  Film,
  ShoppingBag,
  GraduationCap,
  TrendingUp,
  MoreHorizontal,
  Briefcase,
  Laptop,
  LineChart,
  Building2,
  Key,
  Gift,
  Wallet,
  Tag,
  Dumbbell,
  Plane,
  Coffee,
  Smartphone,
  BookOpen,
};

interface CategoryIconProps extends LucideProps {
  name: string;
}

export const CategoryIcon: React.FC<CategoryIconProps> = ({ name, ...props }) => {
  const IconComponent = ICON_MAP[name] || Tag;
  return <IconComponent {...props} />;
};

export const AVAILABLE_ICONS = Object.keys(ICON_MAP);
