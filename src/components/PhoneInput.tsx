import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const COUNTRY_CODES = [
  // الخليج العربي
  { code: '+966', country: 'SA', name: 'السعودية', flag: '🇸🇦' },
  { code: '+971', country: 'AE', name: 'الإمارات', flag: '🇦🇪' },
  { code: '+965', country: 'KW', name: 'الكويت', flag: '🇰🇼' },
  { code: '+973', country: 'BH', name: 'البحرين', flag: '🇧🇭' },
  { code: '+974', country: 'QA', name: 'قطر', flag: '🇶🇦' },
  { code: '+968', country: 'OM', name: 'عُمان', flag: '🇴🇲' },
  // الشام
  { code: '+962', country: 'JO', name: 'الأردن', flag: '🇯🇴' },
  { code: '+963', country: 'SY', name: 'سوريا', flag: '🇸🇾' },
  { code: '+961', country: 'LB', name: 'لبنان', flag: '🇱🇧' },
  { code: '+970', country: 'PS', name: 'فلسطين', flag: '🇵🇸' },
  { code: '+964', country: 'IQ', name: 'العراق', flag: '🇮🇶' },
  // شمال أفريقيا
  { code: '+20', country: 'EG', name: 'مصر', flag: '🇪🇬' },
  { code: '+218', country: 'LY', name: 'ليبيا', flag: '🇱🇾' },
  { code: '+216', country: 'TN', name: 'تونس', flag: '🇹🇳' },
  { code: '+213', country: 'DZ', name: 'الجزائر', flag: '🇩🇿' },
  { code: '+212', country: 'MA', name: 'المغرب', flag: '🇲🇦' },
  { code: '+222', country: 'MR', name: 'موريتانيا', flag: '🇲🇷' },
  { code: '+249', country: 'SD', name: 'السودان', flag: '🇸🇩' },
  // القرن الأفريقي واليمن
  { code: '+967', country: 'YE', name: 'اليمن', flag: '🇾🇪' },
  { code: '+252', country: 'SO', name: 'الصومال', flag: '🇸🇴' },
  { code: '+253', country: 'DJ', name: 'جيبوتي', flag: '🇩🇯' },
  { code: '+269', country: 'KM', name: 'جزر القمر', flag: '🇰🇲' },
];

interface PhoneInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  id?: string;
}

const PhoneInput = ({ value, onChange, placeholder, className, id }: PhoneInputProps) => {
  // Parse the value to extract country code and number
  const parseValue = (val: string) => {
    if (!val) return { countryCode: '+962', number: '' };
    
    // Check if value starts with a known country code
    for (const cc of COUNTRY_CODES) {
      if (val.startsWith(cc.code)) {
        return { countryCode: cc.code, number: val.slice(cc.code.length) };
      }
    }
    
    // If starts with +, try to match country code
    if (val.startsWith('+')) {
      // Try to find matching country code by checking different lengths
      for (let len = 4; len >= 2; len--) {
        const possibleCode = val.slice(0, len);
        const match = COUNTRY_CODES.find(cc => cc.code === possibleCode);
        if (match) {
          return { countryCode: match.code, number: val.slice(len) };
        }
      }
    }
    
    // Default to Jordan if no code found, strip leading zeros
    return { countryCode: '+962', number: val.replace(/^0+/, '') };
  };

  const { countryCode: initialCode, number: initialNumber } = parseValue(value);
  const [selectedCode, setSelectedCode] = useState(initialCode);
  const [phoneNumber, setPhoneNumber] = useState(initialNumber);

  // Sync state when value prop changes
  useEffect(() => {
    const { countryCode, number } = parseValue(value);
    setSelectedCode(countryCode);
    setPhoneNumber(number);
  }, [value]);

  const handleCodeChange = (code: string) => {
    setSelectedCode(code);
    onChange(code + phoneNumber);
  };

  const handleNumberChange = (num: string) => {
    // Only allow numbers, strip leading zeros
    const cleanNum = num.replace(/[^0-9]/g, '').replace(/^0+/, '');
    setPhoneNumber(cleanNum);
    onChange(selectedCode + cleanNum);
  };

  const selectedCountry = COUNTRY_CODES.find(c => c.code === selectedCode);

  return (
    <div className={`flex gap-2 ${className}`} dir="ltr">
      <Select value={selectedCode} onValueChange={handleCodeChange}>
        <SelectTrigger className="w-[120px] h-12 shrink-0">
          <SelectValue>
            <span className="flex items-center gap-2">
              <span className="text-lg">{selectedCountry?.flag}</span>
              <span className="text-sm">{selectedCode}</span>
            </span>
          </SelectValue>
        </SelectTrigger>
        <SelectContent className="max-h-[300px]">
          {COUNTRY_CODES.map((country) => (
            <SelectItem key={country.code} value={country.code}>
              <span className="flex items-center gap-2">
                <span className="text-lg">{country.flag}</span>
                <span>{country.name}</span>
                <span className="text-muted-foreground">{country.code}</span>
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Input
        id={id}
        type="tel"
        placeholder={placeholder || "7XX XXX XXX"}
        value={phoneNumber}
        onChange={(e) => handleNumberChange(e.target.value)}
        className="h-12 text-base flex-1"
        dir="ltr"
      />
    </div>
  );
};

export default PhoneInput;
