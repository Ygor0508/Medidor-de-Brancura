import { WhitekonRegisters, CalibrationCommands, ControlModes } from "./whitekon-registers"

export interface WhitekonData {
  brancura: {
    media: number | null
    online: number | null
    desvio_padrao: number | null
  }
  temperatura: {
    calibracao: number | null
    online: number | null
  }
  rgb: {
    red: number | null
    green: number | null
    blue: number | null
    clear: number | null
  }
  blue_calibracao: {
    preto: number | null
    branco: number | null
  }
  amostras: number | null
  alarmes?: number | null
}

// Remover a simulação de dados e garantir que apenas dados reais sejam exibidos
export class WhitekonService {
  private static instance: WhitekonService
  private connected = false
  private pollingInterval: NodeJS.Timeout | null = null
  private data: WhitekonData | null = null
  private onDataUpdateCallbacks: ((data: WhitekonData | null) => void)[] = []

  private constructor() {}

  public static getInstance(): WhitekonService {
    if (!WhitekonService.instance) {
      WhitekonService.instance = new WhitekonService()
    }
    return WhitekonService.instance
  }

  public async connect(
    portName: string,
    baudRateStr: string,
    addressStr: string,
    signal?: AbortSignal,
  ): Promise<boolean> {
    try {
      const baudRate = Number.parseInt(baudRateStr, 10)
      const address = Number.parseInt(addressStr, 10)

      // Constrói a URL com os parâmetros
      const url = `/api/whitekon?action=connect&port=${encodeURIComponent(portName)}&baudrate=${baudRate}&unit=${address}`

      const response = await fetch(url, { signal })

      // Verifica se a resposta está OK antes de tentar analisar o JSON
      if (!response.ok) {
        const errorText = await response.text()
        console.error("Erro na resposta da API:", errorText)
        throw new Error(`Erro na resposta da API: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      this.connected = data.status === "connected"

      if (this.connected) {
        this.startPolling()
      } else {
        // Se não conectou, limpa os dados
        this.data = null
        this.notifyDataUpdate()
      }

      return this.connected
    } catch (error) {
      console.error("Erro ao conectar:", error)
      this.connected = false
      this.data = null
      this.notifyDataUpdate()
      throw error // Propaga o erro para ser tratado no componente
    }
  }

  public async disconnect(): Promise<boolean> {
    try {
      this.stopPolling()

      const response = await fetch("/api/whitekon?action=disconnect")
      const data = await response.json()
      this.connected = !(data.status === "disconnected")

      // Limpa os dados ao desconectar
      this.data = null
      this.notifyDataUpdate()

      return !this.connected
    } catch (error) {
      console.error("Erro ao desconectar:", error)
      return false
    }
  }

  public isConnected(): boolean {
    return this.connected
  }

  public async checkConnectionStatus(): Promise<boolean> {
    try {
      const response = await fetch("/api/whitekon?action=status")
      const data = await response.json()
      this.connected = data.connected

      if (!this.connected) {
        // Se não está conectado, limpa os dados
        this.data = null
        this.notifyDataUpdate()
      }

      return this.connected
    } catch (error) {
      console.error("Erro ao verificar status da conexão:", error)
      this.connected = false
      this.data = null
      this.notifyDataUpdate()
      return false
    }
  }

  private startPolling(interval = 1000): void {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval)
    }

    this.pollingInterval = setInterval(async () => {
      try {
        if (!this.connected) {
          this.stopPolling()
          this.data = null
          this.notifyDataUpdate()
          return
        }

        const response = await fetch("/api/whitekon?action=data")
        if (!response.ok) {
          throw new Error("Falha ao obter dados")
        }

        const responseData = await response.json()

        // Verifica se há erro na resposta
        if (responseData.error) {
          console.error("Erro na resposta:", responseData.error)
          // Não atualiza os dados em caso de erro
          return
        }

        // Atualiza os dados apenas se houver dados válidos
        if (responseData && responseData.brancura) {
          this.data = responseData
          this.notifyDataUpdate()
        }
      } catch (error) {
        console.error("Erro ao obter dados:", error)
        // Não limpa os dados em caso de erro temporário de comunicação
      }
    }, interval)
  }

  private stopPolling(): void {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval)
      this.pollingInterval = null
    }
  }

  private notifyDataUpdate(): void {
    // Notifica os callbacks registrados
    this.onDataUpdateCallbacks.forEach((callback) => callback(this.data))
  }

  public onDataUpdate(callback: (data: WhitekonData | null) => void): () => void {
    this.onDataUpdateCallbacks.push(callback)

    // Retorna uma função para remover o callback
    return () => {
      this.onDataUpdateCallbacks = this.onDataUpdateCallbacks.filter((cb) => cb !== callback)
    }
  }

  public getData(): WhitekonData | null {
    return this.data
  }

  // Métodos para escrita em registros específicos

  public async setOperationMode(mode: number): Promise<boolean> {
    return this.writeRegister(WhitekonRegisters.MODO_OPERACAO, mode)
  }

  public async calibrateDark(): Promise<boolean> {
    return this.writeRegister(WhitekonRegisters.COMANDOS_CALIBRACAO, CalibrationCommands.CALIBRA_ESCURO)
  }

  public async calibrateWhite(): Promise<boolean> {
    return this.writeRegister(WhitekonRegisters.COMANDOS_CALIBRACAO, CalibrationCommands.CALIBRA_CLARO)
  }

  public async setAutoMode(auto: boolean): Promise<boolean> {
    return this.writeRegister(WhitekonRegisters.AUTOMATICO_MANUAL, auto ? ControlModes.AUTOMATICO : ControlModes.MANUAL)
  }

  public async setIntegrationTime(timeCode: number): Promise<boolean> {
    // Na implementação real, precisaria combinar com o ganho atual
    return this.writeRegister(WhitekonRegisters.TEMPO_INTEGRACAO_E_GANHO, timeCode << 8)
  }

  public async setGain(gainCode: number): Promise<boolean> {
    // Na implementação real, precisaria combinar com o tempo de integração atual
    return this.writeRegister(WhitekonRegisters.TEMPO_INTEGRACAO_E_GANHO, gainCode)
  }

  public async setBrightnessLimits(min: number, max: number): Promise<boolean> {
    const minResult = await this.writeRegister(WhitekonRegisters.BRANCURA_MINIMA, Math.round(min * 10))
    const maxResult = await this.writeRegister(WhitekonRegisters.BRANCURA_MAXIMA, Math.round(max * 10))
    return minResult && maxResult
  }

  public async setOffset(offset: number): Promise<boolean> {
    return this.writeRegister(WhitekonRegisters.OFFSET, Math.round(offset * 10))
  }

  // Método genérico para escrita em registros
  private async writeRegister(register: number, value: number): Promise<boolean> {
    if (!this.connected) {
      console.error("Não conectado")
      return false
    }

    try {
      const response = await fetch("/api/whitekon", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ register, value }),
      })

      if (!response.ok) {
        throw new Error(`Erro ao escrever no registro ${register}`)
      }

      const result = await response.json()
      return result.success === true
    } catch (error) {
      console.error(`Erro ao escrever no registro ${register}:`, error)
      return false
    }
  }
}
