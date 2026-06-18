import React from "react";
import { KeyRound, Package } from "lucide-react";
import { useReceive } from "../providers/ReceiveProvider";

export function ReceberChave() {
  const {
    codigo, setCodigo, confirmacao, erro, sucesso, porcentagemTempo,
    handleBuscar, handleKeyPress, handleConfirmar, handleCancelar
  } = useReceive();

  return (
    <div className="p-8 bg-gray-50 dark:bg-background min-h-screen">
      <div className="max-w-3xl mx-auto">
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Receber Chave/Kit</h1>
          <p className="text-muted-foreground">Digite o código ou nome do recurso para efetuar a baixa de devolução de forma automática.</p>
        </div>

        {/* Input Card */}
        <div className="bg-card rounded-lg border border-border p-8 shadow-sm bg-white">
          <div className="flex items-center gap-3 mb-4">
            <KeyRound className="w-6 h-6 text-muted-foreground" />
            <Package className="w-6 h-6 text-muted-foreground" />
            <label htmlFor="codigo" className="text-lg font-medium text-foreground">Identificador do Recurso</label>
          </div>

          <input
            id="codigo"
            type="text"
            placeholder="Digite o código (ex: C101) ou nome..."
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

          <p className="mt-4 text-xs text-muted-foreground">Pressione a tecla <strong>Enter</strong> ou clique no botão abaixo para processar.</p>

          <button
            onClick={handleBuscar}
            disabled={!!confirmacao?.mostrar}
            className="mt-6 w-full h-12 bg-primary text-primary-foreground text-base font-semibold rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            Buscar e Validar
          </button>
        </div>

        {/* MODAL DE TEMPORIZADOR DE SEGURANÇA */}
        {confirmacao?.mostrar && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-2xl max-w-md w-full overflow-hidden border border-gray-200 animate-fade-in">
              
              {/* Top Progress Bar */}
              <div className="h-2 bg-gray-100">
                <div
                  className="h-full bg-green-500 transition-all duration-50 ease-linear"
                  style={{ width: `${porcentagemTempo}%` }}
                />
              </div>

              <div className="p-6">
                <div className="flex justify-center mb-4">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                    {confirmacao.item.type === "KEY" ? (
                      <KeyRound className="w-9 h-9 text-green-600" />
                    ) : (
                      <Package className="w-9 h-9 text-green-600" />
                    )}
                  </div>
                </div>

                <h2 className="text-xl font-bold text-gray-900 text-center mb-1">Confirmar Recebimento</h2>
                <p className="text-sm text-gray-500 text-center mb-3">Você está processando o retorno do item:</p>
                
                <div className="bg-gray-50 rounded-md p-3 mb-3 border border-gray-200 text-center">
                  <p className="text-base font-bold text-gray-900 leading-tight">{confirmacao.item.name}</p>
                  <p className="text-xs text-gray-500 font-mono mt-0.5">{confirmacao.item.code}</p>
                </div>

                {confirmacao.item.possuidorNome && (
                  <p className="text-xs text-gray-500 text-center mb-4">
                    Registrado sob custódia de: <strong className="text-gray-900">{confirmacao.item.possuidorNome}</strong>
                  </p>
                )}

                <p className="text-xs text-center text-gray-500 bg-gray-100 py-1.5 rounded mb-6">
                  Confirmação automática em: <span className="font-bold text-gray-900">{Math.ceil(confirmacao.tempoRestante / 1000)}s</span>
                </p>

                <div className="flex gap-3">
                  <button
                    onClick={handleCancelar}
                    className="flex-1 h-11 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50 font-medium transition-colors text-sm"
                  >
                    Interromper
                  </button>
                  <button
                    onClick={handleConfirmar}
                    className="flex-1 h-11 rounded-md bg-green-600 hover:bg-green-700 text-white font-medium transition-colors text-sm"
                  >
                    Confirmar Agora
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