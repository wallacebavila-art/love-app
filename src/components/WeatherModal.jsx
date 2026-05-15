const WeatherModal = ({ isOpen, onClose, weather }) => {
  if (!isOpen || !weather) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
        >
          <span className="material-symbols-outlined text-gray-600 text-[20px]">close</span>
        </button>

        <div className="text-center mb-6">
          <span className="material-symbols-outlined text-blue-600 text-[48px]">cloud</span>
          <h2 className="font-headline-lg text-[28px] text-gray-800 mt-2">Clima de Hoje</h2>
          <p className="font-body-md text-[14px] text-gray-600 mt-2">
            Raíssa, informações do clima para você saber como será seu dia
          </p>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-blue-50 rounded-xl">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-blue-600 text-[24px]">thermostat</span>
              <span className="font-body-md text-[16px] text-gray-700">Temperatura</span>
            </div>
            <span className="font-body-md text-[20px] text-gray-800 font-bold">{weather.temp}°C</span>
          </div>

          <div className="flex items-center justify-between p-4 bg-blue-50 rounded-xl">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-blue-600 text-[24px]">device_thermostat</span>
              <span className="font-body-md text-[16px] text-gray-700">Sensação Térmica</span>
            </div>
            <span className="font-body-md text-[20px] text-gray-800 font-bold">{weather.feelsLike}°C</span>
          </div>

          <div className="flex items-center justify-between p-4 bg-blue-50 rounded-xl">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-blue-600 text-[24px]">water_drop</span>
              <span className="font-body-md text-[16px] text-gray-700">Umidade</span>
            </div>
            <span className="font-body-md text-[20px] text-gray-800 font-bold">{weather.humidity}%</span>
          </div>

          <div className="flex items-center justify-between p-4 bg-blue-50 rounded-xl">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-blue-600 text-[24px]">wb_sunny</span>
              <span className="font-body-md text-[16px] text-gray-700">Condição</span>
            </div>
            <span className="font-body-md text-[16px] text-gray-800 font-medium capitalize">{weather.description}</span>
          </div>
        </div>

        <div className="mt-6 text-center">
          <p className="font-body-md text-[12px] text-gray-500">
            Rio de Janeiro, Brasil
          </p>
        </div>
      </div>
    </div>
  );
};

export default WeatherModal;
