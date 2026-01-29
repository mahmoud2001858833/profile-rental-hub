import { Pizza, Cake, Coffee, Sandwich, Cherry, Cookie, Croissant, IceCreamCone } from 'lucide-react';

const FloatingFoodIcons = () => {
  const icons = [
    { Icon: Pizza, delay: '0s', duration: '8s', left: '5%', top: '15%', size: 56, color: 'text-primary/30' },
    { Icon: Cake, delay: '1s', duration: '9s', left: '88%', top: '12%', size: 48, color: 'text-primary/25' },
    { Icon: Coffee, delay: '2s', duration: '7s', left: '12%', top: '75%', size: 44, color: 'text-primary/28' },
    { Icon: Sandwich, delay: '0.5s', duration: '10s', left: '92%', top: '55%', size: 52, color: 'text-primary/22' },
    { Icon: Cherry, delay: '1.5s', duration: '8.5s', left: '78%', top: '82%', size: 40, color: 'text-success/30' },
    { Icon: Cookie, delay: '2.5s', duration: '9.5s', left: '8%', top: '45%', size: 46, color: 'text-primary/26' },
    { Icon: Pizza, delay: '3s', duration: '8s', left: '55%', top: '8%', size: 50, color: 'text-primary/24' },
    { Icon: Cake, delay: '0.8s', duration: '9s', left: '22%', top: '88%', size: 44, color: 'text-primary/28' },
    { Icon: Croissant, delay: '1.2s', duration: '7.5s', left: '68%', top: '22%', size: 42, color: 'text-primary/25' },
    { Icon: IceCreamCone, delay: '2.2s', duration: '8.8s', left: '35%', top: '68%', size: 38, color: 'text-success/25' },
    { Icon: Coffee, delay: '0.3s', duration: '10s', left: '82%', top: '38%', size: 36, color: 'text-primary/20' },
    { Icon: Sandwich, delay: '1.8s', duration: '7.8s', left: '18%', top: '28%', size: 40, color: 'text-primary/22' },
  ];

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {icons.map((item, index) => {
        const { Icon, delay, duration, left, top, size, color } = item;
        return (
          <div
            key={index}
            className={`absolute animate-float ${color}`}
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
              className="drop-shadow-lg"
            />
          </div>
        );
      })}
    </div>
  );
};

export default FloatingFoodIcons;
