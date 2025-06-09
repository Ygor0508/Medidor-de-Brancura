// import { WhitekonRegisters, CalibrationCommands, ControlModes } from "./whitekon-registers";

// export interface WhitekonData {
//   brancura: { media: number | null; online: number | null; desvio_padrao: number | null };
//   temperatura: { calibracao: number | null; online: number | null };
//   rgb: { red: number | null; green: number | null; blue: number | null; clear: number | null };
//   blue_calibracao: { preto: number | null; branco: number | null };
//   amostras: number | null;
//   alarmes?: number | null;
// }

// export class WhitekonService {
//   private static instance: WhitekonService;
//   private connected = false;
//   private pollingInterval: NodeJS.Timeout | null = null;
//   private data: WhitekonData | null = null;
//   private onDataUpdateCallbacks: ((data: WhitekonData | null) => void)[] = [];
//   private onConnectionStatusChangeCallbacks: ((isConnected: boolean) => void)[] = [];

//   private constructor() {}

//   public static getInstance(): WhitekonService {
//     if (!WhitekonService.instance) {
//       WhitekonService.instance = new WhitekonService();
//     }
//     return WhitekonService.instance;
//   }

//   private notifyConnectionStatusChange(): void {
//     this.onConnectionStatusChangeCallbacks.forEach((callback) => callback(this.connected));
//   }

//   public onConnectionStatusChange(callback: (isConnected: boolean) => void): () => void {
//     this.onConnectionStatusChangeCallbacks.push(callback);
//     return () => {
//       this.onConnectionStatusChangeCallbacks = this.onConnectionStatusChangeCallbacks.filter(
//         (cb) => cb !== callback
//       );
//     };
//   }

//   public async connect(
//     portName: string,
//     baudRateStr: string,
//     addressStr: string,
//     signal?: AbortSignal,
//   ): Promise<boolean> {
//     try {
//       const baudRate = Number.parseInt(baudRateStr, 10);
//       const address = Number.parseInt(addressStr, 10);
//       const url = `/api/whitekon?action=connect&port=${encodeURIComponent(portName)}&baudrate=${baudRate}&unit=${address}`;
//       const response = await fetch(url, { signal });

//       const responseBody = await response.text(); // Ler o corpo uma vez
//       let responseJson;
//       try {
//         responseJson = JSON.parse(responseBody);
//       } catch (e) {
//         console.error("Falha ao parsear JSON da resposta de conexão:", responseBody);
//         throw new Error(`Resposta inválida da API (não JSON): ${response.status} ${response.statusText}`);
//       }

//       if (!response.ok) {
//         const errorMsg = responseJson.error || `Falha na conexão: ${response.status} ${response.statusText}`;
//         const errorDetails = responseJson.details || responseBody;
//         console.error("Erro na resposta da API (connect):", errorMsg, "Detalhes:", errorDetails);
//         throw new Error(errorMsg + (errorDetails ? ` Detalhes: ${errorDetails}`: ""));
//       }
      
//       this.connected = responseJson.status === "connected";

//       if (this.connected) {
//         this.startPolling();
//       } else {
//         this.data = null; // Limpa dados se a conexão falhar
//         this.notifyDataUpdate();
//       }
//       this.notifyConnectionStatusChange();
//       return this.connected;
//     } catch (error: any) {
//       console.error("Erro ao conectar (WhitekonService):", error.message);
//       this.connected = false;
//       this.data = null;
//       this.notifyDataUpdate();
//       this.notifyConnectionStatusChange();
//       throw error; 
//     }
//   }

//   public async disconnect(): Promise<boolean> {
//     try {
//       this.stopPolling();
//       const response = await fetch("/api/whitekon?action=disconnect");
//       const data = await response.json();
//       this.connected = !(data.status === "disconnected");
      
