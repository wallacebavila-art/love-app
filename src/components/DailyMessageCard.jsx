import RevealCard from './RevealCard';

const DailyMessageCard = ({ message }) => {
  return (
    <RevealCard
      title="Mensagem do dia"
      content={message}
    />
  );
};

export default DailyMessageCard;
