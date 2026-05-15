import { useTimePeriod } from '../contexts/TimePeriodContext';

const BottomNav = () => {
  const { period } = useTimePeriod();

  const getBackgroundClass = () => {
    switch (period) {
      case 'morning':
        return 'bg-[#fbf9f5]/30';
      case 'afternoon':
        return 'bg-[#fbf9f5]/30';
      case 'night':
        return 'bg-[#30312e]/30';
      default:
        return 'bg-[#fbf9f5]/30';
    }
  };

  const getActiveColor = () => {
    switch (period) {
      case 'morning':
        return 'text-white';
      case 'afternoon':
        return 'text-white';
      case 'night':
        return 'text-white';
      default:
        return 'text-white';
    }
  };

  const getInactiveColor = () => {
    switch (period) {
      case 'morning':
        return 'text-white/70';
      case 'afternoon':
        return 'text-white/70';
      case 'night':
        return 'text-white/70';
      default:
        return 'text-white/70';
    }
  };

  const getActiveBg = () => {
    switch (period) {
      case 'morning':
        return 'bg-white/30';
      case 'afternoon':
        return 'bg-white/30';
      case 'night':
        return 'bg-white/20';
      default:
        return 'bg-white/30';
    }
  };

  return (
    <nav className={`fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-8 pb-8 pt-4 ${getBackgroundClass()} backdrop-blur-xl border-t border-[#d4c3ba]/20 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] rounded-t-xl`}>
      {/* Active Tab: Memories/Magic */}
      <button className="flex flex-col items-center justify-center ${getActiveColor()} ${getActiveBg()} rounded-full p-3 hover:scale-110 hover:shadow-lg hover:shadow-black/20 transition-all duration-300 active:scale-95">
        <span className="material-symbols-outlined transition-transform duration-300" style={{ fontVariationSettings: 'FILL 1' }}>auto_awesome</span>
      </button>
      {/* Inactive Tab: Favorite */}
      <button className="flex flex-col items-center justify-center ${getInactiveColor} p-3 hover:scale-110 hover:bg-white/20 hover:shadow-lg hover:shadow-black/10 transition-all duration-300 active:scale-95 rounded-full">
        <span className="material-symbols-outlined transition-transform duration-300">favorite</span>
      </button>
      {/* Inactive Tab: Settings */}
      <button className="flex flex-col items-center justify-center ${getInactiveColor} p-3 hover:scale-110 hover:bg-white/20 hover:shadow-lg hover:shadow-black/10 transition-all duration-300 active:scale-95 rounded-full">
        <span className="material-symbols-outlined transition-transform duration-300">settings</span>
      </button>
    </nav>
  );
};

export default BottomNav;