//       if (!this.connected) { // Se realmente desconectou
//         this.data = null; 
//       }
//       this.notifyDataUpdate();
//       this.notifyConnectionStatusChange();
//       return !this.connected; // Retorna true se desconexão bem sucedida (this.connected é false)
//     } catch (error) {
//       console.error("Erro ao desconectar (WhitekonService):", error);
//       // Não mudar o estado de connected aqui, pois a API pode ter falhado mas o estado anterior era connected
//       // this.notifyConnectionStatusChange(); // O estado não mudou
//       return false; // Indica falha na operação de desconexão
//     }
//   }

//   public isConnected(): boolean {
//     return this.connected;
//   }

//   public async checkConnectionStatus(): Promise<boolean> {
//     try {
//       const response = await fetch("/api/whitekon?action=status");
//       const data = await response.json();
//       const serverReportedConnected = data.connected;

//       if (this.connected !== serverReportedConnected) {
//           console.log(`WhitekonService: Status da conexão alterado pelo servidor. Anterior: ${this.connected}, Novo: ${serverReportedConnected}`);
//           this.connected = serverReportedConnected;
//           this.notifyConnectionStatusChange();
//       }
      
//       if (!this.connected) {
//         this.stopPolling();
//         this.data = null; // Limpar dados se o status retornar desconectado
//         this.notifyDataUpdate();
//       } else if (this.connected && !this.pollingInterval) {
//         this.startPolling();
//       }
//       return this.connected;
//     } catch (error) {
//       console.error("Erro ao verificar status da conexão (WhitekonService):", error);
//       if (this.connected) { // Se estava conectado e a verificação falhou
//         this.connected = false;
//         this.notifyConnectionStatusChange();
//       }
//       this.data = null;
//       this.stopPolling();
//       this.notifyDataUpdate();
//       return false;
//     }
//   }

//   private startPolling(interval = 2500): void { // Intervalo um pouco maior
//     if (this.pollingInterval) {
//       clearInterval(this.pollingInterval);
//     }
//     console.log("WhitekonService: Iniciando polling de dados...");
//     this.pollingInterval = setInterval(async () => {
//       if (!this.connected) {
//         console.warn("WhitekonService: Polling pulado, não conectado.");
//         // Poderia tentar um checkConnectionStatus aqui periodicamente em vez de parar totalmente
//         // this.stopPolling(); // Não para mais, para que o checkConnectionStatus possa reativá-lo
//         return;
//       }

//       try {
//         const response = await fetch("/api/whitekon?action=data");
//         const responseBody = await response.text();
//         let responseJson;
//         try {
//             responseJson = JSON.parse(responseBody);
//         } catch(e) {
//             console.error("WhitekonService: Falha ao parsear JSON da resposta de dados (polling):", responseBody);
//             // Considerar isso como uma falha de conexão temporária, mas não parar o polling imediatamente.
//             // Poderia implementar um contador de falhas antes de parar.
//             return;
//         }

//         if (!response.ok) {
//             const errorMsg = responseJson.error || `Falha ao obter dados (HTTP ${response.status})`;
//             const errorDetails = responseJson.details || responseBody;
//             console.error("WhitekonService: Erro na API ao obter dados (polling):", errorMsg, "Detalhes:", errorDetails);
//             // Se o erro indicar desconexão (ex: "Dispositivo não está conectado...")
//             if (errorMsg.includes("Dispositivo não está conectado") || response.status === 400) {
//                 console.warn("WhitekonService: Polling detectou desconexão, parando polling e atualizando status.");
//                 this.connected = false;
//                 this.notifyConnectionStatusChange();
//                 this.stopPolling(); // Para o polling se o servidor diz que não está conectado
//                 this.data = null; // Limpa os dados
//                 this.notifyDataUpdate();
//             }
//             return;
//         }
        
//         if (responseJson.error) {
//           console.error("WhitekonService: Erro nos dados recebidos (polling):", responseJson.error, "Detalhes:", responseJson.details);
//           return;
//         }
        
//         this.data = responseJson;
//         this.notifyDataUpdate();

//       } catch (error: any) {
//         console.error("WhitekonService: Erro crítico durante polling (fetch ou processamento):", error.message);
//         // Erros de rede podem acontecer. Não necessariamente define como desconectado imediatamente.
//       }
//     }, interval);
//   }

