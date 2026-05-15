import { useTimePeriod } from '../contexts/TimePeriodContext';

const StatusBarSpacer = () => {
  const { period } = useTimePeriod();

  const getBackgroundClass = () => {
    switch (period) {
      case 'morning':
        return 'bg-black/20';
      case 'afternoon':
        return 'bg-black/15';
      case 'night':
        return 'bg-black/30';
      default:
        return 'bg-black/20';
    }
  };

  return (
    <div className={`status-bar-spacer ${getBackgroundClass()} sticky top-0 z-50`}></div>
  );
};

export default StatusBarSpacer;
