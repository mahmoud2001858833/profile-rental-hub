import { useLanguage } from '@/hooks/useLanguage';
import { Button } from '@/components/ui/button';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { 
  ChefHat, 
  Salad, 
  Cake, 
  Coffee, 
  Croissant, 
  Sandwich,
  LayoutGrid,
  UtensilsCrossed,
  Fish,
  Leaf,
  Utensils
} from 'lucide-react';

interface CategoryFilterProps {
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
}

const CategoryFilter = ({ selectedCategory, onCategoryChange }: CategoryFilterProps) => {
  const { t } = useLanguage();

  const categories = [
    { id: 'all', label: t('categories.all'), icon: LayoutGrid },
    { id: 'أطباق رئيسية', label: t('categories.mainDishes'), icon: ChefHat },
    { id: 'أكل شرقي', label: t('categories.easternFood'), icon: UtensilsCrossed },
    { id: 'أكل غربي', label: t('categories.westernFood'), icon: Utensils },
    { id: 'مأكولات بحرية', label: t('categories.seafood'), icon: Fish },
    { id: 'أكل صحي', label: t('categories.healthyFood'), icon: Leaf },
    { id: 'مقبلات', label: t('categories.appetizers'), icon: Salad },
    { id: 'حلويات', label: t('categories.desserts'), icon: Cake },
    { id: 'مشروبات', label: t('categories.drinks'), icon: Coffee },
    { id: 'معجنات', label: t('categories.pastries'), icon: Croissant },
    { id: 'أكلات خفيفة', label: t('categories.snacks'), icon: Sandwich },
  ];

  return (
    <div className="w-full">
      <ScrollArea className="w-full whitespace-nowrap">
        <div className="flex gap-2 pb-2">
          {categories.map((category) => {
            const Icon = category.icon;
            const isSelected = selectedCategory === category.id;
            
            return (
              <Button
                key={category.id}
                variant={isSelected ? "default" : "outline"}
                size="sm"
                onClick={() => onCategoryChange(category.id)}
                className={`flex items-center gap-2 rounded-full px-5 py-2.5 transition-all font-bold text-base ${
                  isSelected 
                    ? 'bg-primary text-white shadow-lg border-2 border-white/30 scale-105' 
                    : 'bg-red-800/80 text-orange-300 hover:bg-red-700 border-2 border-red-600 hover:text-orange-200 hover:scale-102'
                }`}
              >
                <Icon className="h-5 w-5" />
                <span>{category.label}</span>
              </Button>
            );
          })}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  );
};

export default CategoryFilter;