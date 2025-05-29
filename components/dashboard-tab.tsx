"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, Bell, BellOff, Clock, ThermometerIcon } from "lucide-react"
import { WhitekonMonitor } from "@/components/whitekon-monitor"
import { WhitekonService } from "@/lib/whitekon-service"
import { useToast } from "@/hooks/use-toast"

interface DashboardTabProps {
  activeWhitekon: number
  onWhitekonChange: (id: number) => void
}

// Modificar para mostrar mensagem quando não há dados
export function DashboardTab({ activeWhitekon, onWhitekonChange }: DashboardTabProps) {
  const [silenceAlarms, setSilenceAlarms] = useState(false)
  const [emergencyMode, setEmergencyMode] = useState(false)
  const [whitekonData, setWhitekonData] = useState<any>(null)
  const [currentTime, setCurrentTime] = useState(new Date())
  const [whitekonUnits, setWhitekonUnits] = useState<any[]>([])
  const [alarms, setAlarms] = useState<any[]>([])
  const [isConnected, setIsConnected] = useState(false)
  const { toast } = useToast()

  const whitekonService = WhitekonService.getInstance()

  // Verifica o status da conexão ao carregar o componente
  useEffect(() => {
    const checkConnection = async () => {
      const connected = await whitekonService.checkConnectionStatus()
      setIsConnected(connected)
    }

    checkConnection()
  }, [])

  // Atualiza o relógio a cada segundo
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  // Inscreve-se para receber atualizações de dados
  useEffect(() => {
    const unsubscribe = whitekonService.onDataUpdate((data) => {
      setWhitekonData(data)

      // Se temos dados, atualizamos a unidade ativa
      if (data) {
        setWhitekonUnits((prev) => {
          const newUnits = [...prev]
          const unitIndex = newUnits.findIndex((u) => u.id === activeWhitekon)

          if (unitIndex >= 0) {
            newUnits[unitIndex] = {
              ...newUnits[unitIndex],
              status: "online",
              brancura: data.brancura.media,
              calibrado: true, // Assumimos que está calibrado se temos dados
            }
          } else {
            // Se a unidade não existe, adicionamos
            newUnits.push({
              id: activeWhitekon,
              status: "online",
              brancura: data.brancura.media,
              calibrado: true,
            })
          }

          return newUnits
        })

        // Verifica alarmes
        if (data.alarmes) {
          // Processa os bits de alarme e atualiza a lista de alarmes
          processAlarms(data.alarmes)
        }
      }
    })

    // Limpa a inscrição quando o componente é desmontado
    return () => {
      unsubscribe()
    }
  }, [activeWhitekon])

  // Função para processar os bits de alarme
  const processAlarms = (alarmBits: number) => {
    const newAlarms = []

    // Verifica cada bit de alarme conforme a tabela fornecida
    if (alarmBits & (1 << 0))
      newAlarms.push({
        id: Date.now() + 1,
        type: "Escuro > Claro",
        unit: activeWhitekon,
        time: new Date().toLocaleTimeString(),
      })
    if (alarmBits & (1 << 1))
      newAlarms.push({
        id: Date.now() + 2,
        type: "Escuro = Claro",
        unit: activeWhitekon,
        time: new Date().toLocaleTimeString(),
      })
    if (alarmBits & (1 << 2))
      newAlarms.push({
        id: Date.now() + 3,
        type: "Saiu sem calibrar",
        unit: activeWhitekon,
        time: new Date().toLocaleTimeString(),
      })
    if (alarmBits & (1 << 3))
      newAlarms.push({
        id: Date.now() + 4,
        type: "Escuro > 3000",
        unit: activeWhitekon,
        time: new Date().toLocaleTimeString(),
      })
    if (alarmBits & (1 << 4))
      newAlarms.push({
        id: Date.now() + 5,
        type: "Claro < 4000",
        unit: activeWhitekon,
        time: new Date().toLocaleTimeString(),
      })
    if (alarmBits & (1 << 8))
      newAlarms.push({
        id: Date.now() + 6,
        type: "Brancura Muito Alta",
        unit: activeWhitekon,
        time: new Date().toLocaleTimeString(),
      })
    if (alarmBits & (1 << 9))
      newAlarms.push({
        id: Date.now() + 7,
        type: "Brancura Muito Baixa",
        unit: activeWhitekon,
        time: new Date().toLocaleTimeString(),
      })
    if (alarmBits & (1 << 10))
      newAlarms.push({
        id: Date.now() + 8,
        type: "Sem Leitura do Sensor",
        unit: activeWhitekon,
        time: new Date().toLocaleTimeString(),
      })
    if (alarmBits & (1 << 11))
      newAlarms.push({
        id: Date.now() + 9,
        type: "Erro na Temperatura",
        unit: activeWhitekon,
        time: new Date().toLocaleTimeString(),
      })
    if (alarmBits & (1 << 12))
      newAlarms.push({
        id: Date.now() + 10,
        type: "Sensor Desconectado",
        unit: activeWhitekon,
        time: new Date().toLocaleTimeString(),
      })

    setAlarms(newAlarms)
  }

  const handleEmergencyToggle = () => {
    const newState = !emergencyMode
    setEmergencyMode(newState)

    if (newState) {
      toast({
        title: "Modo de emergência ativado",
        description: "Todas as operações críticas foram interrompidas",
        variant: "destructive",
      })
    } else {
      toast({
        title: "Modo de emergência desativado",
        description: "Operações normais restauradas",
      })
    }
  }

  const handleSilenceAlarmsToggle = () => {
    const newState = !silenceAlarms
    setSilenceAlarms(newState)

    if (newState) {
      toast({
        title: "Alarmes silenciados",
        description: "Notificações sonoras desativadas",
      })
    } else {
      toast({
        title: "Alarmes ativados",
        description: "Notificações sonoras restauradas",
      })
    }
  }

  return (
    <div className="grid gap-6">
      <div className="flex flex-wrap justify-between items-center gap-4">
        <div className="flex gap-2">
          <Button
            variant={emergencyMode ? "default" : "outline"}
            className={emergencyMode ? "bg-red-500 hover:bg-red-600" : ""}
            onClick={handleEmergencyToggle}
          >
            <AlertCircle className="mr-2 h-4 w-4" />
            Emergência
          </Button>
          <Button
            variant={silenceAlarms ? "default" : "outline"}
            className={silenceAlarms ? "bg-blue-500 hover:bg-blue-600" : ""}
            onClick={handleSilenceAlarmsToggle}
          >
            {silenceAlarms ? (
              <>
                <BellOff className="mr-2 h-4 w-4" />
                Silêncio
              </>
            ) : (
              <>
                <Bell className="mr-2 h-4 w-4" />
                Silenciar
              </>
            )}
          </Button>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <ThermometerIcon className="h-4 w-4 text-orange-500" />
            <span>Temp: {whitekonData?.temperatura?.online || "N/A"} °C</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            <span>{currentTime.toLocaleTimeString("pt-BR")}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {whitekonUnits.length > 0 ? (
          whitekonUnits.map((unit) => (
            <Card
              key={unit.id}
              className={`cursor-pointer ${activeWhitekon === unit.id ? "border-[#00A651] border-2" : ""}`}
              onClick={() => onWhitekonChange(unit.id)}
            >
              <CardHeader className="p-4">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-lg">WhiteKon #{unit.id}</CardTitle>
                  <Badge
                    variant={unit.status === "online" ? "default" : "destructive"}
                    className={unit.status === "online" ? "bg-[#00A651]" : ""}
                  >
                    {unit.status === "online" ? "Online" : "Offline"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="grid gap-2">
                  <div className="flex justify-between">
                    <span className="font-medium">Brancura:</span>
                    <span className="font-bold">{unit.brancura ? unit.brancura.toFixed(2) : "N/A"}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Calibrado:</span>
                    <Badge variant={unit.calibrado ? "outline" : "destructive"}>{unit.calibrado ? "Sim" : "Não"}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="col-span-4 flex flex-col items-center justify-center h-32 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-gray-500 mb-2">Nenhum dispositivo WhiteKon conectado</p>
            <p className="text-sm text-gray-400">Conecte um dispositivo na aba Conexão</p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Monitor WhiteKon #{activeWhitekon}</CardTitle>
          </CardHeader>
          <CardContent>
            <WhitekonMonitor whitekonId={activeWhitekon} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Alarmes Ativos</CardTitle>
          </CardHeader>
          <CardContent>
            {alarms.length > 0 ? (
              <div className="space-y-4">
                {alarms.map((alarm) => (
                  <div
                    key={alarm.id}
                    className="p-3 border rounded-md bg-red-50 border-red-200 flex justify-between items-center"
                  >
                    <div>
                      <p className="font-medium text-red-800">{alarm.type}</p>
                      <p className="text-sm text-gray-500">WhiteKon #{alarm.unit}</p>
                    </div>
                    <div className="text-sm text-gray-500">{alarm.time}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-gray-500">Nenhum alarme ativo</div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
