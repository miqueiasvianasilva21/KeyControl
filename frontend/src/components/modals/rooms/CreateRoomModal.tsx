import React, { useState } from 'react';
import { Package } from 'lucide-react';
import { useRooms } from '../../../providers/RoomProvider';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  Label,
  Input,
  Button,
} from '../../components';

const API_URL =
  (import.meta as unknown as { env: { VITE_API_URL?: string } }).env
    ?.VITE_API_URL || 'http://localhost:3000';

export function CreateRoomModal() {
  const { modalCriarAberto, setModalCriarAberto, carregarDados } = useRooms();

  const [nome, setNome] = useState('');
  const [numero, setNumero] = useState('');
  const [bloco, setBloco] = useState('');
  const [possuiKit, setPossuiKit] = useState(true);

  const handleSalvarNovaSala = async () => {
    if (!nome || !numero || !bloco)
      return alert('Por favor, preencha todos os campos.');

    try {
      const res = await fetch(`${API_URL}/rooms`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          name: nome,
          number: numero,
          block: bloco,
          itemsOption: possuiKit ? 'KEY_AND_KIT' : 'KEY_ONLY',
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        alert(
          errorData.error || 'Erro interno do servidor ao tentar criar a sala.',
        );
        return;
      }

      carregarDados();
      setModalCriarAberto(false);
      setNome('');
      setNumero('');
      setBloco('');
      setPossuiKit(true);
    } catch (error) {
      console.error(error);
      alert('Erro de conexão ao tentar criar sala.');
    }
  };

  return (
    <Dialog open={modalCriarAberto} onOpenChange={setModalCriarAberto}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Criar Nova Sala</DialogTitle>
          <DialogDescription>Preencha os dados da nova sala</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="nome-sala">Nome da Sala</Label>
            <Input
              id="nome-sala"
              type="text"
              placeholder="Ex: Sala 101"
              value={nome}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setNome(e.target.value)
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="numero-sala">Número</Label>
            <Input
              id="numero-sala"
              type="text"
              placeholder="Ex: 101"
              value={numero}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setNumero(e.target.value)
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="bloco-sala">Bloco</Label>
            <Input
              id="bloco-sala"
              type="text"
              placeholder="Ex:3"
              value={bloco}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setBloco(e.target.value)
              }
            />
          </div>
          <div className="space-y-2">
            <Label>Kit</Label>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setPossuiKit(true)}
                className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-lg border-2 transition-colors ${
                  possuiKit
                    ? 'border-[#a78bfa] bg-[#a78bfa]/10 text-[#7c3aed]'
                    : 'border-gray-200 text-gray-500 hover:bg-gray-50'
                }`}
              >
                <Package className="w-4 h-4" />
                <span className="font-medium text-sm">Possui kit</span>
              </button>
              <button
                type="button"
                onClick={() => setPossuiKit(false)}
                className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-lg border-2 transition-colors ${
                  !possuiKit
                    ? 'border-gray-500 bg-gray-50 text-gray-700'
                    : 'border-gray-200 text-gray-400 hover:bg-gray-50'
                }`}
              >
                <span className="font-medium text-sm">Sem kit</span>
              </button>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setModalCriarAberto(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSalvarNovaSala}>Criar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export const ModalCriarSala = CreateRoomModal;
