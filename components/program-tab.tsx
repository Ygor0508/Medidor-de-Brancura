// "use client"

// import { useState, useEffect } from "react"
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
// import { Button } from "@/components/ui/button"
// import { Input } from "@/components/ui/input"
// import { Label } from "@/components/ui/label"
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
// import { WhitekonService } from "@/lib/whitekon-service"
// import { useToast } from "@/hooks/use-toast"

// interface ProgramTabProps {
//   whitekonId: number
// }

// export function ProgramTab({ whitekonId }: ProgramTabProps) {
//   const [calibrationActive, setCalibrationActive] = useState(false)
//   const [mode, setMode] = useState("0")
//   const [integrationTime, setIntegrationTime] = useState("1") // 24ms
//   const [gain, setGain] = useState("0") // 1x
//   const [ledStatus, setLedStatus] = useState(false)
//   const [whitekonData, setWhitekonData] = useState<any>(null)
//   const [isLoading, setIsLoading] = useState(false)

//   const { toast } = useToast()
//   const whitekonService = WhitekonService.getInstance()

//   // Valores para os polinômios de correção
//   const [temperatureCorrection, setTemperatureCorrection] = useState({
//     a: "",
//     b: "",
//     c: "",
//   })

//   const [whitenessCorrection, setWhitenessCorrection] = useState({
//     a: "",
//     b: "",
//     c: "",
//   })

//   // Valores para offset e limites
//   const [offset, setOffset] = useState("")
//   const [minWhiteness, setMinWhiteness] = useState("")
//   const [maxWhiteness, setMaxWhiteness] = useState("")
//   const [maxDark, setMaxDark] = useState("")
//   const [minLight, setMinLight] = useState("")

//   useEffect(() => {
//     // Inscreve-se para receber atualizações de dados
//     const unsubscribe = whitekonService.onDataUpdate((data) => {
//       setWhitekonData(data)
//     })

//     // Limpa a inscrição quando o componente é desmontado
//     return () => {
//       unsubscribe()
//     }
//   }, [])

//   const handleCalibrationToggle = async () => {
//     setIsLoading(true)
//     try {
//       // No modo real, isso alteraria o registro MODO_OPERACAO para 1 (calibração) ou 0 (normal)
//       const newMode = !calibrationActive ? 1 : 0
//       const success = await whitekonService.setOperationMode(newMode)

//       if (success) {
//         setCalibrationActive(!calibrationActive)
//         toast({
//           title: !calibrationActive ? "Calibração ativada" : "Calibração desativada",
//           description: !calibrationActive
//             ? "Modo de calibração ativado com sucesso"
//             : "Modo de operação normal restaurado",
//         })
//       } else {
//         toast({
//           title: "Falha na operação",
//           description: "Não foi possível alterar o modo de operação",
//           variant: "destructive",
//         })
//       }
//     } catch (error) {
//       console.error("Erro ao alterar modo de calibração:", error)
//       toast({
//         title: "Erro",
//         description: "Ocorreu um erro ao alterar o modo de calibração",
//         variant: "destructive",
//       })
//     } finally {
//       setIsLoading(false)
//     }
//   }

//   const handleCalibrateDark = async () => {
//     setIsLoading(true)
//     try {
//       const success = await whitekonService.calibrateDark()

//       if (success) {
//         toast({
//           title: "Calibração de escuro",
//           description: "Calibração de escuro iniciada com sucesso",
//         })
//       } else {
//         toast({
//           title: "Falha na calibração",
//           description: "Não foi possível iniciar a calibração de escuro",
//           variant: "destructive",
//         })
//       }
//     } catch (error) {
//       console.error("Erro ao calibrar escuro:", error)
//       toast({
//         title: "Erro",
//         description: "Ocorreu um erro ao iniciar a calibração de escuro",
//         variant: "destructive",
//       })
//     } finally {
//       setIsLoading(false)
//     }
//   }

//   const handleCalibrateWhite = async () => {
//     setIsLoading(true)
//     try {
//       const success = await whitekonService.calibrateWhite()

//       if (success) {
//         toast({
//           title: "Calibração de claro",
//           description: "Calibração de claro iniciada com sucesso",
//         })
//       } else {
//         toast({
//           title: "Falha na calibração",
//           description: "Não foi possível iniciar a calibração de claro",
//           variant: "destructive",
//         })
//       }
//     } catch (error) {
//       console.error("Erro ao calibrar claro:", error)
//       toast({
//         title: "Erro",
//         description: "Ocorreu um erro ao iniciar a calibração de claro",
//         variant: "destructive",
//       })
//     } finally {
//       setIsLoading(false)
//     }
//   }

//   const handleSetAutoMode = async (auto: boolean) => {
//     setIsLoading(true)
//     try {
//       const success = await whitekonService.setAutoMode(auto)

//       if (success) {
//         setMode(auto ? "0" : "1")
//         toast({
//           title: auto ? "Modo automático" : "Modo manual",
//           description: `Modo ${auto ? "automático" : "manual"} ativado com sucesso`,
//         })
//       } else {
//         toast({
//           title: "Falha na operação",
//           description: `Não foi possível ativar o modo ${auto ? "automático" : "manual"}`,
//           variant: "destructive",
//         })
//       }
//     } catch (error) {
//       console.error("Erro ao alterar modo:", error)
//       toast({
//         title: "Erro",
//         description: "Ocorreu um erro ao alterar o modo de operação",
//         variant: "destructive",
//       })
//     } finally {
//       setIsLoading(false)
//     }
//   }

