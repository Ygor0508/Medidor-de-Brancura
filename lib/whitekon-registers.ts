// Definição dos registradores do WhiteKon conforme a tabela Modbus fornecida
export const WhitekonRegisters = {
  // Registros de banco de dados R/W
  MODO_OPERACAO: 0, // 0-Normal, 1-Calibração, 2-Limpeza, 3-Máquina Parada
  BRANCURA_MEDIA: 5, // Valor final da média da brancura descontando desvio padrão
  TEMP_CALIBRACAO: 6, // Temperatura no momento da calibração
  TEMP_ONLINE: 7, // Temperatura online, no momento
  BLUE_PRETO: 8, // Valor do blue quando calibrado o padrão escuro
  BLUE_BRANCO: 9, // Valor do blue quando calibrado o padrão claro
  ALARMES: 10, // Alarmes indicados pelo Whitekon
  DESVIO_PADRAO: 11, // Valor do desvio padrão da última média

  // Registros de leitura online
  RED: 15, // Valor do R do sensor RGB
  GREEN: 16, // Valor do G do sensor RGB
  BLUE: 17, // Valor do B do sensor RGB
  CLEAR: 18, // Valor do Clear
  CONTADOR_AMOSTRAS: 19, // Mostra em qual amostra está da amostragem
  BRANCURA_SEM_CORRECAO: 20, // Brancura sem correção de temperatura ou coeficientes
  BRANCURA_ONLINE: 21, // Brancura com correção online

  // Registros de calibração
  COMANDOS_CALIBRACAO: 27, // 0x5501 Calibra Escuro, 0x5502 Calibra Claro
  CONTROLE_REMOTO: 28, // bit0 = LED; bit1 = BOBINA
  AUTOMATICO_MANUAL: 29, // 0 = Automático, 1 = Manual

  // Registros de configuração
  END_RTU: 33, // Endereço RTU
  TEMPO_INTEGRACAO_E_GANHO: 34, // High: Tempo de Integração; Low: Ganho

  // Registros de parâmetros
  TEMPO_LED_DESLIGADO: 48, // Tempo em que os leds permanecem desligados
  TEMPO_LED_LIGADO: 49, // Tempo em que os leds permanecem ligados
  VALOR_ESCURO_PADRAO: 50, // Valor do padrão escuro para calibração
  VALOR_CLARO_PADRAO: 51, // Valor do padrão claro para calibração
  OFFSET: 52, // Offset de brancura
  BRANCURA_MINIMA: 53, // Valor mínimo aceitável de brancura
  BRANCURA_MAXIMA: 54, // Valor máximo aceitável de brancura
  ESCURO_MAXIMO: 55, // Valor de blue máximo que pode dar na calibração de escuro
  CLARO_MINIMO: 56, // Valor de blue mínimo que pode dar na calibração de claro
}

// Códigos de tempo de integração
export const IntegrationTimeCodes = {
  MS_2_4: 0, // 2,4 ms
  MS_24: 1, // 24 ms
  MS_50: 2, // 50 ms
  MS_101: 3, // 101 ms
  MS_154: 4, // 154 ms
  MS_700: 5, // 700 ms
}

// Códigos de ganho
export const GainCodes = {
  X1: 0, // 1x
  X4: 1, // 4x
  X16: 2, // 16x
  X60: 3, // 60x
}

// Tipos de alarmes
export const AlarmTypes = {
  // Alarmes de calibração
  ESCURO_MAIOR_CLARO: 0, // Escuro > Claro
  ESCURO_IGUAL_CLARO: 1, // Escuro = Claro (com margem)
  SAIU_SEM_CALIBRAR: 2, // Saiu do modo de calibração s/ calibrar os dois
  ESCURO_MAIOR_3000: 3, // Escuro > 3000
  CLARO_MENOR_4000: 4, // Claro < 4000
  TEMPO_CALIBRACAO: 5, // Muito tempo em modo de calibração
  CALIBRACAO_CORRETA: 6, // Indicação que foi realizada a calibração correta

  // Alarmes de funcionamento
  BRANCURA_MUITO_ALTA: 8, // Valor de brancura muito alto
  BRANCURA_MUITO_BAIXA: 9, // Valor de brancura muito baixo
  SEM_LEITURA_SENSOR: 10, // Sem leitura do sensor (Blue = 0)
  ERRO_TEMPERATURA: 11, // Erro na leitura de temperatura (T = 0)
  SENSOR_DESCONECTADO: 12, // Sensor desconectado brancura
}

// Modos de operação
export const OperationModes = {
  NORMAL: 0,
  CALIBRACAO: 1,
  LIMPEZA: 2,
  MAQUINA_PARADA: 3,
}

// Comandos de calibração
export const CalibrationCommands = {
  CALIBRA_ESCURO: 0x5501,
  CALIBRA_CLARO: 0x5502,
}

// Modos automático/manual
export const ControlModes = {
  AUTOMATICO: 0,
  MANUAL: 1,
}
