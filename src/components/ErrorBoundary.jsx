import { Component } from 'react';

/**
 * Error Boundary Component
 * Captura erros de renderização em componentes filhos e exibe uma UI de fallback
 */
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Atualiza o estado para mostrar a UI de fallback na próxima renderização
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log do erro para debugging
    console.error('Error Boundary capturou um erro:', error, errorInfo);
    
    // Salvar informações do erro no estado
    this.setState({
      error: error,
      errorInfo: errorInfo
    });

    // Opcional: Enviar erro para serviço de logging (ex: Sentry)
    // logErrorToService(error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      // UI de fallback quando há erro
      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-500/20 to-purple-500/20 p-4">
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 max-w-md w-full text-center shadow-2xl">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-red-500/20 flex items-center justify-center">
              <span className="material-symbols-outlined text-red-400 text-[40px]">error</span>
            </div>
            
            <h1 className="text-2xl font-bold text-white mb-4">
              Algo deu errado
            </h1>
            
            <p className="text-white/70 mb-6">
              Ocorreu um erro inesperado. Por favor, tente recarregar a página.
            </p>

            {import.meta.env.DEV && this.state.error && (
              <details className="mb-6 text-left">
                <summary className="cursor-pointer text-white/50 text-sm mb-2 hover:text-white/70">
                  Detalhes do erro (desenvolvimento)
                </summary>
                <div className="bg-black/30 rounded-lg p-4 mt-2 overflow-auto max-h-40">
                  <p className="text-red-400 text-xs font-mono mb-2">
                    {this.state.error.toString()}
                  </p>
                  {this.state.errorInfo && (
                    <pre className="text-white/40 text-xs font-mono">
                      {this.state.errorInfo.componentStack}
                    </pre>
                  )}
                </div>
              </details>
            )}

            <div className="flex gap-3">
              <button
                onClick={this.handleReset}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-xl font-semibold hover:from-pink-600 hover:to-purple-600 transition-all shadow-lg hover:shadow-xl"
              >
                Tentar novamente
              </button>
              <button
                onClick={() => window.location.reload()}
                className="flex-1 px-6 py-3 bg-white/20 text-white rounded-xl font-semibold hover:bg-white/30 transition-all"
              >
                Recarregar página
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