//   const handleSetIntegrationTime = async (value: string) => {
//     setIsLoading(true)
//     try {
//       const timeCode = Number.parseInt(value)
//       const success = await whitekonService.setIntegrationTime(timeCode)

//       if (success) {
//         setIntegrationTime(value)
//         toast({
//           title: "Tempo de integração",
//           description: "Tempo de integração alterado com sucesso",
//         })
//       } else {
//         toast({
//           title: "Falha na operação",
//           description: "Não foi possível alterar o tempo de integração",
//           variant: "destructive",
//         })
//       }
//     } catch (error) {
//       console.error("Erro ao alterar tempo de integração:", error)
//       toast({
//         title: "Erro",
//         description: "Ocorreu um erro ao alterar o tempo de integração",
//         variant: "destructive",
//       })
//     } finally {
//       setIsLoading(false)
//     }
//   }

//   const handleSetGain = async (value: string) => {
//     setIsLoading(true)
//     try {
//       const gainCode = Number.parseInt(value)
//       const success = await whitekonService.setGain(gainCode)

//       if (success) {
//         setGain(value)
//         toast({
//           title: "Ganho",
//           description: "Ganho alterado com sucesso",
//         })
//       } else {
//         toast({
//           title: "Falha na operação",
//           description: "Não foi possível alterar o ganho",
//           variant: "destructive",
//         })
//       }
//     } catch (error) {
//       console.error("Erro ao alterar ganho:", error)
//       toast({
//         title: "Erro",
//         description: "Ocorreu um erro ao alterar o ganho",
//         variant: "destructive",
//       })
//     } finally {
//       setIsLoading(false)
//     }
//   }

//   const handleSetOffset = async () => {
//     if (!offset) return

//     setIsLoading(true)
//     try {
//       const offsetValue = Number.parseFloat(offset)
//       const success = await whitekonService.setOffset(offsetValue)

//       if (success) {
//         toast({
//           title: "Offset",
//           description: "Offset de brancura alterado com sucesso",
//         })
//       } else {
//         toast({
//           title: "Falha na operação",
//           description: "Não foi possível alterar o offset",
//           variant: "destructive",
//         })
//       }
//     } catch (error) {
//       console.error("Erro ao alterar offset:", error)
//       toast({
//         title: "Erro",
//         description: "Ocorreu um erro ao alterar o offset",
//         variant: "destructive",
//       })
//     } finally {
//       setIsLoading(false)
//     }
//   }

//   const handleSetBrightnessLimits = async () => {
//     if (!minWhiteness || !maxWhiteness) return

//     setIsLoading(true)
//     try {
//       const min = Number.parseFloat(minWhiteness)
//       const max = Number.parseFloat(maxWhiteness)
//       const success = await whitekonService.setBrightnessLimits(min, max)

//       if (success) {
//         toast({
//           title: "Limites de brancura",
//           description: "Limites de brancura alterados com sucesso",
//         })
//       } else {
//         toast({
//           title: "Falha na operação",
//           description: "Não foi possível alterar os limites de brancura",
//           variant: "destructive",
//         })
//       }
//     } catch (error) {
//       console.error("Erro ao alterar limites de brancura:", error)
//       toast({
//         title: "Erro",
//         description: "Ocorreu um erro ao alterar os limites de brancura",
//         variant: "destructive",
//       })
//     } finally {
//       setIsLoading(false)
//     }
//   }

//   // Função genérica para leitura de valores
//   const handleReadValue = (field: string) => {
//     toast({
//       title: "Leitura de valor",
//       description: `Lendo valor de ${field}...`,
//     })
//   }

//   // Função genérica para envio de valores
//   const handleSendValue = (field: string) => {
//     toast({
//       title: "Envio de valor",
//       description: `Enviando valor de ${field}...`,
//     })
//   }

//   // Valores RGB e brancura do WhiteKon
//   const rgbValues = whitekonData?.rgb || {
//     red: "0",
//     green: "0",
//     blue: "0",
//     clear: "0",
//   }

//   const whitenessValues = whitekonData
//     ? {
//         whiteness: whitekonData.brancura.media?.toString() || "0",
//         corrected: whitekonData.brancura.online?.toString() || "0",
//       }
//     : {
//         whiteness: "0",
//         corrected: "0",
//       }

//   return (
//     <div className="grid gap-6">
//       <div className="flex items-center justify-between">
//         <h2 className="text-2xl font-bold">WhiteKon #{whitekonId}</h2>
//       </div>

//       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//         <Card>
//           <CardHeader>
//             <CardTitle>Leituras RGB e Brancura</CardTitle>
//           </CardHeader>
//           <CardContent className="grid grid-cols-2 gap-4">
//             <div>
//               <div className="grid gap-2">
//                 <div className="flex justify-between">
//                   <Label className="text-red-500 font-bold">RED</Label>
//                   <span className="font-mono">{rgbValues.red}</span>
//                 </div>
//                 <div className="flex justify-between">
//                   <Label className="text-green-500 font-bold">GREEN</Label>
//                   <span className="font-mono">{rgbValues.green}</span>
//                 </div>
//                 <div className="flex justify-between">
//                   <Label className="text-blue-500 font-bold">BLUE</Label>
//                   <span className="font-mono">{rgbValues.blue}</span>
//                 </div>
//                 <div className="flex justify-between">
//                   <Label>CLEAR</Label>
//                   <span className="font-mono">{rgbValues.clear}</span>
//                 </div>
//               </div>
//             </div>
//             <div>
//               <div className="grid gap-2">
//                 <div className="flex justify-between">
//                   <Label className="text-yellow-500 font-bold">BRANCURA</Label>
//                   <span className="font-mono">{whitenessValues.whiteness}</span>
//                 </div>
//                 <div className="flex justify-between">
//                   <Label>BR S/ CORR.</Label>
//                   <span className="font-mono">{whitenessValues.corrected}</span>
//                 </div>
//               </div>
//             </div>
//           </CardContent>
//         </Card>

