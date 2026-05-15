import { calculateDaysTogether } from '../utils/dateUtils';
import { useTimePeriod } from '../contexts/TimePeriodContext';
import { useState, useEffect } from 'react';
import { fetchTimelineData, saveMilestones, saveCustomDays } from '../services/timelineService';

const JourneyCard = () => {
  const daysTogether = calculateDaysTogether();
  const { period } = useTimePeriod();
  const [showTimeline, setShowTimeline] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [customDays, setCustomDays] = useState(daysTogether);
  const [editingMilestoneIndex, setEditingMilestoneIndex] = useState(null);
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [milestones, setMilestones] = useState([
    { date: '12/01/2026', title: 'Nos Conhecemos', description: 'O dia em que nossas histórias se cruzaram' },
    { date: '01/02/2026', title: 'Primeiro Encontro', description: 'Nosso primeiro encontro oficial' },
    { date: '01/03/2026', title: 'Primeira Viagem', description: 'Nossa primeira aventura juntos' },
    { date: '01/04/2026', title: 'Aniversário de 3 Meses', description: 'Celebrando 3 meses de amor' },
    { date: '14/05/2026', title: 'Hoje', description: `Juntos há ${daysTogether.toLocaleString('pt-BR')} dias` },
  ]);

  // Carregar dados do Firebase ao montar
  useEffect(() => {
    const loadTimelineData = async () => {
      const data = await fetchTimelineData();
      if (data) {
        if (data.milestones && data.milestones.length > 0) {
          setMilestones(data.milestones);
        }
        if (data.customDays !== null && data.customDays !== undefined) {
          setCustomDays(data.customDays);
        }
      }
    };
    loadTimelineData();
  }, []);

  const formatDateDisplay = (dateStr) => {
    const parts = dateStr.split('/');
    const day = parts[0] || '01';
    const month = parts[1] || '01';
    const year = parts[2] || '2026';
    const months = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
    const monthIndex = Math.max(0, Math.min(11, parseInt(month) - 1));
    return `${day} de ${months[monthIndex]}, ${year}`;
  };

  const getDaysInMonth = (month, year) => {
    const monthNum = parseInt(month);
    const yearNum = parseInt(year);
    const daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    
    // Verifica ano bissexto para fevereiro
    if (monthNum === 2) {
      const isLeapYear = (yearNum % 4 === 0 && yearNum % 100 !== 0) || (yearNum % 400 === 0);
      return isLeapYear ? 29 : 28;
    }
    
    return daysInMonth[monthNum - 1] || 31;
  };

  const handleDayChange = (index, value) => {
    const parts = milestones[index].date.split('/');
    const month = parseInt(parts[1]) || 1;
    const year = parseInt(parts[2]) || 2026;
    const maxDays = getDaysInMonth(month, year);
    let day = parseInt(value) || 1;

    // Limitar dia entre 1 e máximo do mês
    day = Math.max(1, Math.min(maxDays, day));

    parts[0] = day.toString().padStart(2, '0');
    
    const updated = [...milestones];
    updated[index].date = parts.join('/');
    setMilestones(updated);
    saveMilestones(updated);
  };

  const handleMonthChange = (index, value) => {
    const parts = milestones[index].date.split('/');
    let month = parseInt(value) || 1;

    // Limitar mês entre 1 e 12
    month = Math.max(1, Math.min(12, month));

    parts[1] = month.toString().padStart(2, '0');
    
    const updated = [...milestones];
    updated[index].date = parts.join('/');
    setMilestones(updated);
    saveMilestones(updated);
  };

  const handleYearChange = (index, value) => {
    const parts = milestones[index].date.split('/');
    let year = parseInt(value) || 2026;

    // Limitar ano entre 1900 e 2100
    year = Math.max(1900, Math.min(2100, year));

    parts[2] = year.toString();
    
    const updated = [...milestones];
    updated[index].date = parts.join('/');
    setMilestones(updated);
    saveMilestones(updated);
  };

  const handleDragStart = (index) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (index) => {
    if (draggedIndex === null || draggedIndex === index) return;
    
    const updated = [...milestones];
    const [removed] = updated.splice(draggedIndex, 1);
    updated.splice(index, 0, removed);
    setMilestones(updated);
    setDraggedIndex(null);
    saveMilestones(updated);
  };

  const getCardBackground = () => {
    switch (period) {
      case 'morning':
        return 'bg-white/25';
      case 'afternoon':
        return 'bg-white/25';
      case 'night':
        return 'bg-white/15';
      default:
        return 'bg-white/25';
    }
  };

  const getBorderColor = () => {
    switch (period) {
      case 'morning':
        return 'border-white/30';
      case 'afternoon':
        return 'border-white/30';
      case 'night':
        return 'border-white/20';
      default:
        return 'border-white/30';
    }
  };

  const getTextColor = () => {
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

  const getAccentColor = () => {
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

  return (
    <section className="px-6 md:px-16 py-4 w-full">
      <div className="w-full max-w-2xl flex flex-col items-start space-y-2">
        <div 
          className={`flex items-center gap-2 ${getCardBackground()} p-4 rounded-2xl border ${getBorderColor()} backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:bg-white/35 cursor-pointer`}
          onClick={() => setShowTimeline(true)}
        >
          <span className={`material-symbols-outlined ${getAccentColor} transition-transform duration-300 hover:scale-110`} style={{ fontVariationSettings: 'FILL 1' }}>
            favorite
          </span>
          <div className="flex flex-col flex-1">
            <span className={`font-label-md text-[11px] uppercase tracking-widest ${getTextColor}/70`}>Nossa Jornada</span>
            {isEditing ? (
              <div className="flex items-center gap-2 mt-1">
                <input
                  type="number"
                  value={customDays}
                  onChange={(e) => setCustomDays(parseInt(e.target.value) || 0)}
                  className={`w-24 px-2 py-1 rounded-lg bg-white/50 border ${getBorderColor} ${getTextColor} font-body-md text-[16px] focus:outline-none focus:ring-2 focus:ring-white/50`}
                  onClick={(e) => e.stopPropagation()}
                />
                <span className={`font-body-md text-[16px] ${getTextColor}`}>dias</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsEditing(false);
                    saveCustomDays(customDays);
                  }}
                  className="px-2 py-1 bg-white/50 rounded-lg text-xs font-medium hover:bg-white/70 transition-colors"
                >
                  Salvar
                </button>
              </div>
            ) : (
              <p className={`font-body-md text-[12px] ${getTextColor}`}>
                Dias desde que nos conhecemos: <span className={getAccentColor}>{customDays.toLocaleString('pt-BR')} dias</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsEditing(true);
                  }}
                  className="ml-2 text-xs opacity-60 hover:opacity-100 transition-opacity"
                >
                  ✏️
                </button>
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Timeline Modal */}
      {showTimeline && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowTimeline(false)}></div>
          <div className="relative bg-white/90 backdrop-blur-md rounded-2xl p-5 md:p-6 max-w-lg w-full max-h-[70vh] overflow-y-auto shadow-xl">
            <button 
              className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center rounded-full bg-gray-100/50 hover:bg-gray-200 transition-colors"
              onClick={() => setShowTimeline(false)}
            >
              <span className="material-symbols-outlined text-gray-500 text-[20px]">close</span>
            </button>
            
            <h2 className="font-headline-lg text-[26px] text-gray-700 mb-4 text-center">Nossa Jornada</h2>
            
            <div className="relative">
              {/* Timeline Line */}
              <div className="absolute left-3 md:left-4 top-0 bottom-0 w-0.5 bg-gray-300"></div>
              
              {/* Timeline Items */}
              <div className="space-y-4">
                {milestones.map((milestone, index) => (
                  <div 
                    key={index} 
                    className="relative pl-10 md:pl-12"
                    draggable
                    onDragStart={() => handleDragStart(index)}
                    onDragOver={handleDragOver}
                    onDrop={() => handleDrop(index)}
                  >
                    {/* Timeline Dot */}
                    <div className={`absolute left-1 md:left-2 w-2 h-2 rounded-full border-2 border-white cursor-move ${
                      index === 0 ? 'bg-gray-400' : 
                      index === milestones.length - 1 ? 'bg-gray-400' : 
                      'bg-gray-300'
                    }`}></div>
                    
                    {/* Milestone Card */}
                    <div className={`bg-gray-50/80 rounded-xl p-3 hover:bg-gray-100/80 transition-colors ${draggedIndex === index ? 'opacity-50' : ''}`}>
                      <div className="flex justify-between items-start mb-1">
                        <div className="font-label-md text-[12px] text-gray-500 uppercase tracking-wider">
                          {formatDateDisplay(milestone.date)}
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => setEditingMilestoneIndex(index)}
                            className="text-xs opacity-50 hover:opacity-100 transition-opacity"
                          >
                            ✏️
                          </button>
                          <span className="text-xs opacity-30 cursor-move">⋮⋮</span>
                        </div>
                      </div>
                      {editingMilestoneIndex === index ? (
                        <div className="space-y-2">
                          <div className="flex gap-2">
                            <input
                              type="number"
                              placeholder="Dia"
                              min="1"
                              max="31"
                              value={milestone.date.split('/')[0] || ''}
                              onChange={(e) => handleDayChange(index, e.target.value)}
                              className="w-16 px-2 py-1 rounded-lg bg-white/50 border border-gray-300 text-gray-700 text-[14px] focus:outline-none focus:ring-2 focus:ring-gray-300"
                            />
                            <input
                              type="number"
                              placeholder="Mês"
                              min="1"
                              max="12"
                              value={milestone.date.split('/')[1] || ''}
                              onChange={(e) => handleMonthChange(index, e.target.value)}
                              className="w-16 px-2 py-1 rounded-lg bg-white/50 border border-gray-300 text-gray-700 text-[14px] focus:outline-none focus:ring-2 focus:ring-gray-300"
                            />
                            <input
                              type="number"
                              placeholder="Ano"
                              min="1900"
                              max="2100"
                              value={milestone.date.split('/')[2] || ''}
                              onChange={(e) => handleYearChange(index, e.target.value)}
                              className="w-20 px-2 py-1 rounded-lg bg-white/50 border border-gray-300 text-gray-700 text-[14px] focus:outline-none focus:ring-2 focus:ring-gray-300"
                            />
                          </div>
                          <input
                            type="text"
                            value={milestone.title}
                            onChange={(e) => {
                              const updated = [...milestones];
                              updated[index].title = e.target.value;
                              setMilestones(updated);
                              saveMilestones(updated);
                            }}
                            className="w-full px-2 py-1 rounded-lg bg-white/50 border border-gray-300 text-gray-700 text-[16px] font-medium focus:outline-none focus:ring-2 focus:ring-gray-300"
                          />
                          <textarea
                            value={milestone.description}
                            onChange={(e) => {
                              const updated = [...milestones];
                              updated[index].description = e.target.value;
                              setMilestones(updated);
                              saveMilestones(updated);
                            }}
                            className="w-full px-2 py-1 rounded-lg bg-white/50 border border-gray-300 text-gray-600 text-[14px] focus:outline-none focus:ring-2 focus:ring-gray-300 resize-none"
                            rows="2"
                          />
                          <button
                            onClick={() => setEditingMilestoneIndex(null)}
                            className="px-3 py-1 bg-gray-200 rounded-lg text-xs font-medium hover:bg-gray-300 transition-colors"
                          >
                            Concluir
                          </button>
                        </div>
                      ) : (
                        <>
                          <h3 className="font-body-md text-[16px] text-gray-700 mb-1 font-medium">
                            {milestone.title}
                          </h3>
                          <p className="font-body-md text-[14px] text-gray-600">
                            {milestone.description}
                          </p>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default JourneyCard;
