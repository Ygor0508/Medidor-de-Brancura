"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"

interface RegistersTabProps {
  whitekonId: number
}

// Modificar para ler registros reais
export function RegistersTab({ whitekonId }: RegistersTabProps) {
  const [registers, setRegisters] = useState<Array<{ address: number; value: string }>>([])
  const [editingRegister, setEditingRegister] = useState<number | null>(null)
  const [editValue, setEditValue] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  // Inicializa os registradores com valores vazios
  useEffect(() => {
    const initialRegisters = Array.from({ length: 57 }, (_, i) => ({
      address: i,
      value: "---",
    }))
    setRegisters(initialRegisters)
  }, [])

  // Função para ler um registro específico
  const handleReadRegister = async (address: number) => {
    setIsLoading(true)
    try {
      // Chama a API para ler o registro específico
      const response = await fetch(`/api/whitekon?action=data&register=${address}`)

      if (!response.ok) {
        throw new Error(`Erro ao ler registro ${address}`)
      }

      const data = await response.json()

      if (data.error) {
        throw new Error(data.error)
      }

      // Extrai o valor do registro da resposta
      const value = data.value !== undefined ? data.value.toString() : "---"

      // Atualiza o valor do registro na lista
      setRegisters((prev) => prev.map((reg) => (reg.address === address ? { ...reg, value } : reg)))

      toast({
        title: "Registro lido",
        description: `Registro ${address} lido com sucesso`,
      })
    } catch (error) {
      console.error(`Erro ao ler registro ${address}:`, error)
      toast({
        title: "Erro na leitura",
        description: `Não foi possível ler o registro ${address}`,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Função para iniciar a edição de um registro
  const handleStartEdit = (address: number, currentValue: string) => {
    setEditingRegister(address)
    setEditValue(currentValue !== "---" ? currentValue : "")
  }

  // Função para salvar o valor editado
  const handleSaveEdit = async () => {
    if (editingRegister === null) return

    setIsLoading(true)
    try {
      // Converte o valor para número
      const numericValue = Number(editValue)

      if (isNaN(numericValue)) {
        throw new Error("Valor inválido")
      }

      // Chama a API para escrever no registro
      const response = await fetch("/api/whitekon", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ register: editingRegister, value: numericValue }),
      })

      if (!response.ok) {
        throw new Error(`Erro ao escrever no registro ${editingRegister}`)
      }

      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error || "Falha na escrita")
      }

      // Atualiza o valor do registro na lista
      setRegisters((prev) => prev.map((reg) => (reg.address === editingRegister ? { ...reg, value: editValue } : reg)))

      toast({
        title: "Registro atualizado",
        description: `Registro ${editingRegister} atualizado com sucesso`,
      })

      // Limpa o estado de edição
      setEditingRegister(null)
      setEditValue("")
    } catch (error) {
      console.error(`Erro ao escrever no registro ${editingRegister}:`, error)
      toast({
        title: "Erro na escrita",
        description: `Não foi possível atualizar o registro ${editingRegister}`,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Função para cancelar a edição
  const handleCancelEdit = () => {
    setEditingRegister(null)
    setEditValue("")
  }

  // Função para ler todos os registros
  const handleReadAllRegisters = async () => {
    setIsLoading(true)
    try {
      // Lê os registros em blocos para não sobrecarregar
      const readBlock = async (start: number, count: number) => {
        const response = await fetch(`/api/whitekon?action=data&register=${start}&count=${count}`)

        if (!response.ok) {
          throw new Error(`Erro ao ler registros ${start}-${start + count - 1}`)
        }

        const data = await response.json()

        if (data.error) {
          throw new Error(data.error)
        }

        return data.values || []
      }

      // Lê os registros em blocos de 10
      const totalRegisters = 57
      const blockSize = 10
      const updatedRegisters = [...registers]

      for (let i = 0; i < totalRegisters; i += blockSize) {
        const count = Math.min(blockSize, totalRegisters - i)
        const values = await readBlock(i, count)

        for (let j = 0; j < values.length; j++) {
          if (i + j < updatedRegisters.length) {
            updatedRegisters[i + j].value = values[j].toString()
          }
        }
      }

      setRegisters(updatedRegisters)

      toast({
        title: "Registros lidos",
        description: "Todos os registros foram lidos com sucesso",
      })
    } catch (error) {
      console.error("Erro ao ler todos os registros:", error)
      toast({
        title: "Erro na leitura",
        description: "Não foi possível ler todos os registros",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Registradores - WhiteKon #{whitekonId}</CardTitle>
        <Button
          onClick={handleReadAllRegisters}
          className="bg-[#00A651] hover:bg-[#008a43] text-white"
          disabled={isLoading}
        >
          {isLoading ? "Carregando..." : "Ler Todos"}
        </Button>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Endereço</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead className="w-[100px]">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {registers.slice(0, 29).map((register) => (
                <TableRow key={register.address}>
                  <TableCell className="font-medium text-blue-600">ENDEREÇO {register.address}</TableCell>
                  <TableCell>
                    {editingRegister === register.address ? (
                      <Input
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        className="bg-slate-800 text-white"
                      />
                    ) : (
                      register.value
                    )}
                  </TableCell>
                  <TableCell>
                    {editingRegister === register.address ? (
                      <div className="flex space-x-1">
                        <Button size="sm" variant="outline" onClick={handleSaveEdit} disabled={isLoading}>
                          Salvar
                        </Button>
                        <Button size="sm" variant="outline" onClick={handleCancelEdit} disabled={isLoading}>
                          Cancelar
                        </Button>
                      </div>
                    ) : (
                      <div className="flex space-x-1">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleReadRegister(register.address)}
                          disabled={isLoading}
                        >
                          Ler
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleStartEdit(register.address, register.value)}
                          disabled={isLoading}
                        >
                          Editar
                        </Button>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Endereço</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead className="w-[100px]">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {registers.slice(29).map((register) => (
                <TableRow key={register.address}>
                  <TableCell className="font-medium text-blue-600">ENDEREÇO {register.address}</TableCell>
                  <TableCell>
                    {editingRegister === register.address ? (
                      <Input
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        className="bg-slate-800 text-white"
                      />
                    ) : (
                      register.value
                    )}
                  </TableCell>
                  <TableCell>
                    {editingRegister === register.address ? (
                      <div className="flex space-x-1">
                        <Button size="sm" variant="outline" onClick={handleSaveEdit} disabled={isLoading}>
                          Salvar
                        </Button>
                        <Button size="sm" variant="outline" onClick={handleCancelEdit} disabled={isLoading}>
                          Cancelar
                        </Button>
                      </div>
                    ) : (
                      <div className="flex space-x-1">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleReadRegister(register.address)}
                          disabled={isLoading}
                        >
                          Ler
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleStartEdit(register.address, register.value)}
                          disabled={isLoading}
                        >
                          Editar
                        </Button>
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
  )
}