//   private stopPolling(): void {
//     if (this.pollingInterval) {
//       console.log("WhitekonService: Polling de dados parado.");
//       clearInterval(this.pollingInterval);
//       this.pollingInterval = null;
//     }
//   }

//   private notifyDataUpdate(): void {
//     this.onDataUpdateCallbacks.forEach((callback) => callback(this.data));
//   }

//   public onDataUpdate(callback: (data: WhitekonData | null) => void): () => void {
//     this.onDataUpdateCallbacks.push(callback);
//     return () => {
//       this.onDataUpdateCallbacks = this.onDataUpdateCallbacks.filter((cb) => cb !== callback);
//     };
//   }

//   public getData(): WhitekonData | null {
//     return this.data;
//   }

//   public async setOperationMode(mode: number): Promise<boolean> {
//     return this.writeRegister(WhitekonRegisters.MODO_OPERACAO, mode);
//   }

//   public async calibrateDark(): Promise<boolean> {
//     return this.writeRegister(WhitekonRegisters.COMANDOS_CALIBRACAO, CalibrationCommands.CALIBRA_ESCURO);
//   }

//   public async calibrateWhite(): Promise<boolean> {
//     return this.writeRegister(WhitekonRegisters.COMANDOS_CALIBRACAO, CalibrationCommands.CALIBRA_CLARO);
//   }

//   public async setAutoMode(auto: boolean): Promise<boolean> {
//     return this.writeRegister(WhitekonRegisters.AUTOMATICO_MANUAL, auto ? ControlModes.AUTOMATICO : ControlModes.MANUAL);
//   }

//   public async setIntegrationTime(timeCode: number): Promise<boolean> {
//     const valueToWrite = (timeCode & 0xFF) << 8; 
//     return this.writeRegister(WhitekonRegisters.TEMPO_INTEGRACAO_E_GANHO, valueToWrite);
//   }

//   public async setGain(gainCode: number): Promise<boolean> {
//     const valueToWrite = gainCode & 0xFF; 
//     return this.writeRegister(WhitekonRegisters.TEMPO_INTEGRACAO_E_GANHO, valueToWrite);
//   }

//   public async setBrightnessLimits(min: number, max: number): Promise<boolean> {
//     const minResult = await this.writeRegister(WhitekonRegisters.BRANCURA_MINIMA, Math.round(min * 10));
//     if (!minResult) return false;
//     const maxResult = await this.writeRegister(WhitekonRegisters.BRANCURA_MAXIMA, Math.round(max * 10));
//     return maxResult;
//   }

//   public async setOffset(offset: number): Promise<boolean> {
//     return this.writeRegister(WhitekonRegisters.OFFSET, Math.round(offset * 10));
//   }

//   // Tornado público para ser chamado pelo registers-tab, conforme erro reportado
//   public async writeRegister(register: number, value: number): Promise<boolean> {
//     if (!this.connected) {
//       console.error("WhitekonService: Não conectado, escrita no registro falhou.");
//       // Adicionalmente, pode-se tentar uma verificação de status aqui
//       // const stillConnected = await this.checkConnectionStatus();
//       // if (!stillConnected) return false;
//       // Se checkConnectionStatus não for chamado aqui, o erro "Não conectado" será o feedback.
//       return false;
//     }

//     try {
//       const response = await fetch("/api/whitekon", {
//         method: "POST",
//         headers: { "Content-Type": "application/json", },
//         body: JSON.stringify({ register, value }),
//       });

//       const responseBody = await response.text();
//       let responseJson;
//       try {
//         responseJson = JSON.parse(responseBody);
//       } catch (e) {
//         console.error(`WhitekonService: Falha ao parsear JSON da escrita no registro ${register}:`, responseBody);
//         throw new Error(`Resposta inválida da API (escrita): ${response.status} ${response.statusText}`);
//       }

