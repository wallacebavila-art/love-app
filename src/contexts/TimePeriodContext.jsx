import { createContext, useContext, useState, useEffect } from 'react';
import { getDayPeriod, setSimulatedTime, clearSimulatedTime } from '../utils/dateUtils';

const TimePeriodContext = createContext();

export const useTimePeriod = () => {
  const context = useContext(TimePeriodContext);
  if (!context) {
    throw new Error('useTimePeriod must be used within a TimePeriodProvider');
  }
  return context;
};

export const TimePeriodProvider = ({ children }) => {
  const [period, setPeriod] = useState(getDayPeriod());
  const [isSimulating, setIsSimulating] = useState(false);

  const updateTimePeriod = () => {
    setPeriod(getDayPeriod());
  };

  const handleTimeChange = (hours, minutes) => {
    setSimulatedTime(hours, minutes);
    updateTimePeriod();
  };

  const handleToggleSimulation = () => {
    if (isSimulating) {
      clearSimulatedTime();
      setIsSimulating(false);
      updateTimePeriod();
    } else {
      setIsSimulating(true);
      const now = new Date();
      setSimulatedTime(now.getHours(), now.getMinutes());
      updateTimePeriod();
    }
  };

  // Atualizar o período a cada minuto quando não está simulando
  useEffect(() => {
    if (!isSimulating) {
      const interval = setInterval(() => {
        updateTimePeriod();
      }, 60000); // Atualiza a cada minuto

      return () => clearInterval(interval);
    }
  }, [isSimulating]);

  return (
    <TimePeriodContext.Provider value={{ period, isSimulating, handleTimeChange, handleToggleSimulation }}>
      {children}
    </TimePeriodContext.Provider>
  );
};
