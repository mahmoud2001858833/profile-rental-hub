import { useLanguage } from '@/hooks/useLanguage';
import { Button } from '@/components/ui/button';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Globe } from 'lucide-react';

interface CountryFilterProps {
  selectedCountry: string;
  onCountryChange: (country: string) => void;
}

export const COUNTRIES = [
  { code: 'all', name: { ar: 'الكل', en: 'All' }, currency: '', flag: '🌍' },
  { code: 'JO', name: { ar: 'الأردن', en: 'Jordan' }, currency: 'JOD', flag: '🇯🇴' },
  { code: 'SA', name: { ar: 'السعودية', en: 'Saudi Arabia' }, currency: 'SAR', flag: '🇸🇦' },
  { code: 'AE', name: { ar: 'الإمارات', en: 'UAE' }, currency: 'AED', flag: '🇦🇪' },
  { code: 'EG', name: { ar: 'مصر', en: 'Egypt' }, currency: 'EGP', flag: '🇪🇬' },
  { code: 'KW', name: { ar: 'الكويت', en: 'Kuwait' }, currency: 'KWD', flag: '🇰🇼' },
  { code: 'BH', name: { ar: 'البحرين', en: 'Bahrain' }, currency: 'BHD', flag: '🇧🇭' },
  { code: 'QA', name: { ar: 'قطر', en: 'Qatar' }, currency: 'QAR', flag: '🇶🇦' },
  { code: 'OM', name: { ar: 'عُمان', en: 'Oman' }, currency: 'OMR', flag: '🇴🇲' },
  { code: 'MA', name: { ar: 'المغرب', en: 'Morocco' }, currency: 'MAD', flag: '🇲🇦' },
  { code: 'LB', name: { ar: 'لبنان', en: 'Lebanon' }, currency: 'LBP', flag: '🇱🇧' },
];

export const getCurrencySymbol = (currency: string): string => {
  const symbols: Record<string, string> = {
    'JOD': 'د.أ',
    'SAR': 'ر.س',
    'AED': 'د.إ',
    'EGP': 'ج.م',
    'KWD': 'د.ك',
    'BHD': 'د.ب',
    'QAR': 'ر.ق',
    'OMR': 'ر.ع',
    'MAD': 'د.م',
    'LBP': 'ل.ل',
  };
  return symbols[currency] || currency;
};

const CountryFilter = ({ selectedCountry, onCountryChange }: CountryFilterProps) => {
  const { language } = useLanguage();

  return (
    <div className="w-full">
      <ScrollArea className="w-full whitespace-nowrap">
        <div className="flex gap-2 pb-2">
          {COUNTRIES.map((country) => {
            const isSelected = selectedCountry === country.code;
            
            return (
              <Button
                key={country.code}
                variant={isSelected ? "default" : "outline"}
                size="sm"
                onClick={() => onCountryChange(country.code)}
                className={`flex items-center gap-2 rounded-full px-5 py-2.5 transition-all font-bold text-base ${
                  isSelected 
                    ? 'bg-primary text-white shadow-lg border-2 border-white/30 scale-105' 
                    : 'bg-red-800/80 text-orange-300 hover:bg-red-700 border-2 border-red-600 hover:text-orange-200 hover:scale-102'
                }`}
              >
                {country.code === 'all' ? (
                  <Globe className="h-5 w-5" />
                ) : (
                  <span className="text-xl">{country.flag}</span>
                )}
                <span>{country.name[language]}</span>
              </Button>
            );
          })}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  );
};

export default CountryFilter;