//       if (!response.ok) {
//         const errorMsg = responseJson.error || `Erro HTTP ${response.status} ao escrever no registro ${register}`;
//         const errorDetails = responseJson.details || responseBody;
//         console.error(`WhitekonService: Erro da API ao escrever no registro ${register}:`, errorMsg, "Detalhes:", errorDetails);
//         throw new Error(errorMsg + (errorDetails ? ` Detalhes: ${errorDetails}`: ""));
//       }
      
//       return responseJson.success === true;
//     } catch (error: any) {
//       console.error(`WhitekonService: Erro ao escrever no registro ${register}:`, error.message);
//       return false;
//     }
//   }
// }

import { WhitekonRegisters, CalibrationCommands, ControlModes } from "./whitekon-registers";

export interface WhitekonData {
  brancura: { media: number | null; online: number | null; desvio_padrao: number | null };
  temperatura: { calibracao: number | null; online: number | null };
  rgb: { red: number | null; green: number | null; blue: number | null; clear: number | null };
  blue_calibracao: { preto: number | null; branco: number | null };
  amostras: number | null;
  alarmes?: number | null;
}

export class WhitekonService {
  private static instance: WhitekonService;
  private connected = false;
  private pollingInterval: NodeJS.Timeout | null = null;
  private data: WhitekonData | null = null;
  private onDataUpdateCallbacks: ((data: WhitekonData | null) => void)[] = [];
  private onConnectionStatusChangeCallbacks: ((isConnected: boolean) => void)[] = [];

  private constructor() {}

  public static getInstance(): WhitekonService {
    if (!WhitekonService.instance) {
      WhitekonService.instance = new WhitekonService();
    }
    return WhitekonService.instance;
  }

  private notifyConnectionStatusChange(): void {
    this.onConnectionStatusChangeCallbacks.forEach((callback) => callback(this.connected));
  }

  public onConnectionStatusChange(callback: (isConnected: boolean) => void): () => void {
    this.onConnectionStatusChangeCallbacks.push(callback);
    return () => {
      this.onConnectionStatusChangeCallbacks = this.onConnectionStatusChangeCallbacks.filter(
        (cb) => cb !== callback
      );
    };
  }

  public async connect(
    portName: string,
    baudRateStr: string,
    addressStr: string,
    signal?: AbortSignal,
  ): Promise<boolean> {
    console.log(`WhitekonService: Tentando conectar a ${portName}...`);
    try {
      const baudRate = Number.parseInt(baudRateStr, 10);
      const address = Number.parseInt(addressStr, 10);
      const url = `/api/whitekon?action=connect&port=${encodeURIComponent(portName)}&baudrate=${baudRate}&unit=${address}`;
      const response = await fetch(url, { signal });

      const responseBody = await response.text();
      let responseJson;
      try {
        responseJson = JSON.parse(responseBody);
      } catch (e) {
        console.error("WhitekonService: Falha ao parsear JSON da resposta de conexão:", responseBody);
        throw new Error(`Resposta inválida da API (connect - não JSON): ${response.status} ${response.statusText}. Resposta: ${responseBody.substring(0,200)}`);
      }

      if (!response.ok) {
        const errorMsg = responseJson.error || `Falha na conexão: ${response.status} ${response.statusText}`;
        const errorDetails = responseJson.details || responseBody;
        console.error("WhitekonService: Erro na API (connect):", errorMsg, "Detalhes:", errorDetails);
        this.connected = false; // Garante que está false
        this.notifyConnectionStatusChange();
        throw new Error(errorMsg + (errorDetails ? ` Detalhes: ${errorDetails}`: ""));
      }
      
      this.connected = responseJson.status === "connected";
      console.log(`WhitekonService: Conexão ${this.connected ? 'bem-sucedida' : 'falhou'}. Mensagem API: ${responseJson.message}`);


      if (this.connected) {
        this.startPolling();
      } else {
        this.data = null; 
        this.notifyDataUpdate();
      }
      this.notifyConnectionStatusChange();
      return this.connected;
    } catch (error: any) {
      console.error("WhitekonService: Exceção ao conectar:", error.message);
      this.connected = false;
      this.data = null;
      this.notifyDataUpdate();
      this.notifyConnectionStatusChange();
      throw error; 
    }
  }

