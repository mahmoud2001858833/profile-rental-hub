import { Pizza, Cake, Coffee, Sandwich, Cherry, Cookie } from 'lucide-react';

const FloatingFoodIcons = () => {
  const icons = [
    { Icon: Pizza, delay: '0s', duration: '6s', left: '5%', top: '10%', size: 48 },
    { Icon: Cake, delay: '1s', duration: '7s', left: '85%', top: '15%', size: 40 },
    { Icon: Coffee, delay: '2s', duration: '5s', left: '15%', top: '70%', size: 36 },
    { Icon: Sandwich, delay: '0.5s', duration: '8s', left: '90%', top: '60%', size: 44 },
    { Icon: Cherry, delay: '1.5s', duration: '6.5s', left: '75%', top: '80%', size: 32 },
    { Icon: Cookie, delay: '2.5s', duration: '7.5s', left: '10%', top: '40%', size: 38 },
    { Icon: Pizza, delay: '3s', duration: '6s', left: '50%', top: '5%', size: 42 },
    { Icon: Cake, delay: '0.8s', duration: '7s', left: '25%', top: '85%', size: 36 },
  ];

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {icons.map((item, index) => {
        const { Icon, delay, duration, left, top, size } = item;
        return (
          <div
            key={index}
            className="absolute animate-float text-primary/10"
            style={{
              left,
              top,
              animationDelay: delay,
              animationDuration: duration,
            }}
          >
            <Icon 
              size={size} 
              strokeWidth={1.5}
              className="drop-shadow-sm"
            />
          </div>
        );
      })}
    </div>
  );
};

export default FloatingFoodIcons;
