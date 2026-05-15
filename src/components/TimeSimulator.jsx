import { useState } from 'react';

const TimeSimulator = ({ onTimeChange, isSimulating, onToggleSimulation }) => {
  const [hours, setHours] = useState(new Date().getHours());
  const [minutes, setMinutes] = useState(new Date().getMinutes());

  const handleTimeChange = (e) => {
    const totalMinutes = parseInt(e.target.value);
    const newHours = Math.floor(totalMinutes / 60);
    const newMinutes = totalMinutes % 60;
    
    setHours(newHours);
    setMinutes(newMinutes);
    
    onTimeChange(newHours, newMinutes);
  };

  const formatTime = (h, m) => {
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
  };

  const getPeriodLabel = (h) => {
    if (h >= 5 && h < 12) return '🌅 Manhã';
    if (h >= 12 && h < 18) return '☀️ Tarde';
    return '🌙 Noite';
  };

  const totalMinutes = hours * 60 + minutes;

  return (
    <div className="fixed bottom-24 right-4 z-50 bg-white/90 backdrop-blur-md rounded-2xl p-4 shadow-2xl border border-white/30 max-w-xs transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-black/20">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-semibold text-gray-800">⏱️ Simulador de Tempo</span>
        <button
          onClick={onToggleSimulation}
          className={`px-3 py-1 rounded-lg text-xs font-medium transition-all duration-300 hover:scale-105 active:scale-95 ${
            isSimulating 
              ? 'bg-[#FF6B6B] text-white hover:bg-[#FF5252]' 
              : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
          }`}
        >
          {isSimulating ? 'Ativado' : 'Ativar'}
        </button>
      </div>
      
      {isSimulating && (
        <div className="space-y-3">
          <div className="text-center">
            <div className="text-3xl font-bold text-[#FF6B35] font-display transition-transform duration-300 hover:scale-110">
              {formatTime(hours, minutes)}
            </div>
            <div className="text-sm text-gray-600 mt-1 transition-opacity duration-300 hover:opacity-80">
              {getPeriodLabel(hours)}
            </div>
          </div>
          
          <input
            type="range"
            min="0"
            max="1439"
            value={totalMinutes}
            onChange={handleTimeChange}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#FF6B35] transition-all duration-300 hover:scale-105"
          />
          
          <div className="flex justify-between text-xs text-gray-500">
            <span>00:00</span>
            <span>06:00</span>
            <span>12:00</span>
            <span>18:00</span>
            <span>23:59</span>
          </div>
          
          <div className="flex gap-2 mt-2">
            <button
              onClick={() => {
                setHours(6);
                setMinutes(0);
                onTimeChange(6, 0);
              }}
              className="flex-1 py-1 px-2 bg-[#FFE5B4] rounded-lg text-xs text-[#8B4513] hover:bg-[#FFD700] transition-all duration-300 hover:scale-105 active:scale-95"
            >
              🌅 06:00
            </button>
            <button
              onClick={() => {
                setHours(12);
                setMinutes(0);
                onTimeChange(12, 0);
              }}
              className="flex-1 py-1 px-2 bg-[#FFD700] rounded-lg text-xs text-[#8B4500] hover:bg-[#FFA500] transition-all duration-300 hover:scale-105 active:scale-95"
            >
              ☀️ 12:00
            </button>
            <button
              onClick={() => {
                setHours(20);
                setMinutes(0);
                onTimeChange(20, 0);
              }}
              className="flex-1 py-1 px-2 bg-[#1a1a3e] rounded-lg text-xs text-white hover:bg-[#4a90e2] transition-all duration-300 hover:scale-105 active:scale-95"
            >
              🌙 20:00
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TimeSimulator;
