// "use client"

// import { useState, useEffect } from "react"
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
// import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
// import { Input } from "@/components/ui/input"
// import { Button } from "@/components/ui/button"
// import { useToast } from "@/hooks/use-toast"
// import { WhitekonService } from "@/lib/whitekon-service"

// interface RegistersTabProps {
//   whitekonId: number
// }

// const TOTAL_REGISTERS = 57; 
// const READ_BLOCK_DELAY_MS = 250; // Aumentado o atraso entre leituras de bloco

// const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// export function RegistersTab({ whitekonId }: RegistersTabProps) {
//   const [registers, setRegisters] = useState<Array<{ address: number; value: string }>>(
//     Array.from({ length: TOTAL_REGISTERS }, (_, i) => ({ address: i, value: "---" }))
//   );
//   const [editingRegister, setEditingRegister] = useState<number | null>(null);
//   const [editValue, setEditValue] = useState("");
//   const [isLoading, setIsLoading] = useState(false);
//   const { toast } = useToast();
//   const whitekonService = WhitekonService.getInstance();

//   useEffect(() => {
//     setRegisters(Array.from({ length: TOTAL_REGISTERS }, (_, i) => ({ address: i, value: "---" })));
//   }, [whitekonId]);

//   // Efeito para reagir a mudanças no estado de conexão do serviço
//   useEffect(() => {
//     const handleConnectionChange = (isConnected: boolean) => {
//         if (!isConnected) {
//             // Se desconectado, reseta os valores dos registradores para "---"
//             // e talvez desabilite botões ou mostre um aviso.
//             setRegisters(Array.from({ length: TOTAL_REGISTERS }, (_, i) => ({ address: i, value: "---" })));
//             toast({ title: "Desconectado", description: "A conexão com o dispositivo foi perdida.", variant: "destructive" });
//         }
//     };
//     const unsubscribe = whitekonService.onConnectionStatusChange(handleConnectionChange);
//     return () => unsubscribe();
//   }, []);


//   const handleReadRegister = async (address: number) => {
//     if (!whitekonService.isConnected()) {
//         toast({ title: "Desconectado", description: "Por favor, conecte ao dispositivo primeiro.", variant: "destructive" });
//         setIsLoading(false); // Garante que isLoading seja resetado
//         return;
//     }
//     setIsLoading(true);
//     try {
//       const response = await fetch(`/api/whitekon?action=data&register=${address}`); 
//       const responseBody = await response.text();
//       let data;
//       try {
//           data = JSON.parse(responseBody);
//       } catch (e) {
//           throw new Error(`Resposta inválida da API (leitura única, não JSON): ${responseBody.substring(0,100)}`);
//       }

//       if (!response.ok || data.error) {
//         const errorMsg = data.error || `Erro HTTP ${response.status} ao ler registro ${address}`;
//         const errorDetails = data.details || "";
//         throw new Error(errorMsg + (errorDetails ? ` Detalhes: ${errorDetails}`: ""));
//       }
      