  public async disconnect(): Promise<boolean> {
    console.log("WhitekonService: Tentando desconectar...");
    try {
      this.stopPolling();
      const response = await fetch("/api/whitekon?action=disconnect");
      const data = await response.json();
      
      // API retorna { status: "disconnected" } em sucesso.
      const successfullyDisconnected = data.status === "disconnected";
      this.connected = !successfullyDisconnected; // connected será false se desconectado com sucesso
      
      console.log(`WhitekonService: Desconexão ${successfullyDisconnected ? 'bem-sucedida' : 'falhou na API'}. Novo estado connected: ${this.connected}`);

      if (successfullyDisconnected) {
        this.data = null; 
      }
      this.notifyDataUpdate();
      this.notifyConnectionStatusChange();
      return successfullyDisconnected; 
    } catch (error: any) {
      console.error("WhitekonService: Exceção ao desconectar:", error.message);
      // Se a chamada à API falhar, o estado de 'connected' não deve mudar assumindo que ainda está conectado
      // this.notifyConnectionStatusChange(); // Não notifica se o estado não mudou
      return false; // Indica falha na operação de desconexão
    }
  }

  public isConnected(): boolean {
    return this.connected;
  }

  public async checkConnectionStatus(): Promise<boolean> {
    console.log("WhitekonService: Verificando status da conexão...");
    try {
      const response = await fetch("/api/whitekon?action=status");
      const data = await response.json();
      const serverReportedConnected = !!data.connected; // Garante que é booleano

      if (this.connected !== serverReportedConnected) {
          console.log(`WhitekonService: Status da conexão alterado. Anterior: ${this.connected}, Novo (servidor): ${serverReportedConnected}`);
          this.connected = serverReportedConnected;
          this.notifyConnectionStatusChange();
      }
      
      if (!this.connected) {
        this.stopPolling();
        // Não limpar dados aqui, para o usuário ver a última leitura válida se a conexão cair
        // this.data = null; 
        // this.notifyDataUpdate();
      } else if (this.connected && !this.pollingInterval) {
        console.log("WhitekonService: Conectado, mas polling inativo. Reiniciando polling.");
        this.startPolling();
      }
      console.log(`WhitekonService: Status da conexão verificado: ${this.connected}`);
      return this.connected;
    } catch (error: any) {
      console.error("WhitekonService: Exceção ao verificar status:", error.message);
      if (this.connected) { // Se estava conectado e a verificação falhou (ex: API caiu)
        this.connected = false;
        this.notifyConnectionStatusChange();
        this.stopPolling(); // Para o polling se não conseguir verificar o status
      }
      // this.data = null; // Não limpar dados
      // this.notifyDataUpdate();
      return false;
    }
  }