//         <Card>
//           <CardHeader>
//             <CardTitle>Calibração</CardTitle>
//           </CardHeader>
//           <CardContent className="grid gap-4">
//             <div className="flex flex-col gap-2">
//               <Button
//                 onClick={handleCalibrationToggle}
//                 disabled={isLoading}
//                 className={calibrationActive ? "bg-red-500 hover:bg-red-600" : "bg-[#00A651] hover:bg-[#008a43]"}
//               >
//                 {calibrationActive ? "DESATIVAR CALIBRAÇÃO" : "ATIVAR CALIBRAÇÃO"}
//               </Button>

//               <div className="grid grid-cols-2 gap-2 mt-2">
//                 <Button variant="outline" onClick={handleCalibrateDark} disabled={!calibrationActive || isLoading}>
//                   Calibra Preto
//                 </Button>
//                 <Button variant="outline" onClick={handleCalibrateWhite} disabled={!calibrationActive || isLoading}>
//                   Calibra Branco
//                 </Button>
//               </div>

//               <div className="mt-4 text-center">
//                 <div className="inline-block px-4 py-2 border border-yellow-500 rounded-md">
//                   <span className="text-yellow-500 font-bold">
//                     {calibrationActive ? "CALIBRA HABILITADO" : "CALIBRA DESABILITADO"}
//                   </span>
//                 </div>
//               </div>
//             </div>
//           </CardContent>
//         </Card>

//         <Card>
//           <CardHeader>
//             <CardTitle>Polinômio de correção de temperatura</CardTitle>
//           </CardHeader>
//           <CardContent>
//             <div className="grid grid-cols-3 gap-4 mb-4">
//               <div className="grid gap-2">
//                 <Label htmlFor="temp-a">a</Label>
//                 <Input
//                   id="temp-a"
//                   value={temperatureCorrection.a}
//                   onChange={(e) => setTemperatureCorrection({ ...temperatureCorrection, a: e.target.value })}
//                   className="bg-slate-800 text-white"
//                 />
//               </div>
//               <div className="grid gap-2">
//                 <Label htmlFor="temp-b">b</Label>
//                 <Input
//                   id="temp-b"
//                   value={temperatureCorrection.b}
//                   onChange={(e) => setTemperatureCorrection({ ...temperatureCorrection, b: e.target.value })}
//                   className="bg-slate-800 text-white"
//                 />
//               </div>
//               <div className="grid gap-2">
//                 <Label htmlFor="temp-c">c</Label>
//                 <Input
//                   id="temp-c"
//                   value={temperatureCorrection.c}
//                   onChange={(e) => setTemperatureCorrection({ ...temperatureCorrection, c: e.target.value })}
//                   className="bg-slate-800 text-white"
//                 />
//               </div>
//             </div>
//             <div className="flex justify-center gap-4">
//               <Button variant="outline" size="sm" onClick={() => handleReadValue("temp")}>
//                 Ler
//               </Button>
//               <Button variant="outline" size="sm" onClick={() => handleSendValue("temp")}>
//                 Enviar
//               </Button>
//             </div>
//           </CardContent>
//         </Card>

//         <Card>
//           <CardHeader>
//             <CardTitle>Polinômio de correção de brancura</CardTitle>
//           </CardHeader>
//           <CardContent>
//             <div className="grid grid-cols-3 gap-4 mb-4">
//               <div className="grid gap-2">
//                 <Label htmlFor="white-a">a</Label>
//                 <Input
//                   id="white-a"
//                   value={whitenessCorrection.a}
//                   onChange={(e) => setWhitenessCorrection({ ...whitenessCorrection, a: e.target.value })}
//                   className="bg-slate-800 text-white"
//                 />
//               </div>
//               <div className="grid gap-2">
//                 <Label htmlFor="white-b">b</Label>
//                 <Input
//                   id="white-b"
//                   value={whitenessCorrection.b}
//                   onChange={(e) => setWhitenessCorrection({ ...whitenessCorrection, b: e.target.value })}
//                   className="bg-slate-800 text-white"
//                 />
//               </div>
//               <div className="grid gap-2">
//                 <Label htmlFor="white-c">c</Label>
//                 <Input
//                   id="white-c"
//                   value={whitenessCorrection.c}
//                   onChange={(e) => setWhitenessCorrection({ ...whitenessCorrection, c: e.target.value })}
//                   className="bg-slate-800 text-white"
//                 />
//               </div>
//             </div>
//             <div className="flex justify-center gap-4">
//               <Button variant="outline" size="sm" onClick={() => handleReadValue("white")}>
//                 Ler
//               </Button>
//               <Button variant="outline" size="sm" onClick={() => handleSendValue("white")}>
//                 Enviar
//               </Button>
//             </div>
//           </CardContent>
//         </Card>
//       </div>

