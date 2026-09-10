import React, { ReactNode } from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends (React.Component as new (...args: any[]) => any) {
  state: State = {
    hasError: false,
    error: null,
  };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('Buku Ajaib ErrorBoundary caught an error:', error, errorInfo);
  }

  handleReset = () => {
    localStorage.removeItem('buku_ajaib_active_session');
    localStorage.removeItem('buku_ajaib_active_nav');
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#faf6f2] flex items-center justify-center p-4">
          <div className="bg-white max-w-md w-full p-6 rounded-2xl border-2 border-[#d5c3b8] shadow-lg text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-amber-100 border border-amber-300 text-amber-800 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold text-[#6f4627] font-serif">
              Terjadi Kendala Memuat Buku Tamu
            </h2>
            <p className="text-sm text-[#51443c]">
              {this.state.error?.message || 'Aplikasi mengalami kesalahan sementara saat memuat data.'}
            </p>
            <div className="pt-2 flex justify-center gap-3">
              <button
                type="button"
                onClick={this.handleReset}
                className="inline-flex items-center gap-2 bg-[#6f4627] hover:bg-[#5a371e] text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow transition-all active:scale-95"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Muat Ulang Aplikasi</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
