import { calculateDaysTogether } from '../utils/dateUtils';
import { useTimePeriod } from '../contexts/TimePeriodContext';
import { useState, useEffect } from 'react';
import { fetchTimelineData, saveMilestones, saveCustomDays } from '../services/timelineService';

const JourneyCard = () => {
  const daysTogether = calculateDaysTogether();
  const { period } = useTimePeriod();
  const [showTimeline, setShowTimeline] = useState(false);
  const [customDays, setCustomDays] = useState(daysTogether);
  const [editingMilestoneIndex, setEditingMilestoneIndex] = useState(null);
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [isAddingMilestone, setIsAddingMilestone] = useState(false);
  const [newMilestone, setNewMilestone] = useState({
    date: '',
    title: '',
    description: ''
  });
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
    e.dataTransfer.dropEffect = 'move';
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

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  const handleAddMilestone = () => {
    const today = new Date();
    setNewMilestone({
      date: `${String(today.getDate()).padStart(2, '0')}/${String(today.getMonth() + 1).padStart(2, '0')}/${today.getFullYear()}`,
      title: '',
      description: ''
    });
    setIsAddingMilestone(true);
  };

  const handleSaveNewMilestone = () => {
    if (!newMilestone.title.trim()) {
      alert('Por favor, preencha o título do marco');
      return;
    }
    const updated = [...milestones, { ...newMilestone }];
    setMilestones(updated);
    saveMilestones(updated);
    setIsAddingMilestone(false);
    setNewMilestone({ date: '', title: '', description: '' });
  };

  const handleCancelAddMilestone = () => {
    setIsAddingMilestone(false);
    setNewMilestone({ date: '', title: '', description: '' });
  };

  const handleDeleteMilestone = (index) => {
    if (window.confirm('Tem certeza que deseja excluir este marco?')) {
      const updated = milestones.filter((_, i) => i !== index);
      setMilestones(updated);
      saveMilestones(updated);
    }
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
    <section className="w-full">
      <div className="w-full flex flex-col items-start space-y-2">
        <div 
          className={`group flex items-center gap-3 ${getCardBackground()} p-4 rounded-3xl border ${getBorderColor()} backdrop-blur-sm transition-all duration-500 hover:scale-[1.02] hover:bg-white/40 cursor-pointer shadow-lg hover:shadow-xl`}
          onClick={() => setShowTimeline(true)}
        >
          <div className={`relative flex-shrink-0`}>
            <div className={`absolute inset-0 bg-gradient-to-br from-pink-400 to-purple-500 rounded-full blur-md opacity-60 group-hover:opacity-80 transition-opacity duration-300`}></div>
            <span className={`material-symbols-outlined ${getAccentColor()} relative z-10 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-12`} style={{ fontVariationSettings: 'FILL 1' }}>
              favorite
            </span>
          </div>
          <div className="flex flex-col flex-1 min-w-0">
            <span className={`font-label-md text-[10px] uppercase tracking-[0.2em] ${getTextColor()}/60 mb-1`}>Nossa Jornada</span>
            <div className="flex items-center gap-2">
              <p className={`font-body-md text-[13px] ${getTextColor()}`}>
                Dias desde que nos conhecemos: <span className={`font-bold ${getAccentColor()} text-[15px]`}>{customDays.toLocaleString('pt-BR')} dias</span>
              </p>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowTimeline(true);
                }}
                className="opacity-40 hover:opacity-100 transition-opacity p-1 rounded-lg hover:bg-white/20"
              >
                <span className="material-symbols-outlined text-[16px]">edit</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Timeline Modal */}
      {showTimeline && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-in fade-in duration-300" onClick={() => setShowTimeline(false)}></div>
          <div className="relative bg-white/95 backdrop-blur-xl rounded-3xl p-5 md:p-6 max-w-3xl w-full max-h-[85vh] overflow-y-auto shadow-2xl animate-in zoom-in-95 duration-300">
            <button 
              className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-all hover:scale-110"
              onClick={() => setShowTimeline(false)}
            >
              <span className="material-symbols-outlined text-gray-600 text-[20px]">close</span>
            </button>
            
            <div className="mb-6">
              <h2 className="font-headline-lg text-[24px] bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent font-bold text-center mb-2">Nossa Jornada</h2>
              <p className="text-center text-gray-500 text-[13px]">Cada momento especial da nossa história</p>
            </div>
            
            <div className="relative">
              {/* Timeline Line */}
              <div className="absolute left-4 md:left-5 top-0 bottom-0 w-1 bg-gradient-to-b from-purple-400 to-pink-400 rounded-full"></div>
              
              {/* Timeline Items */}
              <div className="space-y-5">
                {milestones.map((milestone, index) => (
                  <div 
                    key={index} 
                    className={`relative pl-12 md:pl-14 group transition-all duration-300 ${
                      draggedIndex === index ? 'opacity-40 scale-95' : ''
                    }`}
                    draggable
                    onDragStart={() => handleDragStart(index)}
                    onDragOver={handleDragOver}
                    onDrop={() => handleDrop(index)}
                    onDragEnd={handleDragEnd}
                  >
                    {/* Timeline Dot */}
                    <div className={`absolute left-2 md:left-3 w-4 h-4 rounded-full border-4 border-white cursor-move shadow-md transition-all duration-300 group-hover:scale-125 ${
                      index === 0 ? 'bg-gradient-to-br from-purple-500 to-pink-500' : 
                      index === milestones.length - 1 ? 'bg-gradient-to-br from-purple-500 to-pink-500' : 
                      'bg-gradient-to-br from-purple-400 to-pink-400'
                    }`}></div>
                    
                    {/* Milestone Card */}
                    <div className={`bg-gradient-to-br from-gray-50 to-white rounded-2xl p-3 border border-gray-100 hover:border-purple-200 hover:shadow-lg transition-all duration-300 cursor-move ${
                      draggedIndex !== null && draggedIndex === index ? 'border-purple-300 bg-purple-50/30' : 'hover:scale-[1.02]'
                    }`}>
                      <div className="flex justify-between items-start mb-2">
                        <div className="font-label-md text-[10px] text-purple-600 uppercase tracking-wider font-semibold">
                          {formatDateDisplay(milestone.date)}
                        </div>
                        <div className="flex gap-1">
                          <button
                            onClick={() => setEditingMilestoneIndex(index)}
                            className="p-1.5 rounded-lg hover:bg-purple-100 text-gray-400 hover:text-purple-600 transition-all"
                          >
                            <span className="material-symbols-outlined text-[16px]">edit</span>
                          </button>
                          <button
                            onClick={() => handleDeleteMilestone(index)}
                            className="p-1.5 rounded-lg hover:bg-red-100 text-gray-400 hover:text-red-600 transition-all"
                          >
                            <span className="material-symbols-outlined text-[16px]">delete</span>
                          </button>
                          <span className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-300 cursor-move">
                            <span className="material-symbols-outlined text-[16px]">drag_indicator</span>
                          </span>
                        </div>
                      </div>
                      {editingMilestoneIndex === index ? (
                        <div className="space-y-3">
                          <div className="flex gap-2">
                            <input
                              type="number"
                              placeholder="Dia"
                              min="1"
                              max="31"
                              value={milestone.date.split('/')[0] || ''}
                              onChange={(e) => handleDayChange(index, e.target.value)}
                              className="w-16 px-3 py-2 rounded-xl bg-gray-300 border border-gray-200 text-gray-700 text-[14px] font-medium focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-purple-300 focus:bg-gray-400 transition-all"
                            />
                            <input
                              type="number"
                              placeholder="Mês"
                              min="1"
                              max="12"
                              value={milestone.date.split('/')[1] || ''}
                              onChange={(e) => handleMonthChange(index, e.target.value)}
                              className="w-16 px-3 py-2 rounded-xl bg-gray-300 border border-gray-200 text-gray-700 text-[14px] font-medium focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-purple-300 focus:bg-gray-400 transition-all"
                            />
                            <input
                              type="number"
                              placeholder="Ano"
                              min="1900"
                              max="2100"
                              value={milestone.date.split('/')[2] || ''}
                              onChange={(e) => handleYearChange(index, e.target.value)}
                              className="w-20 px-3 py-2 rounded-xl bg-gray-300 border border-gray-200 text-gray-700 text-[14px] font-medium focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-purple-300 focus:bg-gray-400 transition-all"
                            />
                          </div>
                          <div className="relative">
                            <input
                              type="text"
                              value={milestone.title}
                              onChange={(e) => {
                                const updated = [...milestones];
                                updated[index].title = e.target.value;
                                setMilestones(updated);
                                saveMilestones(updated);
                              }}
                              className="w-full px-3 py-2 rounded-xl bg-gray-300 border border-gray-200 text-gray-700 text-[14px] font-semibold focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-purple-300 focus:bg-gray-400 transition-all"
                            />
                          </div>
                          <div className="relative">
                            <textarea
                              value={milestone.description}
                              onChange={(e) => {
                                const updated = [...milestones];
                                updated[index].description = e.target.value;
                                setMilestones(updated);
                                saveMilestones(updated);
                              }}
                              className="w-full px-3 py-2 rounded-xl bg-gray-300 border border-gray-200 text-gray-600 text-[13px] focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-purple-300 focus:bg-gray-400 resize-none transition-all"
                              rows="2"
                            />
                          </div>
                          <button
                            onClick={() => setEditingMilestoneIndex(null)}
                            className="w-full px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl text-xs font-semibold hover:from-purple-600 hover:to-pink-600 transition-all shadow-md hover:shadow-lg"
                          >
                            Concluir
                          </button>
                        </div>
                      ) : (
                        <>
                          <h3 className="font-body-md text-[15px] text-gray-800 mb-1.5 font-semibold">
                            {milestone.title}
                          </h3>
                          <p className="font-body-md text-[13px] text-gray-600 leading-relaxed">
                            {milestone.description}
                          </p>
                        </>
                      )}
                    </div>
                  </div>
                ))}
                
                {/* Add Milestone Button */}
                {!isAddingMilestone ? (
                  <div className="relative pl-12 md:pl-14">
                    <div className="absolute left-2 md:left-3 w-4 h-4 rounded-full border-4 border-white bg-gradient-to-br from-purple-400 to-pink-400"></div>
                    <button
                      onClick={handleAddMilestone}
                      className="w-full py-3 border-2 border-dashed border-purple-300 rounded-2xl text-purple-400 hover:border-purple-500 hover:text-purple-500 hover:bg-purple-50 transition-all flex items-center justify-center gap-2"
                    >
                      <span className="material-symbols-outlined">add</span>
                      <span className="text-sm font-medium">Adicionar novo marco</span>
                    </button>
                  </div>
                ) : (
                  <div className="relative pl-12 md:pl-14">
                    <div className="absolute left-2 md:left-3 w-4 h-4 rounded-full border-4 border-white bg-gradient-to-br from-purple-500 to-pink-500"></div>
                    <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-3 border-2 border-purple-200">
                      <div className="space-y-3">
                        <div className="flex gap-2">
                          <input
                            type="number"
                            placeholder="Dia"
                            min="1"
                            max="31"
                            value={newMilestone.date.split('/')[0] || ''}
                            onChange={(e) => {
                              const parts = newMilestone.date.split('/');
                              parts[0] = e.target.value.padStart(2, '0');
                              setNewMilestone({ ...newMilestone, date: parts.join('/') });
                            }}
                            className="w-16 px-3 py-2 rounded-xl bg-gray-300 border border-purple-200 text-gray-700 text-[13px] font-medium focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-purple-300 focus:bg-gray-400 transition-all"
                          />
                          <input
                            type="number"
                            placeholder="Mês"
                            min="1"
                            max="12"
                            value={newMilestone.date.split('/')[1] || ''}
                            onChange={(e) => {
                              const parts = newMilestone.date.split('/');
                              parts[1] = e.target.value.padStart(2, '0');
                              setNewMilestone({ ...newMilestone, date: parts.join('/') });
                            }}
                            className="w-16 px-3 py-2 rounded-xl bg-gray-300 border border-purple-200 text-gray-700 text-[13px] font-medium focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-purple-300 focus:bg-gray-400 transition-all"
                          />
                          <input
                            type="number"
                            placeholder="Ano"
                            min="1900"
                            max="2100"
                            value={newMilestone.date.split('/')[2] || ''}
                            onChange={(e) => {
                              const parts = newMilestone.date.split('/');
                              parts[2] = e.target.value;
                              setNewMilestone({ ...newMilestone, date: parts.join('/') });
                            }}
                            className="w-20 px-3 py-2 rounded-xl bg-gray-300 border border-purple-200 text-gray-700 text-[13px] font-medium focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-purple-300 focus:bg-gray-400 transition-all"
                          />
                        </div>
                        <div className="relative">
                          <input
                            type="text"
                            placeholder="Título do marco"
                            value={newMilestone.title}
                            onChange={(e) => setNewMilestone({ ...newMilestone, title: e.target.value })}
                            className="w-full px-3 py-2 rounded-xl bg-gray-300 border border-purple-200 text-gray-700 text-[14px] font-semibold focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-purple-300 focus:bg-gray-400 transition-all"
                          />
                        </div>
                        <div className="relative">
                          <textarea
                            placeholder="Descrição do marco"
                            value={newMilestone.description}
                            onChange={(e) => setNewMilestone({ ...newMilestone, description: e.target.value })}
                            className="w-full px-3 py-2 rounded-xl bg-gray-300 border border-purple-200 text-gray-600 text-[13px] focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-purple-300 focus:bg-gray-400 resize-none transition-all"
                            rows="2"
                          />
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={handleSaveNewMilestone}
                            className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl text-xs font-semibold hover:from-purple-600 hover:to-pink-600 transition-all shadow-md hover:shadow-lg"
                          >
                            Salvar
                          </button>
                          <button
                            onClick={handleCancelAddMilestone}
                            className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-xl text-xs font-semibold hover:bg-gray-300 transition-all"
                          >
                            Cancelar
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default JourneyCard;



