import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import type { TelefoneDto } from "@/modules/factoring/dtos/pessoas";
import { useState } from "react";

interface DataSelectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  dadosEncontrados: {
    enderecos?: Array<{
      cep?: string;
      logradouro?: string;
      numero?: string;
      complemento?: string;
      bairro?: string;
      cidade?: string;
      estado?: string;
    }>;
    emails?: string[];
    telefones?: TelefoneDto[];
  };
  onImportSelected: (dados: {
    enderecoIndex?: number;
    emailIndex?: number;
    telefoneIndices?: number[];
  }) => void;
}

export function DataSelectionDialog({
  open,
  onOpenChange,
  dadosEncontrados,
  onImportSelected,
}: DataSelectionDialogProps) {
  const [selectedEnderecoIndex, setSelectedEnderecoIndex] = useState<
    number | undefined
  >();
  const [selectedEmailIndex, setSelectedEmailIndex] = useState<
    number | undefined
  >();
  const [selectedTelefoneIndices, setSelectedTelefoneIndices] = useState<
    number[]
  >([]);

  const handleTelefoneChange = (index: number, checked: boolean) => {
    setSelectedTelefoneIndices((prev) => {
      if (checked) {
        return [...prev, index];
      }
      return prev.filter((i) => i !== index);
    });
  };

  const handleImport = () => {
    onImportSelected({
      enderecoIndex: selectedEnderecoIndex,
      emailIndex: selectedEmailIndex,
      telefoneIndices:
        selectedTelefoneIndices.length > 0
          ? selectedTelefoneIndices
          : undefined,
    });
    onOpenChange(false);
    // Reset selections
    setSelectedEnderecoIndex(undefined);
    setSelectedEmailIndex(undefined);
    setSelectedTelefoneIndices([]);
  };

  const handleCancel = () => {
    onOpenChange(false);
    // Reset selections
    setSelectedEnderecoIndex(undefined);
    setSelectedEmailIndex(undefined);
    setSelectedTelefoneIndices([]);
  };

  const hasEnderecoData =
    dadosEncontrados.enderecos && dadosEncontrados.enderecos.length > 0;

  const hasEmailData =
    dadosEncontrados.emails && dadosEncontrados.emails.length > 0;
  const hasTelefonesData =
    dadosEncontrados.telefones && dadosEncontrados.telefones.length > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full mx-auto">
        <DialogHeader>
          <DialogTitle>Dados Encontrados na Consulta</DialogTitle>
          <DialogDescription>
            Os dados pessoais foram preenchidos automaticamente. Selecione quais
            informações complementares você deseja importar:
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 min-w-0">
          {hasEnderecoData && (
            <div className="space-y-3 min-w-0">
              <Label className="text-sm font-medium">
                Selecione o Endereço ({dadosEncontrados.enderecos?.length})
              </Label>
              <Select
                value={selectedEnderecoIndex?.toString()}
                onValueChange={(value) =>
                  setSelectedEnderecoIndex(Number.parseInt(value))
                }
              >
                <SelectTrigger className="w-full min-w-0">
                  <SelectValue placeholder="Escolha um endereço" />
                </SelectTrigger>
                <SelectContent className="max-w-[calc(100vw-6rem)]">
                  {dadosEncontrados.enderecos?.map((endereco, index) => (
                    <SelectItem
                      key={`endereco-${index}-${endereco.cep}-${endereco.logradouro}`}
                      value={index.toString()}
                      className="max-w-full"
                    >
                      <div className="text-left truncate">
                        {endereco.logradouro && endereco.numero
                          ? `${endereco.logradouro}, ${endereco.numero}`
                          : endereco.logradouro || "Endereço"}
                        {endereco.bairro && ` - ${endereco.bairro}`}
                        {endereco.cidade && ` - ${endereco.cidade}`}
                        {endereco.cep && ` (${endereco.cep})`}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {hasEmailData && (
            <div className="space-y-3 min-w-0">
              <Label className="text-sm font-medium">
                Selecione o E-mail ({dadosEncontrados.emails?.length})
              </Label>
              <Select
                value={selectedEmailIndex?.toString()}
                onValueChange={(value) =>
                  setSelectedEmailIndex(Number.parseInt(value))
                }
              >
                <SelectTrigger className="w-full min-w-0">
                  <SelectValue placeholder="Escolha um e-mail" />
                </SelectTrigger>
                <SelectContent className="max-w-[calc(100vw-6rem)]">
                  {dadosEncontrados.emails?.map((email, index) => (
                    <SelectItem
                      key={`email-${index}-${email}`}
                      value={index.toString()}
                      className="max-w-full"
                    >
                      <span className="truncate">{email}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {hasTelefonesData && (
            <div className="space-y-3">
              <Label className="text-sm font-medium">
                Selecione os Telefones ({dadosEncontrados.telefones?.length})
              </Label>
              <div className="space-y-2">
                {dadosEncontrados.telefones?.map((telefone, index) => (
                  <div
                    key={telefone.numero}
                    className="flex items-center space-x-2"
                  >
                    <Checkbox
                      id={`telefone-${index}`}
                      checked={selectedTelefoneIndices.includes(index)}
                      onCheckedChange={(checked) =>
                        handleTelefoneChange(index, !!checked)
                      }
                    />
                    <Label
                      htmlFor={`telefone-${index}`}
                      className="text-sm flex-1"
                    >
                      <span className="font-medium">{telefone.numero}</span>
                      {telefone.whatsapp && (
                        <span className="ml-2 text-green-600">WhatsApp</span>
                      )}
                      {telefone.principal && (
                        <span className="ml-2 text-blue-600">Principal</span>
                      )}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          )}

          {!hasEnderecoData && !hasEmailData && !hasTelefonesData && (
            <div className="text-center py-6">
              <p className="text-muted-foreground">
                Nenhum dado complementar foi encontrado na consulta.
              </p>
            </div>
          )}
        </div>

        <Separator />

        <DialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={handleCancel}
            className="w-full sm:w-auto"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleImport}
            disabled={
              selectedEnderecoIndex === undefined &&
              selectedEmailIndex === undefined &&
              selectedTelefoneIndices.length === 0
            }
            className="w-full sm:w-auto"
          >
            Importar Selecionados
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