//       <Card>
//         <CardHeader>
//           <CardTitle>Parâmetros de Operação</CardTitle>
//         </CardHeader>
//         <CardContent>
//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//             <div className="grid gap-2">
//               <Label htmlFor="offset">Offset de brancura:</Label>
//               <div className="flex gap-2">
//                 <Input
//                   id="offset"
//                   className="bg-slate-800 text-white"
//                   value={offset}
//                   onChange={(e) => setOffset(e.target.value)}
//                 />
//                 <Button variant="outline" size="sm" onClick={() => handleReadValue("offset")}>
//                   Ler
//                 </Button>
//                 <Button variant="outline" size="sm" onClick={handleSetOffset} disabled={isLoading}>
//                   Enviar
//                 </Button>
//               </div>
//             </div>

//             <div className="grid gap-2">
//               <Label htmlFor="gain">Ganho:</Label>
//               <div className="flex gap-2">
//                 <Select value={gain} onValueChange={handleSetGain} disabled={isLoading}>
//                   <SelectTrigger id="gain">
//                     <SelectValue placeholder="Ganho" />
//                   </SelectTrigger>
//                   <SelectContent>
//                     <SelectItem value="0">1x</SelectItem>
//                     <SelectItem value="1">4x</SelectItem>
//                     <SelectItem value="2">16x</SelectItem>
//                     <SelectItem value="3">60x</SelectItem>
//                   </SelectContent>
//                 </Select>
//                 <Button variant="outline" size="sm" onClick={() => handleReadValue("gain")}>
//                   Ler
//                 </Button>
//               </div>
//             </div>

//             <div className="grid gap-2">
//               <Label htmlFor="integration">Tempo de integração:</Label>
//               <div className="flex gap-2">
//                 <Select value={integrationTime} onValueChange={handleSetIntegrationTime} disabled={isLoading}>
//                   <SelectTrigger id="integration">
//                     <SelectValue placeholder="Tempo" />
//                   </SelectTrigger>
//                   <SelectContent>
//                     <SelectItem value="0">2,4 ms</SelectItem>
//                     <SelectItem value="1">24 ms</SelectItem>
//                     <SelectItem value="2">50 ms</SelectItem>
//                     <SelectItem value="3">101 ms</SelectItem>
//                     <SelectItem value="4">154 ms</SelectItem>
//                     <SelectItem value="5">700 ms</SelectItem>
//                   </SelectContent>
//                 </Select>
//                 <Button variant="outline" size="sm" onClick={() => handleReadValue("integration")}>
//                   Ler
//                 </Button>
//               </div>
//             </div>

//             <div className="grid gap-2">
//               <Label htmlFor="mode">Modo:</Label>
//               <div className="flex gap-2">
//                 <Select value={mode} onValueChange={(value) => handleSetAutoMode(value === "0")} disabled={isLoading}>
//                   <SelectTrigger id="mode">
//                     <SelectValue placeholder="Modo" />
//                   </SelectTrigger>
//                   <SelectContent>
//                     <SelectItem value="0">AUTOMÁTICO</SelectItem>
//                     <SelectItem value="1">MANUAL</SelectItem>
//                   </SelectContent>
//                 </Select>
//                 <Button variant="outline" size="sm" onClick={() => handleReadValue("mode")}>
//                   Ler
//                 </Button>
//               </div>
//             </div>

//             <div className="grid gap-2">
//               <Label htmlFor="min-whiteness">Brancura mínima (%):</Label>
//               <div className="flex gap-2">
//                 <Input
//                   id="min-whiteness"
//                   className="bg-slate-800 text-white"
//                   value={minWhiteness}
//                   onChange={(e) => setMinWhiteness(e.target.value)}
//                 />
//                 <Button variant="outline" size="sm" onClick={() => handleReadValue("min-whiteness")}>
//                   Ler
//                 </Button>
//               </div>
//             </div>

//             <div className="grid gap-2">
//               <Label htmlFor="max-whiteness">Brancura máxima (%):</Label>
//               <div className="flex gap-2">
//                 <Input
//                   id="max-whiteness"
//                   className="bg-slate-800 text-white"
//                   value={maxWhiteness}
//                   onChange={(e) => setMaxWhiteness(e.target.value)}
//                 />
//                 <Button variant="outline" size="sm" onClick={() => handleReadValue("max-whiteness")}>
//                   Ler
//                 </Button>
//               </div>
//             </div>

//             <div className="col-span-2">
//               <Button
//                 onClick={handleSetBrightnessLimits}
//                 disabled={!minWhiteness || !maxWhiteness || isLoading}
//                 className="bg-[#00A651] hover:bg-[#008a43] text-white"
//               >
//                 Atualizar Limites de Brancura
//               </Button>
//             </div>

//             <div className="grid gap-2">
//               <Label>Controle de LED:</Label>
//               <div className="flex gap-2">
//                 <Button
//                   variant={ledStatus ? "default" : "outline"}
//                   className={ledStatus ? "bg-[#00A651]" : ""}
//                   onClick={() => setLedStatus(true)}
//                   disabled={isLoading}
//                 >
//                   Liga LED
//                 </Button>
//                 <Button
//                   variant={!ledStatus ? "default" : "outline"}
//                   className={!ledStatus ? "bg-red-500" : ""}
//                   onClick={() => setLedStatus(false)}
//                   disabled={isLoading}
//                 >
//                   Desliga LED
//                 </Button>
//               </div>
//             </div>
//           </div>
//         </CardContent>
//       </Card>
//     </div>
//   )
// }

