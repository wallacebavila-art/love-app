import RevealCard from './RevealCard';

const DailyVerseCard = ({ verse }) => {
  return (
    <RevealCard
      title="Versículo do dia"
      content={verse}
    />
  );
};

export default DailyVerseCard;
