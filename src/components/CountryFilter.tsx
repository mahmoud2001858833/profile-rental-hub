import { useLanguage } from '@/hooks/useLanguage';
import { Button } from '@/components/ui/button';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Globe } from 'lucide-react';

interface CountryFilterProps {
  selectedCountry: string | null;
  onCountryChange: (country: string) => void;
}

export const COUNTRIES = [
  { code: 'all', name: { ar: 'الكل', en: 'All' }, currency: '', flag: '🌍' },
  // الخليج العربي
  { code: 'SA', name: { ar: 'السعودية', en: 'Saudi Arabia' }, currency: 'SAR', flag: '🇸🇦' },
  { code: 'AE', name: { ar: 'الإمارات', en: 'UAE' }, currency: 'AED', flag: '🇦🇪' },
  { code: 'KW', name: { ar: 'الكويت', en: 'Kuwait' }, currency: 'KWD', flag: '🇰🇼' },
  { code: 'BH', name: { ar: 'البحرين', en: 'Bahrain' }, currency: 'BHD', flag: '🇧🇭' },
  { code: 'QA', name: { ar: 'قطر', en: 'Qatar' }, currency: 'QAR', flag: '🇶🇦' },
  { code: 'OM', name: { ar: 'عُمان', en: 'Oman' }, currency: 'OMR', flag: '🇴🇲' },
  // الشام
  { code: 'JO', name: { ar: 'الأردن', en: 'Jordan' }, currency: 'JOD', flag: '🇯🇴' },
  { code: 'SY', name: { ar: 'سوريا', en: 'Syria' }, currency: 'SYP', flag: '🇸🇾' },
  { code: 'LB', name: { ar: 'لبنان', en: 'Lebanon' }, currency: 'LBP', flag: '🇱🇧' },
  { code: 'PS', name: { ar: 'فلسطين', en: 'Palestine' }, currency: 'ILS', flag: '🇵🇸' },
  { code: 'IQ', name: { ar: 'العراق', en: 'Iraq' }, currency: 'IQD', flag: '🇮🇶' },
  // شمال أفريقيا
  { code: 'EG', name: { ar: 'مصر', en: 'Egypt' }, currency: 'EGP', flag: '🇪🇬' },
  { code: 'LY', name: { ar: 'ليبيا', en: 'Libya' }, currency: 'LYD', flag: '🇱🇾' },
  { code: 'TN', name: { ar: 'تونس', en: 'Tunisia' }, currency: 'TND', flag: '🇹🇳' },
  { code: 'DZ', name: { ar: 'الجزائر', en: 'Algeria' }, currency: 'DZD', flag: '🇩🇿' },
  { code: 'MA', name: { ar: 'المغرب', en: 'Morocco' }, currency: 'MAD', flag: '🇲🇦' },
  { code: 'MR', name: { ar: 'موريتانيا', en: 'Mauritania' }, currency: 'MRU', flag: '🇲🇷' },
  { code: 'SD', name: { ar: 'السودان', en: 'Sudan' }, currency: 'SDG', flag: '🇸🇩' },
  // القرن الأفريقي واليمن
  { code: 'YE', name: { ar: 'اليمن', en: 'Yemen' }, currency: 'YER', flag: '🇾🇪' },
  { code: 'SO', name: { ar: 'الصومال', en: 'Somalia' }, currency: 'SOS', flag: '🇸🇴' },
  { code: 'DJ', name: { ar: 'جيبوتي', en: 'Djibouti' }, currency: 'DJF', flag: '🇩🇯' },
  { code: 'KM', name: { ar: 'جزر القمر', en: 'Comoros' }, currency: 'KMF', flag: '🇰🇲' },
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
    'SYP': 'ل.س',
    'ILS': '₪',
    'IQD': 'د.ع',
    'YER': 'ر.ي',
    'LYD': 'د.ل',
    'SDG': 'ج.س',
    'TND': 'د.ت',
    'DZD': 'د.ج',
    'MRU': 'أ.م',
    'SOS': 'ش.ص',
    'DJF': 'ف.ج',
    'KMF': 'ف.ق',
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
            const isSelected = selectedCountry === country.code || (!selectedCountry && country.code === 'all');
            
            return (
              <Button
                key={country.code}
                variant={isSelected ? "default" : "outline"}
                size="sm"
                onClick={() => onCountryChange(country.code)}
                className={`flex items-center gap-2 rounded-full px-5 py-2.5 transition-all font-bold text-base backdrop-blur-sm ${
                  isSelected 
                    ? 'bg-primary text-white shadow-lg border-2 border-white/30 scale-105' 
                    : 'bg-primary/90 text-white hover:bg-primary border-2 border-primary/50 hover:scale-102 shadow-md'
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