"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { WhitekonService, setToastInstance as setGlobalToast } from "@/lib/whitekon-service" //
import { useToast } from "@/hooks/use-toast" //
import { WhitekonRegisters, OperationModes, ControlModes } from "@/lib/whitekon-registers" //

interface ProgramTabProps {
  whitekonId: number
}

export function ProgramTab({ whitekonId }: ProgramTabProps) {
  const [calibrationActive, setCalibrationActive] = useState(false)
  const [controlMode, setControlMode] = useState<number>(ControlModes.AUTOMATICO); 
  const [integrationTime, setIntegrationTime] = useState("1") 
  const [gain, setGain] = useState("0") 
  const [ledStatusDisplay, setLedStatusDisplay] = useState(false);
  const [whitekonData, setWhitekonData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isLedControlLoading, setIsLedControlLoading] = useState(false);

  const { toast } = useToast() //
  const whitekonService = WhitekonService.getInstance()

  useEffect(() => {
    setGlobalToast(toast);
  }, [toast]);

  const [temperatureCorrection, setTemperatureCorrection] = useState({ a: "", b: "", c: "" })
  const [whitenessCorrection, setWhitenessCorrection] = useState({ a: "", b: "", c: "" })
  const [offset, setOffset] = useState("")
  const [minWhiteness, setMinWhiteness] = useState("")
  const [maxWhiteness, setMaxWhiteness] = useState("")

  const fetchDeviceParameters = useCallback(async () => {
    if (!whitekonService.isConnected()) return;
    console.log("ProgramTab: Buscando parâmetros do dispositivo...");
    setIsLoading(true);
    try {
        const modeVal = await whitekonService.readSingleRegister(WhitekonRegisters.AUTOMATICO_MANUAL);
        if (modeVal !== null) setControlMode(modeVal);

        const ledCtrlVal = await whitekonService.readSingleRegister(WhitekonRegisters.CONTROLE_REMOTO);
        if (ledCtrlVal !== null) setLedStatusDisplay((ledCtrlVal & 0x01) === 0x01);
        
        const gainTimeVal = await whitekonService.readSingleRegister(WhitekonRegisters.TEMPO_INTEGRACAO_E_GANHO);
        if (gainTimeVal !== null) {
            setGain((gainTimeVal & 0xFF).toString());
            setIntegrationTime(((gainTimeVal >> 8) & 0xFF).toString());
        }
        const offsetVal = await whitekonService.readSingleRegister(WhitekonRegisters.OFFSET);
        if (offsetVal !== null) setOffset((offsetVal / 10.0).toFixed(1));

        const minBrVal = await whitekonService.readSingleRegister(WhitekonRegisters.BRANCURA_MINIMA);
        if (minBrVal !== null) setMinWhiteness((minBrVal / 10.0).toFixed(1));
        
        const maxBrVal = await whitekonService.readSingleRegister(WhitekonRegisters.BRANCURA_MAXIMA);
        if (maxBrVal !== null) setMaxWhiteness((maxBrVal / 10.0).toFixed(1));

        toast({title: "Parâmetros Lidos", description: "Valores de configuração foram carregados do dispositivo."});

    } catch (error: any) {
      toast({ title: "Erro ao Ler Parâmetros", description: error.message || "Falha ao buscar configurações.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }, [whitekonService, toast]);

  useEffect(() => {
    const handleData = (data: any) => setWhitekonData(data);
    const unsubscribeData = whitekonService.onDataUpdate(handleData);
    
    const handleConnection = (isConnected: boolean) => {
        if (isConnected) {
            fetchDeviceParameters(); 
        } else {
            setControlMode(ControlModes.AUTOMATICO);
            setLedStatusDisplay(false);
            setOffset(""); setMinWhiteness(""); setMaxWhiteness("");
        }
    };
    const unsubscribeConnection = whitekonService.onConnectionStatusChange(handleConnection);
    
    if (whitekonService.isConnected()) {
        fetchDeviceParameters();
    }

    return () => {
      unsubscribeData();
      unsubscribeConnection();
    };
  }, [fetchDeviceParameters, whitekonService]);


  const handleCalibrationToggle = async () => {
    if (!whitekonService.isConnected()) { toast({title:"Desconectado", variant: "destructive"}); return; } // CORRIGIDO
    setIsLoading(true);
    const newModeForDevice = !calibrationActive ? OperationModes.CALIBRACAO : OperationModes.NORMAL;
    try {
        const success = await whitekonService.setOperationMode(newModeForDevice);
        if (success) {
            setCalibrationActive(!calibrationActive); 
            toast({ title: !calibrationActive ? "Calibração Ativada" : "Calibração Desativada" });
        } else {
            toast({ title: "Falha", description: "Não foi possível alterar o modo de operação.", variant: "destructive" });
        }
    } catch (e:any) { toast({ title: "Erro", description: e.message, variant: "destructive" }); }
    finally { setIsLoading(false); }
  };

  const handleCalibrateDark = async () => {
    if (!whitekonService.isConnected()) { toast({title:"Desconectado", variant: "destructive"}); return; } // CORRIGIDO
    setIsLoading(true);
    try {
        const success = await whitekonService.calibrateDark();
        toast({ title: success ? "Calibração de Escuro Iniciada" : "Falha na Calibração de Escuro", variant: success ? "default" : "destructive"});
    } catch (e:any) { toast({ title: "Erro", description: e.message, variant: "destructive" }); }
    finally { setIsLoading(false); }
  };
  const handleCalibrateWhite = async () => {
    if (!whitekonService.isConnected()) { toast({title:"Desconectado", variant: "destructive"}); return; } // CORRIGIDO
    setIsLoading(true);
    try {
        const success = await whitekonService.calibrateWhite();
        toast({ title: success ? "Calibração de Claro Iniciada" : "Falha na Calibração de Claro", variant: success ? "default" : "destructive"});
    } catch (e:any) { toast({ title: "Erro", description: e.message, variant: "destructive" }); }
    finally { setIsLoading(false); }
  };

  const handleSetAutoOrManualMode = async (newModeIsAutoStr: string) => {
    if (!whitekonService.isConnected()) { toast({title:"Desconectado", variant: "destructive"}); return; } // CORRIGIDO
    setIsLoading(true);
    const newModeIsAuto = newModeIsAutoStr === ControlModes.AUTOMATICO.toString();
    try {
      const success = await whitekonService.setAutoMode(newModeIsAuto);
      if (success) {
        setControlMode(newModeIsAuto ? ControlModes.AUTOMATICO : ControlModes.MANUAL);
        toast({ title: newModeIsAuto ? "Modo Automático Ativado" : "Modo Manual Ativado"});
      } else {
        toast({ title: "Falha", description: `Não foi possível ativar modo ${newModeIsAuto ? "automático" : "manual"}.`, variant: "destructive"});
      }
    } catch (error: any) { toast({ title: "Erro", description: `Erro ao alterar modo: ${error.message}`, variant: "destructive"}); }
    finally { setIsLoading(false); }
  };
  
  const handleSetIntegrationTime = async (value: string) => {
    if (!whitekonService.isConnected()) { toast({title:"Desconectado", variant: "destructive"}); return; } // CORRIGIDO
    setIsLoading(true);
    try {
        const success = await whitekonService.setIntegrationTime(Number(value));
        if(success) { setIntegrationTime(value); toast({title: "Tempo de Integração Atualizado"}); }
        else { toast({title: "Falha", description: "Não foi possível alterar o tempo de integração.", variant: "destructive"});}
    } catch (e:any) { toast({ title: "Erro", description: e.message, variant: "destructive" }); }
    finally { setIsLoading(false); }
  };

  const handleSetGain = async (value: string) => {
    if (!whitekonService.isConnected()) { toast({title:"Desconectado", variant: "destructive"}); return; } // CORRIGIDO
    setIsLoading(true);
    try {
        const success = await whitekonService.setGain(Number(value));
        if(success) { setGain(value); toast({title: "Ganho Atualizado"}); }
        else { toast({title: "Falha", description: "Não foi possível alterar o ganho.", variant: "destructive"});}
    } catch (e:any) { toast({ title: "Erro", description: e.message, variant: "destructive" }); }
    finally { setIsLoading(false); }
  };

  const handleSetOffset = async () => {
    if (!whitekonService.isConnected()) { toast({title:"Desconectado", variant: "destructive"}); return; } // CORRIGIDO
    if (!offset) { toast({title:"Valor Necessário", description: "O campo offset não pode estar vazio.", variant: "destructive"}); return; } // CORRIGIDO
    setIsLoading(true);
    try {
        const success = await whitekonService.setOffset(parseFloat(offset));
        toast({title: success ? "Offset Atualizado" : "Falha ao Atualizar Offset", variant: success ? "default" : "destructive"});
    } catch (e:any) { toast({ title: "Erro", description: e.message, variant: "destructive" }); }
    finally { setIsLoading(false); }
  };

  const handleSetBrightnessLimits = async () => {
    if (!whitekonService.isConnected()) { toast({title:"Desconectado", variant: "destructive"}); return; } // CORRIGIDO
    if (!minWhiteness || !maxWhiteness) { toast({title:"Valores Necessários", description: "Os campos de brancura mínima e máxima são obrigatórios.", variant: "destructive"}); return; } // CORRIGIDO
    setIsLoading(true);
    try {
        const success = await whitekonService.setBrightnessLimits(parseFloat(minWhiteness), parseFloat(maxWhiteness));
        toast({title: success ? "Limites de Brancura Atualizados" : "Falha ao Atualizar Limites", variant: success ? "default" : "destructive"});
    } catch (e:any) { toast({ title: "Erro", description: e.message, variant: "destructive" }); }
    finally { setIsLoading(false); }
  };

  const handleToggleLed = async (turnOn: boolean) => {
    if (!whitekonService.isConnected()) { toast({title:"Desconectado", variant: "destructive"}); return; } // CORRIGIDO
    if (turnOn && controlMode !== ControlModes.MANUAL) {
        toast({ title: "Operação Não Permitida", description: "LED só pode ser LIGADO em modo MANUAL.", variant: "destructive" });
        return;
    }
    setIsLedControlLoading(true);
    try {
        const success = await whitekonService.setLedState(turnOn);
        if (success) { setLedStatusDisplay(turnOn); toast({ title: `LED ${turnOn ? "Ligado" : "Desligado"}` }); }
        else { toast({ title: "Falha", description: `Não foi possível ${turnOn ? "ligar" : "desligar"} o LED.`, variant: "destructive"});}
    } catch (error: any) { toast({ title: "Erro", description: `Erro ao controlar LED: ${error.message}`, variant: "destructive"}); }
    finally { setIsLedControlLoading(false); }
  };

  const rgbValues = whitekonData?.rgb || { red: "---", green: "---", blue: "---", clear: "---" };
  const whitenessValues = whitekonData?.brancura ? {
    whiteness: whitekonData.brancura.media?.toFixed(1) || "---",
    corrected: whitekonData.brancura.online?.toFixed(1) || "---",
  } : { whiteness: "---", corrected: "---" };

  const isGlobalLoading = isLoading || !whitekonService.isConnected();
  const isLedLigaDisabled = ledStatusDisplay || controlMode !== ControlModes.MANUAL || isLedControlLoading || isGlobalLoading;
  const isLedDesligaDisabled = !ledStatusDisplay || isLedControlLoading || isGlobalLoading;

  return (
    <div className="grid gap-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle>Leituras RGB e Brancura</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            <div>
              <div className="grid gap-2">
                <div className="flex justify-between"><Label className="text-red-500 font-bold">RED</Label><span className="font-mono">{rgbValues.red}</span></div>
                <div className="flex justify-between"><Label className="text-green-500 font-bold">GREEN</Label><span className="font-mono">{rgbValues.green}</span></div>
                <div className="flex justify-between"><Label className="text-blue-500 font-bold">BLUE</Label><span className="font-mono">{rgbValues.blue}</span></div>
                <div className="flex justify-between"><Label>CLEAR</Label><span className="font-mono">{rgbValues.clear}</span></div>
              </div>
            </div>
            <div>
              <div className="grid gap-2">
                <div className="flex justify-between"><Label className="text-yellow-500 font-bold">BRANCURA</Label><span className="font-mono">{whitenessValues.whiteness}%</span></div>
                <div className="flex justify-between"><Label>BR S/ CORR.</Label><span className="font-mono">{whitenessValues.corrected}%</span></div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Calibração</CardTitle></CardHeader>
          <CardContent className="grid gap-4">
            <div className="flex flex-col gap-2">
              <Button onClick={handleCalibrationToggle} disabled={isGlobalLoading} className={calibrationActive ? "bg-red-500 hover:bg-red-600" : "bg-[#00A651] hover:bg-[#008a43]"}>
                {isLoading && !calibrationActive ? "Ativando..." : isLoading && calibrationActive ? "Desativando..." : calibrationActive ? "DESATIVAR CALIBRAÇÃO" : "ATIVAR CALIBRAÇÃO"}
              </Button>
              <div className="grid grid-cols-2 gap-2 mt-2">
                <Button variant="outline" onClick={handleCalibrateDark} disabled={!calibrationActive || isGlobalLoading}>Calibra Preto</Button>
                <Button variant="outline" onClick={handleCalibrateWhite} disabled={!calibrationActive || isGlobalLoading}>Calibra Branco</Button>
              </div>
              <div className="mt-4 text-center">
                <div className={`inline-block px-4 py-2 border rounded-md ${calibrationActive ? "border-yellow-500" : "border-gray-300"}`}>
                  <span className={calibrationActive ? "text-yellow-500 font-bold" : "text-gray-500"}>{calibrationActive ? "CALIBRA HABILITADO" : "CALIBRA DESABILITADO"}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle>Polinômio de correção de temperatura</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="grid gap-2"><Label htmlFor="temp-a">a</Label><Input id="temp-a" value={temperatureCorrection.a} onChange={(e) => setTemperatureCorrection({ ...temperatureCorrection, a: e.target.value })} disabled={isGlobalLoading} /></div>
              <div className="grid gap-2"><Label htmlFor="temp-b">b</Label><Input id="temp-b" value={temperatureCorrection.b} onChange={(e) => setTemperatureCorrection({ ...temperatureCorrection, b: e.target.value })} disabled={isGlobalLoading} /></div>
              <div className="grid gap-2"><Label htmlFor="temp-c">c</Label><Input id="temp-c" value={temperatureCorrection.c} onChange={(e) => setTemperatureCorrection({ ...temperatureCorrection, c: e.target.value })} disabled={isGlobalLoading} /></div>
            </div>
            <div className="flex justify-center gap-4">
              <Button variant="outline" size="sm" disabled>Ler</Button>
              <Button variant="outline" size="sm" disabled>Enviar</Button>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Polinômio de correção de brancura</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 mb-4">
               <div className="grid gap-2"><Label htmlFor="white-a">a</Label><Input id="white-a" value={whitenessCorrection.a} onChange={(e) => setWhitenessCorrection({ ...whitenessCorrection, a: e.target.value })} disabled={isGlobalLoading} /></div>
               <div className="grid gap-2"><Label htmlFor="white-b">b</Label><Input id="white-b" value={whitenessCorrection.b} onChange={(e) => setWhitenessCorrection({ ...whitenessCorrection, b: e.target.value })} disabled={isGlobalLoading} /></div>
               <div className="grid gap-2"><Label htmlFor="white-c">c</Label><Input id="white-c" value={whitenessCorrection.c} onChange={(e) => setWhitenessCorrection({ ...whitenessCorrection, c: e.target.value })} disabled={isGlobalLoading} /></div>
            </div>
             <div className="flex justify-center gap-4">
              <Button variant="outline" size="sm" disabled>Ler</Button> 
              <Button variant="outline" size="sm" disabled>Enviar</Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Parâmetros de Operação</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="grid gap-2">
              <Label htmlFor="offset">Offset de brancura:</Label>
              <div className="flex gap-2">
                <Input id="offset" value={offset} onChange={(e) => setOffset(e.target.value)} disabled={isGlobalLoading} />
                <Button variant="outline" size="sm" onClick={async () => { if (!whitekonService.isConnected()) return; const v = await whitekonService.readSingleRegister(WhitekonRegisters.OFFSET); if (v !== null) setOffset((v / 10.0).toFixed(1));}} disabled={isGlobalLoading}>Ler</Button>
                <Button variant="outline" size="sm" onClick={handleSetOffset} disabled={isGlobalLoading || !offset}>Enviar</Button>
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="gain">Ganho:</Label>
              <div className="flex gap-2">
                <Select value={gain} onValueChange={handleSetGain} disabled={isGlobalLoading}>
                  <SelectTrigger id="gain"><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="0">1x</SelectItem><SelectItem value="1">4x</SelectItem><SelectItem value="2">16x</SelectItem><SelectItem value="3">60x</SelectItem></SelectContent>
                </Select>
                <Button variant="outline" size="sm" onClick={async () => { if (!whitekonService.isConnected()) return; const v = await whitekonService.readSingleRegister(WhitekonRegisters.TEMPO_INTEGRACAO_E_GANHO); if (v !== null) setGain((v & 0xFF).toString());}} disabled={isGlobalLoading}>Ler</Button>
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="integration">Tempo de integração:</Label>
              <div className="flex gap-2">
                <Select value={integrationTime} onValueChange={handleSetIntegrationTime} disabled={isGlobalLoading}>
                  <SelectTrigger id="integration"><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="0">2,4 ms</SelectItem><SelectItem value="1">24 ms</SelectItem><SelectItem value="2">50 ms</SelectItem><SelectItem value="3">101 ms</SelectItem><SelectItem value="4">154 ms</SelectItem><SelectItem value="5">700 ms</SelectItem></SelectContent>
                </Select>
                <Button variant="outline" size="sm" onClick={async () => { if (!whitekonService.isConnected()) return; const v = await whitekonService.readSingleRegister(WhitekonRegisters.TEMPO_INTEGRACAO_E_GANHO); if (v !== null) setIntegrationTime(((v >> 8) & 0xFF).toString());}} disabled={isGlobalLoading}>Ler</Button>
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="control-mode">Modo de Controle:</Label>
              <div className="flex gap-2">
                <Select value={controlMode.toString()} onValueChange={handleSetAutoOrManualMode} disabled={isGlobalLoading}>
                  <SelectTrigger id="control-mode"><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value={ControlModes.AUTOMATICO.toString()}>AUTOMÁTICO</SelectItem><SelectItem value={ControlModes.MANUAL.toString()}>MANUAL</SelectItem></SelectContent>
                </Select>
                <Button variant="outline" size="sm" onClick={fetchDeviceParameters} disabled={isGlobalLoading}>Ler Atuais</Button>
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="min-whiteness">Brancura mínima (%):</Label>
              <div className="flex gap-2">
                <Input id="min-whiteness" value={minWhiteness} onChange={(e) => setMinWhiteness(e.target.value)} disabled={isGlobalLoading}/>
                <Button variant="outline" size="sm" onClick={async () => { if (!whitekonService.isConnected()) return; const v = await whitekonService.readSingleRegister(WhitekonRegisters.BRANCURA_MINIMA); if (v !== null) setMinWhiteness((v / 10.0).toFixed(1));}} disabled={isGlobalLoading}>Ler</Button>
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="max-whiteness">Brancura máxima (%):</Label>
              <div className="flex gap-2">
                <Input id="max-whiteness" value={maxWhiteness} onChange={(e) => setMaxWhiteness(e.target.value)} disabled={isGlobalLoading} />
                <Button variant="outline" size="sm" onClick={async () => { if (!whitekonService.isConnected()) return; const v = await whitekonService.readSingleRegister(WhitekonRegisters.BRANCURA_MAXIMA); if (v !== null) setMaxWhiteness((v / 10.0).toFixed(1));}} disabled={isGlobalLoading}>Ler</Button>
              </div>
            </div>
            <div className="lg:col-span-3 flex justify-center"> 
              <Button onClick={handleSetBrightnessLimits} disabled={isGlobalLoading || !minWhiteness || !maxWhiteness} className="bg-[#00A651] hover:bg-[#008a43] text-white">Atualizar Limites de Brancura</Button>
            </div>
            <div className="grid gap-2">
              <Label>Controle de LED:</Label>
              <div className="flex gap-2">
                <Button variant={ledStatusDisplay ? "default" : "outline"} className={ledStatusDisplay ? "bg-[#00A651]" : ""} onClick={() => handleToggleLed(true)} disabled={isLedLigaDisabled}>
                  {isLedControlLoading && !ledStatusDisplay ? "Ligando..." : "Liga LED"}
                </Button>
                <Button variant={!ledStatusDisplay ? "default" : "outline"} className={!ledStatusDisplay ? "bg-red-500" : ""} onClick={() => handleToggleLed(false)} disabled={isLedDesligaDisabled}>
                   {isLedControlLoading && ledStatusDisplay ? "Desligando..." : "Desliga LED"}
                </Button>
              </div>
               {controlMode !== ControlModes.MANUAL && (<p className="text-xs text-orange-600">LED só pode ser LIGADO em modo MANUAL.</p>)}
               <p className="text-xs text-gray-500">Estado Atual LED: {ledStatusDisplay ? "Ligado" : "Desligado"}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}