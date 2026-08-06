import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  Folder,
  Tag,
  Ruler,
  Palette,
  Users,
  Shield,
  Settings,
  Search,
  Trash2,
  Pencil,
  Eye,
  Plus,
  Minus,
  ChevronLeft,
  ChevronRight,
  LogOut,
  CheckCircle,
  AlertTriangle,
  X,
  Upload,
  Menu,
} from 'lucide-react';

const icons = {
  LayoutDashboard,
  ShoppingBag,
  Package,
  Folder,
  Tag,
  Ruler,
  Palette,
  Users,
  Shield,
  Settings,
  Search,
  Trash2,
  Pencil,
  Eye,
  Plus,
  Minus,
  ChevronLeft,
  ChevronRight,
  LogOut,
  CheckCircle,
  AlertTriangle,
  X,
  Upload,
  Menu,
};

export type IconName = keyof typeof icons;

export interface IconProps {
  name: IconName;
  size?: number;
  className?: string;
}

export function Icon({ name, size = 20, className }: IconProps) {
  const IconComponent = icons[name];

  if (!IconComponent) {
    return null;
  }

  return <IconComponent size={size} className={className} />;
}