//       const value = data.value !== undefined ? data.value.toString() : "---";
//       setRegisters((prev) => prev.map((reg) => (reg.address === address ? { ...reg, value } : reg)));
//       toast({ title: "Registro lido", description: `Registro ${address} lido: ${value}` });
//     } catch (error: any) {
//       console.error(`Erro ao ler registro ${address}:`, error);
//       toast({ title: "Erro na leitura", description: error.message || `Não foi possível ler o registro ${address}`, variant: "destructive" });
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const handleStartEdit = (address: number, currentValue: string) => {
//     setEditingRegister(address);
//     setEditValue(currentValue !== "---" ? currentValue : "");
//   };

//   const handleSaveEdit = async () => {
//     if (editingRegister === null) return;
//     if (!whitekonService.isConnected()) {
//         toast({ title: "Desconectado", description: "Por favor, conecte ao dispositivo primeiro.", variant: "destructive" });
//         setIsLoading(false);
//         return;
//     }
//     setIsLoading(true);
//     try {
//       const numericValue = Number(editValue);
//       if (isNaN(numericValue)) {
//         throw new Error("Valor inválido. Digite um número.");
//       }
//       const success = await whitekonService.writeRegister(editingRegister, numericValue); 
      
//       if (success) {
//         setRegisters((prev) => prev.map((reg) => (reg.address === editingRegister ? { ...reg, value: editValue } : reg)));
//         toast({ title: "Registro atualizado", description: `Registro ${editingRegister} atualizado para ${editValue}` });
//         setEditingRegister(null);
//         setEditValue("");
//       } else {
//          throw new Error("Falha ao salvar o registro no dispositivo. Verifique os logs.");
//       }
//     } catch (error: any) {
//       console.error(`Erro ao escrever no registro ${editingRegister}:`, error);
//       toast({ title: "Erro na escrita", description: error.message || `Não foi possível atualizar o registro ${editingRegister}`, variant: "destructive"});
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const handleCancelEdit = () => {
//     setEditingRegister(null);
//     setEditValue("");
//   };

//   const handleReadAllRegisters = async () => {
//     if (!whitekonService.isConnected()) {
//         toast({ title: "Desconectado", description: "Por favor, conecte ao dispositivo primeiro.", variant: "destructive" });
//         setIsLoading(false);
//         return;
//     }
//     setIsLoading(true);
//     toast({ title: "Lendo Registros...", description: "Isso pode levar alguns segundos." });
//     try {
//       const readBlock = async (start: number, count: number): Promise<number[] | null> => {
//         const response = await fetch(`/api/whitekon?action=data&register=${start}&count=${count}`);
//         const responseBody = await response.text(); // Leia o corpo como texto
//         let data;
//         try {
//             data = JSON.parse(responseBody); // Tente analisar como JSON
//         } catch (e) {
//             console.error(`readBlock: Falha ao parsear JSON do bloco ${start}-${start+count-1}:`, responseBody);
//             throw new Error(`Resposta inválida da API (bloco ${start}-${start+count-1}, não JSON): ${responseBody.substring(0, 100)}`);
//         }

//         if (!response.ok || data.error) {
//           const errorMsg = data.error || `Erro HTTP ${response.status} ao ler bloco ${start}-${start + count - 1}`;
//           const errorDetails = data.details || responseBody; // Use responseBody se details não existir
//           console.error(`Erro ao ler bloco ${start}-${start+count-1} da API:`, errorMsg, "Detalhes:", errorDetails);
//           throw new Error(errorMsg + (errorDetails ? ` Detalhes: ${errorDetails}`: ""));
//         }
//         return data.values || null; 
//       };

//       const blockSize = 10; 
//       const updatedRegisters = [...registers];

//       for (let i = 0; i < TOTAL_REGISTERS; i += blockSize) {
//         if (!whitekonService.isConnected()) { // Verifica conexão antes de cada bloco
//             toast({ title: "Leitura Interrompida", description: "Conexão perdida durante a leitura de todos os registros.", variant: "destructive" });
//             throw new Error("Conexão perdida durante a leitura de todos os registros.");
//         }
//         const count = Math.min(blockSize, TOTAL_REGISTERS - i);
//         if (count <= 0) continue;

//         console.log(`Lendo bloco de registros: ${i} a ${i+count-1}`);
//         try {
//             const valuesInBlock = await readBlock(i, count);
            
//             if (valuesInBlock && valuesInBlock.length === count) {
//                 for (let j = 0; j < valuesInBlock.length; j++) {
//                     if (i + j < updatedRegisters.length) {
//                         updatedRegisters[i + j].value = valuesInBlock[j].toString();
//                     }
//                 }
//             } else {
//                 const errMsg = `Bloco ${i}-${i+count-1}: esperado ${count} valores, recebido ${valuesInBlock?.length ?? 'null'}.`;
//                 console.warn(errMsg);
//                 toast({ title: `Aviso no Bloco ${i}-${i+count-1}`, description: errMsg, variant: "default" });
//                 for (let j = 0; j < count; j++) {
//                     if (i + j < updatedRegisters.length) {
//                         updatedRegisters[i + j].value = valuesInBlock?.[j]?.toString() ?? "INV"; // INV para inválido/incompleto
//                     }
//                 }
//             }
//         } catch (blockError: any) {
//             console.error(`Falha ao processar bloco ${i}-${i+count-1}:`, blockError.message);
//             toast({ title: `Erro no Bloco ${i}-${i+count-1}`, description: blockError.message, variant: "destructive" });
//             for (let j = 0; j < count; j++) {
//                 if (i + j < updatedRegisters.length) {
//                     updatedRegisters[i + j].value = "FALHA";
//                 }
//             }
//             // Decide se quer continuar ou parar após um erro de bloco
//             // break; // Para parar imediatamente em caso de erro de bloco
//         }
//         if (i + blockSize < TOTAL_REGISTERS) { // Não atrasa após o último bloco
//             await delay(READ_BLOCK_DELAY_MS); 
//         }
//       }
//       setRegisters(updatedRegisters);
//       toast({ title: "Leitura Concluída", description: "Verifique os valores dos registros. Alguns blocos podem ter falhado." });
//     } catch (error: any) {
//       console.error("Erro geral ao ler todos os registros:", error);
//       toast({ title: "Erro na leitura geral", description: error.message || "Não foi possível ler todos os registros.", variant: "destructive" });
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const registersFirstHalf = registers.slice(0, Math.ceil(TOTAL_REGISTERS / 2));
//   const registersSecondHalf = registers.slice(Math.ceil(TOTAL_REGISTERS / 2));

//   return (
//     <Card>
//       <CardHeader className="flex flex-row items-center justify-between">
//         <CardTitle>Registradores - WhiteKon #{whitekonId}</CardTitle>
//         <Button
//           onClick={handleReadAllRegisters}
//           className="bg-[#00A651] hover:bg-[#008a43] text-white"
//           disabled={isLoading || !whitekonService.isConnected()}
//         >
//           {isLoading ? "Lendo..." : "Ler Todos"}
//         </Button>
//       </CardHeader>
//       <CardContent>
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
//           <Table>
//             <TableHeader>
//               <TableRow>
//                 <TableHead className="w-[120px]">Endereço</TableHead>
//                 <TableHead>Valor</TableHead>
//                 <TableHead className="w-[180px] text-right">Ações</TableHead>
//               </TableRow>
//             </TableHeader>
//             <TableBody>
//               {registersFirstHalf.map((register) => (
//                 <TableRow key={register.address}>
//                   <TableCell className="font-medium text-blue-600">REG {register.address}</TableCell>
//                   <TableCell>
//                     {editingRegister === register.address ? (
//                       <Input
//                         value={editValue}
//                         onChange={(e) => setEditValue(e.target.value)}
//                         className="h-8"
//                       />
//                     ) : (
//                       register.value
//                     )}
//                   </TableCell>
//                   <TableCell className="text-right">
//                     {editingRegister === register.address ? (
//                       <div className="flex space-x-1 justify-end">
//                         <Button size="sm" variant="outline" onClick={handleSaveEdit} disabled={isLoading} className="h-8">
//                           Salvar
//                         </Button>
//                         <Button size="sm" variant="ghost" onClick={handleCancelEdit} disabled={isLoading} className="h-8">
//                           Canc.
//                         </Button>
//                       </div>
//                     ) : (
//                       <div className="flex space-x-1 justify-end">
//                         <Button
//                           size="sm"
//                           variant="outline"
//                           onClick={() => handleReadRegister(register.address)}
//                           disabled={isLoading || !whitekonService.isConnected()}
//                            className="h-8"
//                         >
//                           Ler
//                         </Button>
//                         <Button
//                           size="sm"
//                           variant="outline"
//                           onClick={() => handleStartEdit(register.address, register.value)}
//                           disabled={isLoading || !whitekonService.isConnected()}
//                            className="h-8"
//                         >
//                           Editar
//                         </Button>
//                       </div>
//                     )}
//                   </TableCell>
//                 </TableRow>
//               ))}
//             </TableBody>
//           </Table>

//           <Table>
//             <TableHeader>
//               <TableRow>
//                 <TableHead className="w-[120px]">Endereço</TableHead>
//                 <TableHead>Valor</TableHead>
//                 <TableHead className="w-[180px] text-right">Ações</TableHead>
//               </TableRow>
//             </TableHeader>
//             <TableBody>
//               {registersSecondHalf.map((register) => (
//                  <TableRow key={register.address}>
//                  <TableCell className="font-medium text-blue-600">REG {register.address}</TableCell>
//                  <TableCell>
//                    {editingRegister === register.address ? (
//                      <Input
//                        value={editValue}
//                        onChange={(e) => setEditValue(e.target.value)}
//                        className="h-8"
//                      />
//                    ) : (
//                      register.value
//                    )}
//                  </TableCell>
//                  <TableCell className="text-right">
//                    {editingRegister === register.address ? (
//                      <div className="flex space-x-1 justify-end">
//                        <Button size="sm" variant="outline" onClick={handleSaveEdit} disabled={isLoading} className="h-8">
//                          Salvar
//                        </Button>
//                        <Button size="sm" variant="ghost" onClick={handleCancelEdit} disabled={isLoading} className="h-8">
//                          Canc.
//                        </Button>
//                      </div>
//                    ) : (
//                      <div className="flex space-x-1 justify-end">
//                        <Button
//                          size="sm"
//                          variant="outline"
//                          onClick={() => handleReadRegister(register.address)}
//                          disabled={isLoading || !whitekonService.isConnected()}
//                           className="h-8"
//                        >
//                          Ler
//                        </Button>
//                        <Button
//                          size="sm"
//                          variant="outline"
//                          onClick={() => handleStartEdit(register.address, register.value)}
//                          disabled={isLoading || !whitekonService.isConnected()}
//                           className="h-8"
//                        >
//                          Editar
//                        </Button>
//                      </div>
//                    )}
//                  </TableCell>
//                </TableRow>
//               ))}
//             </TableBody>
//           </Table>
//         </div>
//       </CardContent>
//     </Card>
//   );
// }

"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { WhitekonService, setToastInstance as setGlobalToastTab } from "@/lib/whitekon-service"


interface RegistersTabProps {
  whitekonId: number
}

const TOTAL_REGISTERS = 57; 
const READ_BLOCK_DELAY_MS = 250; 

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export function RegistersTab({ whitekonId }: RegistersTabProps) {
  const [registers, setRegisters] = useState<Array<{ address: number; value: string }>>(
    Array.from({ length: TOTAL_REGISTERS }, (_, i) => ({ address: i, value: "---" }))
  );
  const [editingRegister, setEditingRegister] = useState<number | null>(null);
  const [editValue, setEditValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const whitekonService = WhitekonService.getInstance();

  // Passa a instância do toast para o serviço (se o serviço for usá-la globalmente)
  useEffect(() => {
    setGlobalToastTab(toast); // Se você tiver um setGlobalToast no seu serviço
  }, [toast]);


  useEffect(() => {
    // Função para resetar/limpar os valores quando desconectado ou ID muda
    const resetRegisterValues = () => {
        setRegisters(Array.from({ length: TOTAL_REGISTERS }, (_, i) => ({ address: i, value: "---" })));
    };
    
    resetRegisterValues(); // Reset inicial ou quando whitekonId muda

    const handleConnectionChange = (isConnected: boolean) => {
        if (!isConnected) {
            resetRegisterValues();
            // toast({ title: "Desconectado", description: "Registradores zerados.", variant: "default" });
        }
    };
    const unsubscribe = whitekonService.onConnectionStatusChange(handleConnectionChange);
    return () => unsubscribe();
  }, [whitekonId]); // Adicionado toast aqui para o escopo correto


  const handleReadRegister = async (address: number) => {
    if (!whitekonService.isConnected()) {
        toast({ title: "Desconectado", description: "Por favor, conecte ao dispositivo primeiro.", variant: "destructive" });
        return;
    }
    setIsLoading(true);
    try {
      const response = await fetch(`/api/whitekon?action=data&register=${address}`); 
      const responseBody = await response.text();
      let data;
      try { data = JSON.parse(responseBody); } 
      catch (e) { throw new Error(`Resposta inválida da API (leitura única, não JSON): ${responseBody.substring(0,100)}`); }

      if (!response.ok || data.error) {
        const errorMsg = data.error || `Erro HTTP ${response.status} ao ler registro ${address}`;
        const errorDetails = data.details || "";
        throw new Error(errorMsg + (errorDetails ? ` Detalhes: ${errorDetails}`: ""));
      }
      
      const value = data.value !== undefined ? data.value.toString() : "---";
      setRegisters((prev) => prev.map((reg) => (reg.address === address ? { ...reg, value } : reg)));
      toast({ title: "Registro Lido", description: `Registro ${address} lido: ${value}` });
    } catch (error: any) {
      console.error(`Erro ao ler registro ${address}:`, error);
      toast({ title: "Erro na Leitura", description: error.message || `Não foi possível ler o registro ${address}`, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartEdit = (address: number, currentValue: string) => {
    setEditingRegister(address);
    setEditValue(currentValue !== "---" ? currentValue : "");
  };

  const handleSaveEdit = async () => {
    if (editingRegister === null) return;
    if (!whitekonService.isConnected()) {
        toast({ title: "Desconectado", description: "Por favor, conecte ao dispositivo primeiro.", variant: "destructive" });
        return;
    }
    setIsLoading(true);
    try {
      const numericValue = Number(editValue);
      if (isNaN(numericValue)) { throw new Error("Valor inválido. Digite um número."); }
      
      const success = await whitekonService.writeRegister(editingRegister, numericValue); 
      
      if (success) {
        setRegisters((prev) => prev.map((reg) => (reg.address === editingRegister ? { ...reg, value: editValue } : reg)));
        toast({ title: "Registro Atualizado", description: `Registro ${editingRegister} atualizado para ${editValue}` });
        setEditingRegister(null); setEditValue("");
      } else {
         throw new Error("Falha ao salvar o registro no dispositivo. Verifique os logs do console para detalhes da API.");
      }
    } catch (error: any) {
      console.error(`Erro ao escrever no registro ${editingRegister}:`, error);
      toast({ title: "Erro na Escrita", description: error.message || `Não foi possível atualizar o registro ${editingRegister}`, variant: "destructive"});
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingRegister(null); setEditValue("");
  };

  const handleReadAllRegisters = async () => {
    if (!whitekonService.isConnected()) {
        toast({ title: "Desconectado", description: "Por favor, conecte ao dispositivo primeiro.", variant: "destructive" });
        return;
    }
    setIsLoading(true);
    toast({ title: "Lendo Todos os Registros...", description: "Isso pode levar alguns instantes." });
    let operationSuccess = true;
    try {
      const readBlock = async (start: number, count: number): Promise<number[] | null> => {
        const response = await fetch(`/api/whitekon?action=data&register=${start}&count=${count}`);
        const responseBody = await response.text();
        let data;
        try { data = JSON.parse(responseBody); } 
        catch (e) { throw new Error(`Resposta inválida da API (bloco ${start}-${start+count-1}, não JSON): ${responseBody.substring(0, 100)}`);}

        if (!response.ok || data.error) {
          const errorMsg = data.error || `Erro HTTP ${response.status} ao ler bloco ${start}-${start + count - 1}`;
          const errorDetails = data.details || responseBody;
          throw new Error(errorMsg + (errorDetails ? ` Detalhes: ${errorDetails}`: ""));
        }
        return data.values || null; 
      };

      const blockSize = 10; 
      const updatedRegisters = [...registers];

      for (let i = 0; i < TOTAL_REGISTERS; i += blockSize) {
        if (!whitekonService.isConnected()) {
            toast({ title: "Leitura Interrompida", description: "Conexão perdida.", variant: "destructive" });
            operationSuccess = false;
            break; 
        }
        const count = Math.min(blockSize, TOTAL_REGISTERS - i);
        if (count <= 0) continue;

        console.log(`Lendo bloco de registros: ${i} a ${i+count-1}`);
        try {
            const valuesInBlock = await readBlock(i, count);
            if (valuesInBlock && valuesInBlock.length === count) {
                for (let j = 0; j < valuesInBlock.length; j++) {
                    if (i + j < updatedRegisters.length) { updatedRegisters[i + j].value = valuesInBlock[j].toString(); }
                }
            } else {
                const errMsg = `Bloco ${i}-${i+count-1}: esperado ${count} valores, recebido ${valuesInBlock?.length ?? 'null'}.`;
                console.warn(errMsg);
                toast({ title: `Aviso no Bloco ${i}-${i+count-1}`, description: errMsg, variant: "default" });
                for (let j = 0; j < count; j++) { if (i + j < updatedRegisters.length) { updatedRegisters[i + j].value = "INV"; }}
            }
        } catch (blockError: any) {
            console.error(`Falha ao processar bloco ${i}-${i+count-1}:`, blockError.message);
            toast({ title: `Erro no Bloco ${i}-${i+count-1}`, description: blockError.message, variant: "destructive" });
            for (let j = 0; j < count; j++) { if (i + j < updatedRegisters.length) { updatedRegisters[i + j].value = "FALHA"; }}
            operationSuccess = false; // Marca que houve falha em algum bloco
            // break; // Descomente para parar no primeiro erro de bloco
        }
        if (i + blockSize < TOTAL_REGISTERS) { await delay(READ_BLOCK_DELAY_MS); }
      }
      setRegisters(updatedRegisters);
      if(operationSuccess) {
        toast({ title: "Leitura Concluída", description: "Todos os blocos foram processados." });
      } else {
        toast({ title: "Leitura Concluída com Erros", description: "Alguns blocos podem ter falhado. Verifique os valores.", variant: "default" });
      }
    } catch (error: any) {
      console.error("Erro geral ao ler todos os registros:", error);
      toast({ title: "Erro na Leitura Geral", description: error.message || "Não foi possível ler todos os registros.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const registersFirstHalf = registers.slice(0, Math.ceil(TOTAL_REGISTERS / 2));
  const registersSecondHalf = registers.slice(Math.ceil(TOTAL_REGISTERS / 2));
  const isConnected = whitekonService.isConnected(); // Pega o estado atual da conexão

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Registradores - WhiteKon #{whitekonId}</CardTitle>
        <Button onClick={handleReadAllRegisters} className="bg-[#00A651] hover:bg-[#008a43] text-white" disabled={isLoading || !isConnected}>
          {isLoading ? "Lendo..." : "Ler Todos"}
        </Button>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
          <Table>
            <TableHeader><TableRow><TableHead className="w-[120px]">Endereço</TableHead><TableHead>Valor</TableHead><TableHead className="w-[180px] text-right">Ações</TableHead></TableRow></TableHeader>
            <TableBody>
              {registersFirstHalf.map((register) => (
                <TableRow key={register.address}>
                  <TableCell className="font-medium text-blue-600">REG {register.address}</TableCell>
                  <TableCell>{editingRegister === register.address ? (<Input value={editValue} onChange={(e) => setEditValue(e.target.value)} className="h-8"/>) : (register.value)}</TableCell>
                  <TableCell className="text-right">
                    {editingRegister === register.address ? (
                      <div className="flex space-x-1 justify-end">
                        <Button size="sm" variant="outline" onClick={handleSaveEdit} disabled={isLoading} className="h-8">Salvar</Button>
                        <Button size="sm" variant="ghost" onClick={handleCancelEdit} disabled={isLoading} className="h-8">Canc.</Button>
                      </div>
                    ) : (
                      <div className="flex space-x-1 justify-end">
                        <Button size="sm" variant="outline" onClick={() => handleReadRegister(register.address)} disabled={isLoading || !isConnected} className="h-8">Ler</Button>
                        <Button size="sm" variant="outline" onClick={() => handleStartEdit(register.address, register.value)} disabled={isLoading || !isConnected} className="h-8">Editar</Button>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <Table>
            <TableHeader><TableRow><TableHead className="w-[120px]">Endereço</TableHead><TableHead>Valor</TableHead><TableHead className="w-[180px] text-right">Ações</TableHead></TableRow></TableHeader>
            <TableBody>
              {registersSecondHalf.map((register) => (
                 <TableRow key={register.address}>
                 <TableCell className="font-medium text-blue-600">REG {register.address}</TableCell>
                 <TableCell>{editingRegister === register.address ? (<Input value={editValue} onChange={(e) => setEditValue(e.target.value)} className="h-8"/>) : (register.value)}</TableCell>
                 <TableCell className="text-right">
                   {editingRegister === register.address ? (
                     <div className="flex space-x-1 justify-end">
                       <Button size="sm" variant="outline" onClick={handleSaveEdit} disabled={isLoading} className="h-8">Salvar</Button>
                       <Button size="sm" variant="ghost" onClick={handleCancelEdit} disabled={isLoading} className="h-8">Canc.</Button>
                     </div>
                   ) : (
                     <div className="flex space-x-1 justify-end">
                       <Button size="sm" variant="outline" onClick={() => handleReadRegister(register.address)} disabled={isLoading || !isConnected} className="h-8">Ler</Button>
                       <Button size="sm" variant="outline" onClick={() => handleStartEdit(register.address, register.value)} disabled={isLoading || !isConnected} className="h-8">Editar</Button>
                     </div>
                   )}
                 </TableCell>
               </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}