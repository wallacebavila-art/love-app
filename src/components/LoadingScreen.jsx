import React from 'react';

/**
 * Componente de tela de carregamento com animação de livro abrindo
 * 
 * Exibe uma animação de livro abrindo com a sigla "BdR" e um coração
 * enquanto o aplicativo carrega os dados iniciais.
 */

const LoadingScreen = ({ bookOpenStage }) => {
  return (
    <>
      {/* Metade esquerda do livro - apenas "BdR" bem colado no centro */}
      <div
        className={`fixed inset-y-0 left-0 z-50 bg-black/90 backdrop-blur-xl flex items-center justify-end pr-4 md:pr-8 overflow-hidden transition-all duration-1000 ease-in-out ${
          bookOpenStage === 'opening'
            ? 'w-0 opacity-0 [transform:perspective(1200px)_rotateY(15deg)_translateX(-30px)] backdrop-blur-xl'
            : 'w-1/2 opacity-100 [transform:perspective(1200px)_rotateY(0deg)_translateX(0)] backdrop-blur-lg'
        }`}
        style={{
          transformOrigin: 'right center',
        }}
      >
        <p className="text-white text-5xl font-bold tracking-wider text-right">BdR</p>
      </div>

      {/* Metade direita do livro - apenas coração branco bem colocado no centro */}
      <div
        className={`fixed inset-y-0 right-0 z-50 bg-black/90 backdrop-blur-xl flex items-center justify-start pl-4 md:pl-8 overflow-hidden transition-all duration-1000 ease-in-out ${
          bookOpenStage === 'opening'
            ? 'w-0 opacity-0 [transform:perspective(1200px)_rotateY(-15deg)_translateX(30px)] backdrop-blur-xl'
            : 'w-1/2 opacity-100 [transform:perspective(1200px)_rotateY(0deg)_translateX(0)] backdrop-blur-lg'
        }`}
        style={{
          transformOrigin: 'left center',
        }}
      >
        <svg className="w-20 h-20 text-white animate-pulse" fill="currentColor" viewBox="0 0 24 24" style={{ animationDuration: '1.2s' }}>
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
        </svg>
      </div>

      {/* Linha horizontal entre a sigla/coração e o "Carregando..." */}
      <div
        className={`fixed left-1/2 -translate-x-1/2 z-50 transition-all duration-700 ${
          bookOpenStage === 'opening' ? 'opacity-0 translate-y-4' : 'opacity-100'
        }`}
        style={{ bottom: '5.5rem' }}
      >
        <div className="w-64 h-[2px] bg-gradient-to-r from-white/10 via-pink-400/60 to-white/10 rounded-full"></div>
      </div>

      {/* Texto "Carregando..." abaixo */}
      <div
        className={`fixed bottom-12 left-1/2 -translate-x-1/2 z-50 transition-all duration-700 ${
          bookOpenStage === 'opening' ? 'opacity-0 translate-y-4' : 'opacity-100'
        }`}
      >
        <p className="text-white/60 text-sm font-medium tracking-wider animate-pulse">
          Carregando...
        </p>
      </div>
    </>
  );
};

export default React.memo(LoadingScreen);
