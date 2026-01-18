import { MessageCircle } from 'lucide-react';

const WhatsAppButton = () => {
  const phoneNumber = '962799126390'; // Format: country code + number without leading 0
  
  const handleClick = () => {
    window.open(`https://wa.me/${phoneNumber}`, '_blank');
  };

  return (
    <button
      onClick={handleClick}
      className="fixed bottom-6 left-6 z-50 w-14 h-14 bg-[#25D366] hover:bg-[#20BD5A] text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center group hover:scale-110"
      aria-label="تواصل عبر واتساب"
    >
      <MessageCircle className="h-7 w-7 fill-current" />
      
      {/* Tooltip */}
      <span className="absolute left-full mr-3 px-3 py-1.5 bg-card text-foreground text-sm rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none border border-border">
        تواصل معنا
      </span>
      
      {/* Pulse animation */}
      <span className="absolute inset-0 rounded-full bg-[#25D366] animate-ping opacity-25" />
    </button>
  );
};

export default WhatsAppButton;
