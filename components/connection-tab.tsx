"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RefreshCw } from "lucide-react"
import { WhitekonService } from "@/lib/whitekon-service"
import { useToast } from "@/hooks/use-toast"

interface ConnectionTabProps {
  onConnectionChange: (connected: boolean) => void
}

export function ConnectionTab({ onConnectionChange }: ConnectionTabProps) {
  const [port, setPort] = useState("")
  const [baudRate, setBaudRate] = useState("115200")
  const [address, setAddress] = useState("4")
  const [connected, setConnected] = useState(false)
  const [availablePorts, setAvailablePorts] = useState([
    "COM1",
    "COM2",
    "COM3",
    "COM4",
    "COM5",
    "COM6",
    "COM7",
    "COM8",
    "COM9",
    "COM10",
    "/dev/ttyUSB0",
    "/dev/ttyUSB1",
    "/dev/ttyS0",
    "/dev/ttyS1",
    "/dev/ttyACM0",
  ])
  const [isConnecting, setIsConnecting] = useState(false)
  const { toast } = useToast()

  const whitekonService = WhitekonService.getInstance()

  useEffect(() => {
    // Verifica o status da conexão ao carregar o componente
    const checkConnection = async () => {
      const isConnected = await whitekonService.checkConnectionStatus()
      setConnected(isConnected)
      onConnectionChange(isConnected)
    }

    checkConnection()
  }, [onConnectionChange])

  // Modificar para passar os parâmetros de conexão para a API
  const handleConnect = async () => {
    if (!port) {
      toast({
        title: "Erro de conexão",
        description: "Selecione uma porta para conectar",
        variant: "destructive",
      })
      return
    }

    setIsConnecting(true)

    try {
      // Adiciona um timeout para a requisição
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 15000) // 15 segundos de timeout

      // Passa os parâmetros de conexão para o serviço
      const success = await whitekonService.connect(port, baudRate, address, controller.signal)

      clearTimeout(timeoutId)

      setConnected(success)
      onConnectionChange(success)

      if (success) {
        toast({
          title: "Conexão estabelecida",
          description: `Conectado à porta ${port} com baud rate ${baudRate} e endereço ${address}`,
        })
      } else {
        toast({
          title: "Falha na conexão",
          description:
            "Não foi possível conectar ao dispositivo. Verifique os parâmetros e se o dispositivo está ligado.",
          variant: "destructive",
        })
      }
    } catch (error: any) {
      console.error("Erro ao conectar:", error)

      // Verifica se é um erro de timeout
      if (error.name === "AbortError") {
        toast({
          title: "Timeout na conexão",
          description: "A conexão demorou muito para responder. Verifique se o dispositivo está ligado e conectado.",
          variant: "destructive",
        })
      } else {
        toast({
          title: "Erro de conexão",
          description:
            error.message || "Ocorreu um erro ao tentar conectar. Verifique se o script Python está disponível.",
          variant: "destructive",
        })
      }
    } finally {
      setIsConnecting(false)
    }
  }

  const handleDisconnect = async () => {
    try {
      const success = await whitekonService.disconnect()
      setConnected(!success)
      onConnectionChange(!success)

      if (success) {
        toast({
          title: "Desconectado",
          description: "Conexão encerrada com sucesso",
        })
      }
    } catch (error) {
      console.error("Erro ao desconectar:", error)
      toast({
        title: "Erro ao desconectar",
        description: "Ocorreu um erro ao tentar desconectar",
        variant: "destructive",
      })
    }
  }

  const refreshPorts = () => {
    // Simulação de atualização de portas
    setAvailablePorts(["COM1", "COM2", "COM3", "COM4", "COM5", "COM8"])
    toast({
      title: "Portas atualizadas",
      description: "Lista de portas atualizada",
    })
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Configuração de Conexão</CardTitle>
        <CardDescription>Configure a conexão com o medidor WhiteKon</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex justify-end">
          <Button variant="outline" size="sm" onClick={refreshPorts}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Obter Portas
          </Button>
        </div>

        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="port">Porta:</Label>
            <Select value={port} onValueChange={setPort} disabled={connected}>
              <SelectTrigger id="port">
                <SelectValue placeholder="Selecione uma porta" />
              </SelectTrigger>
              <SelectContent>
                {availablePorts.map((p) => (
                  <SelectItem key={p} value={p}>
                    {p}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="baudRate">Baud Rate:</Label>
            <Select value={baudRate} onValueChange={setBaudRate} disabled={connected}>
              <SelectTrigger id="baudRate">
                <SelectValue placeholder="Selecione o baud rate" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="4800">4800</SelectItem>
                <SelectItem value="9600">9600</SelectItem>
                <SelectItem value="19200">19200</SelectItem>
                <SelectItem value="38400">38400</SelectItem>
                <SelectItem value="57600">57600</SelectItem>
                <SelectItem value="115200">115200</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="address">Endereço:</Label>
            <Input
              id="address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="bg-slate-800 text-white"
              disabled={connected}
            />
          </div>
        </div>

        <div className="grid gap-2 mt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const customPort = prompt("Digite o nome da porta (ex: COM8, /dev/ttyUSB0):")
              if (customPort) {
                if (!availablePorts.includes(customPort)) {
                  setAvailablePorts((prev) => [...prev, customPort])
                }
                setPort(customPort)
              }
            }}
          >
            Adicionar Porta Manualmente
          </Button>
        </div>

        <div className="flex gap-4 justify-center pt-4">
          <Button
            onClick={handleConnect}
            disabled={!port || connected || isConnecting}
            className="bg-[#00A651] hover:bg-[#008a43] text-white"
          >
            {isConnecting ? "Conectando..." : "Conectar"}
          </Button>
          <Button variant="outline" onClick={handleDisconnect} disabled={!connected}>
            Desconectar
          </Button>
        </div>

        <div className="text-center pt-4">
          <div className={`text-2xl font-bold ${connected ? "text-[#00A651]" : "text-red-500"}`}>
            {connected ? "CONECTADO" : "DESCONECTADO"}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