  private startPolling(interval = 2500): void {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
    }
    if (!this.connected) { // Checagem extra antes de iniciar
        console.warn("WhitekonService: Tentativa de iniciar polling enquanto desconectado. Ignorado.");
        return;
    }
    console.log("WhitekonService: Iniciando polling de dados...");
    this.pollingInterval = setInterval(async () => {
      if (!this.connected) { // Verifica a cada ciclo do intervalo
        console.warn("WhitekonService: Polling interrompido, dispositivo desconectado.");
        this.stopPolling(); 
        return;
      }

      try {
        const response = await fetch("/api/whitekon?action=data");
        const responseBody = await response.text();
        let responseJson;
        try {
            responseJson = JSON.parse(responseBody);
        } catch(e) {
            console.error("WhitekonService: Polling - Falha ao parsear JSON da API de dados:", responseBody.substring(0,200));
            // Considerar uma falha temporária, não necessariamente desconexão total
            return; 
        }

        if (!response.ok) {
            const errorMsg = responseJson.error || `Falha ao obter dados (HTTP ${response.status})`;
            const errorDetails = responseJson.details || responseBody;
            console.error("WhitekonService: Polling - Erro na API ao obter dados:", errorMsg, "Detalhes:", errorDetails);
            if (errorMsg.includes("Dispositivo não está conectado") || response.status === 400 || response.status === 404) {
                console.warn("WhitekonService: Polling detectou desconexão, parando polling e atualizando status.");
                this.connected = false;
                this.notifyConnectionStatusChange();
                this.stopPolling();
            }
            return;
        }
        
        if (responseJson.error) {
          console.error("WhitekonService: Polling - Erro nos dados recebidos:", responseJson.error, "Detalhes:", responseJson.details);
          return;
        }
        
        this.data = responseJson;
        this.notifyDataUpdate();

      } catch (error: any) {
        console.error("WhitekonService: Polling - Exceção crítica:", error.message);
        // Em caso de erro de fetch (rede), pode ser uma falha temporária.
        // Poderia adicionar um contador de falhas antes de declarar desconexão total.
      }
    }, interval);
  }

  private stopPolling(): void {
    if (this.pollingInterval) {
      console.log("WhitekonService: Polling de dados efetivamente parado.");
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
    }
  }

  private notifyDataUpdate(): void {
    this.onDataUpdateCallbacks.forEach((callback) => callback(this.data));
  }

  public onDataUpdate(callback: (data: WhitekonData | null) => void): () => void {
    this.onDataUpdateCallbacks.push(callback);
    return () => {
      this.onDataUpdateCallbacks = this.onDataUpdateCallbacks.filter((cb) => cb !== callback);
    };
  }

  public getData(): WhitekonData | null {
    return this.data;
  }

  public async readSingleRegister(register: number): Promise<number | null> {
    if (!this.connected) {
      console.warn(`WhitekonService: Tentativa de ler registro ${register} enquanto desconectado.`);
      // Tenta verificar o status, pode reativar a conexão se possível
      // const stillConnected = await this.checkConnectionStatus();
      // if (!stillConnected) return null;
      // Se não checar, simplesmente retorna null ou lança erro
      return null;
    }
    try {
      const response = await fetch(`/api/whitekon?action=data&register=${register}`);
      const responseBody = await response.text();
      let data;
      try {
        data = JSON.parse(responseBody);
      } catch(e){
        throw new Error(`Resposta inválida da API (leitura reg ${register}, não JSON): ${responseBody.substring(0,100)}`);
      }

      if (!response.ok || data.error) {
        const errorMsg = data.error || `Erro HTTP ${response.status} ao ler registro ${register}`;
        const errorDetails = data.details || "";
        throw new Error(errorMsg + (errorDetails ? ` Detalhes: ${errorDetails}`: ""));
      }
      return typeof data.value === 'number' ? data.value : null;
    } catch (error: any) {
      console.error(`WhitekonService: Exceção ao ler registro ${register}:`, error.message);
      return null;
    }
  }
  
  public async setLedState(turnOn: boolean): Promise<boolean> {
    const valueToWrite = turnOn ? 1 : 0; // Bit 0 para LED
    // Para preservar outros bits (ex: bobina no bit 1), seria necessário Ler-Modificar-Escrever
    // Ex: const currentRemoteCtrl = await this.readSingleRegister(WhitekonRegisters.CONTROLE_REMOTO);
    //     if (currentRemoteCtrl === null) return false;
    //     const newRemoteCtrl = turnOn ? (currentRemoteCtrl | 0x01) : (currentRemoteCtrl & ~0x01);
    //     return this.writeRegister(WhitekonRegisters.CONTROLE_REMOTO, newRemoteCtrl);
    return this.writeRegister(WhitekonRegisters.CONTROLE_REMOTO, valueToWrite);
  }

  // Métodos de escrita delegados para o writeRegister público
  public async setOperationMode(mode: number): Promise<boolean> { return this.writeRegister(WhitekonRegisters.MODO_OPERACAO, mode); }
  public async calibrateDark(): Promise<boolean> { return this.writeRegister(WhitekonRegisters.COMANDOS_CALIBRACAO, CalibrationCommands.CALIBRA_ESCURO); }
  public async calibrateWhite(): Promise<boolean> { return this.writeRegister(WhitekonRegisters.COMANDOS_CALIBRACAO, CalibrationCommands.CALIBRA_CLARO); }
  public async setAutoMode(auto: boolean): Promise<boolean> { return this.writeRegister(WhitekonRegisters.AUTOMATICO_MANUAL, auto ? ControlModes.AUTOMATICO : ControlModes.MANUAL); }
  public async setIntegrationTime(timeCode: number): Promise<boolean> { return this.writeRegister(WhitekonRegisters.TEMPO_INTEGRACAO_E_GANHO, (timeCode & 0xFF) << 8); } // Simplificado, pode precisar ler ganho atual
  public async setGain(gainCode: number): Promise<boolean> { return this.writeRegister(WhitekonRegisters.TEMPO_INTEGRACAO_E_GANHO, gainCode & 0xFF); } // Simplificado, pode precisar ler tempo atual
  public async setOffset(offset: number): Promise<boolean> { return this.writeRegister(WhitekonRegisters.OFFSET, Math.round(offset * 10)); }
  public async setBrightnessLimits(min: number, max: number): Promise<boolean> {
    const minResult = await this.writeRegister(WhitekonRegisters.BRANCURA_MINIMA, Math.round(min * 10));
    if (!minResult) return false;
    return this.writeRegister(WhitekonRegisters.BRANCURA_MAXIMA, Math.round(max * 10));
  }

  public async writeRegister(register: number, value: number): Promise<boolean> {
    if (!this.connected) {
      console.error("WhitekonService: Não conectado, escrita no registro falhou.");
      // const stillConnected = await this.checkConnectionStatus(); // Opcional: tentar verificar
      // if (!stillConnected) return false;
      return false;
    }

    try {
      const response = await fetch("/api/whitekon", {
        method: "POST",
        headers: { "Content-Type": "application/json", },
        body: JSON.stringify({ register, value }),
      });

      const responseBody = await response.text();
      let responseJson;
      try {
        responseJson = JSON.parse(responseBody);
      } catch (e) {
        throw new Error(`Resposta inválida da API (escrita reg ${register}, não JSON): ${responseBody.substring(0,100)}`);
      }

      if (!response.ok) {
        const errorMsg = responseJson.error || `Erro HTTP ${response.status} ao escrever no registro ${register}`;
        const errorDetails = responseJson.details || "";
        throw new Error(errorMsg + (errorDetails ? ` Detalhes: ${errorDetails}`: ""));
      }
      
      return responseJson.success === true;
    } catch (error: any) {
      console.error(`WhitekonService: Exceção ao escrever no registro ${register}:`, error.message);
      toast({ // Adicionando toast aqui para erros de escrita
        title: `Erro ao escrever Reg ${register}`,
        description: error.message,
        variant: "destructive",
      });
      return false;
    }
  }
}

// Expor globalmente para depuração no console do navegador, se necessário
// (window as any).whitekonService = WhitekonService.getInstance();
// (Lembre-se de remover ou comentar isso em produção)

// Hook para usar toast fora de componentes React (dentro do serviço)
// Esta é uma forma mais avançada e pode exigir um gerenciador de estado global ou event emitter.
// Por simplicidade, chamadas de toast diretas foram adicionadas no writeRegister.
// Para um sistema mais robusto, o serviço emitiria eventos e os componentes reagiriam.
let toastFunction: (options: any) => void = () => {}; 
export const setToastInstance = (toastFn: (options: any) => void) => {
    toastFunction = toastFn;
}
const toast = (options: any) => {
    if(typeof window !== "undefined" && toastFunction) { // Garante que só roda no cliente
        toastFunction(options);
    } else {
        console.log("Toast (server/no-instance):", options.title, options.description);
    }
}