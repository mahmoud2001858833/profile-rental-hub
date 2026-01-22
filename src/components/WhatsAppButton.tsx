import { MessageCircle, X } from 'lucide-react';
import { useState } from 'react';

const WhatsAppButton = () => {
  const [showNumber, setShowNumber] = useState(false);
  const phoneNumber = '0799126390';
  
  const handleClick = () => {
    setShowNumber(!showNumber);
  };

  return (
    <div className="fixed bottom-20 left-6 z-50">
      {/* Phone number popup */}
      {showNumber && (
        <div className="absolute bottom-12 left-0 bg-card border border-border rounded-xl shadow-xl p-3 animate-fade-in min-w-[180px]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-muted-foreground">واتساب</span>
            <button 
              onClick={() => setShowNumber(false)}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
          <a 
            href={`https://wa.me/962799126390`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-base font-semibold text-foreground hover:text-primary transition-colors block text-center"
            dir="ltr"
          >
            {phoneNumber}
          </a>
        </div>
      )}
      
      {/* WhatsApp button - Smaller */}
      <button
        onClick={handleClick}
        className="w-10 h-10 bg-[#25D366] hover:bg-[#20BD5A] text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center hover:scale-110"
        aria-label="تواصل عبر واتساب"
      >
        <MessageCircle className="h-5 w-5 fill-current" />
        
        {/* Pulse animation */}
        {!showNumber && (
          <span className="absolute inset-0 rounded-full bg-[#25D366] animate-ping opacity-25" />
        )}
      </button>
    </div>
  );
};

export default WhatsAppButton;
