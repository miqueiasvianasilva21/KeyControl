import React, { useState, useEffect } from 'react';
import { KeyRound, Package } from 'lucide-react';
import { useReceive } from '../providers/ReceiveProvider';

export function Receive() {
  const {
    codigo,
    setCodigo,
    confirmacao,
    erro,
    sucesso,
    handleBuscar,
    handleKeyPress,
    handleConfirmar,
    handleCancelar,
  } = useReceive();

  const [itensSelecionados, setItensSelecionados] = useState<number[]>([]);

  useEffect(() => {
    if (confirmacao?.mostrar && confirmacao?.items) {
      setItensSelecionados(confirmacao.items.map((item: any) => item.id));
    }
  }, [confirmacao?.mostrar]);

  useEffect(() => {
    if (!confirmacao?.mostrar) return;

    const handleConfirmarComEnter = (event: KeyboardEvent) => {
      if (event.key !== 'Enter' || itensSelecionados.length === 0) return;

      const target = event.target as HTMLElement | null;
      if (target?.tagName === 'BUTTON') return;

      event.preventDefault();
      handleConfirmar(itensSelecionados);
    };

    window.addEventListener('keydown', handleConfirmarComEnter);
    return () => {
      window.removeEventListener('keydown', handleConfirmarComEnter);
    };
  }, [confirmacao?.mostrar, handleConfirmar, itensSelecionados]);

  const toggleItem = (id: number) => {
    setItensSelecionados((prev) =>
      prev.includes(id)
        ? prev.filter((itemId) => itemId !== id)
        : [...prev, id],
    );
  };

  return (
    <div className="p-8 bg-gray-50 dark:bg-background min-h-screen">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Receber Chave/Kit
          </h1>
          <p className="text-muted-foreground">
            Digite o número da sala para visualizar os itens emprestados e
            efetuar a devolução.
          </p>
        </div>

        <div className="bg-card rounded-lg border border-border p-8 shadow-sm bg-white">
          <div className="flex items-center gap-3 mb-4">
            <KeyRound className="w-6 h-6 text-muted-foreground" />
            <Package className="w-6 h-6 text-muted-foreground" />
            <label
              htmlFor="codigo"
              className="text-lg font-medium text-foreground"
            >
              Número da Sala
            </label>
          </div>

          <input
            id="codigo"
            type="text"
            placeholder="Digite o número da sala (ex: 101)..."
            value={codigo}
            onChange={(e) => setCodigo(e.target.value)}
            onKeyDown={handleKeyPress}
            disabled={!!confirmacao?.mostrar}
            className="w-full h-12 px-4 rounded-md border border-gray-300 bg-transparent text-foreground text-base focus:outline-none focus:ring-2 focus:ring-[#a78bfa] disabled:opacity-50"
          />

          {erro && (
            <div className="mt-4 p-4 bg-red-100 border border-red-200 text-red-800 rounded-lg text-sm font-medium">
              {erro}
            </div>
          )}

          {sucesso && (
            <div className="mt-4 p-4 bg-green-100 border border-green-200 text-green-800 rounded-lg text-sm font-medium">
              {sucesso}
            </div>
          )}

          <p className="mt-4 text-xs text-muted-foreground">
            Pressione a tecla <strong>Enter</strong> ou clique no botão abaixo
            para processar.
          </p>

          <button
            onClick={handleBuscar}
            disabled={!!confirmacao?.mostrar}
            className="mt-6 w-full h-12 bg-primary text-primary-foreground text-base font-semibold rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            Buscar Itens Emprestados
          </button>
        </div>

        {confirmacao?.mostrar && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-2xl max-w-md w-full overflow-hidden border border-gray-200 animate-fade-in">
              <div className="p-6">
                <h2 className="text-xl font-bold text-gray-900 text-center mb-1">
                  Confirmar Devolução
                </h2>
                <p className="text-sm text-gray-500 text-center mb-6">
                  Selecione os itens que estão sendo devolvidos:
                </p>

                <div className="space-y-2 mb-8 max-h-[40vh] overflow-y-auto">
                  {confirmacao.items?.map((item: any) => (
                    <label
                      key={item.id}
                      className={`flex items-center gap-3 p-3 rounded-md border cursor-pointer transition-colors ${
                        itensSelecionados.includes(item.id)
                          ? 'bg-green-50 border-green-200'
                          : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={itensSelecionados.includes(item.id)}
                        onChange={() => toggleItem(item.id)}
                        className="w-5 h-5 accent-green-600 rounded border-gray-300"
                      />
                      <div className="flex-1">
                        <p className="text-sm font-bold text-gray-900 leading-tight">
                          {item.name}
                        </p>
                        {item.possuidorNome && (
                          <p className="text-xs text-gray-500 mt-0.5">
                            Com: {item.possuidorNome}
                          </p>
                        )}
                      </div>
                      {item.type === 'KEY' ? (
                        <KeyRound className="w-5 h-5 text-gray-500" />
                      ) : (
                        <Package className="w-5 h-5 text-gray-500" />
                      )}
                    </label>
                  ))}
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={handleCancelar}
                    className="flex-1 h-11 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50 font-medium transition-colors text-sm"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={() => handleConfirmar(itensSelecionados)}
                    disabled={itensSelecionados.length === 0}
                    className="flex-1 h-11 rounded-md bg-green-600 hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium transition-colors text-sm"
                  >
                    Confirmar Devolução
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
