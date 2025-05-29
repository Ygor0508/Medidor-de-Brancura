"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ConnectionTab } from "@/components/connection-tab"
import { ProgramTab } from "@/components/program-tab"
import { RegistersTab } from "@/components/registers-tab"
import { DashboardTab } from "@/components/dashboard-tab"

export default function Home() {
  const [connected, setConnected] = useState(false)
  const [activeWhitekon, setActiveWhitekon] = useState(1)

  return (
    <div className="container mx-auto p-4">
      <Tabs defaultValue="connection" className="w-full">
        <TabsList className="grid w-full grid-cols-4 mb-4">
          <TabsTrigger value="connection">Conexão</TabsTrigger>
          <TabsTrigger value="program" disabled={!connected}>
            Programa
          </TabsTrigger>
          <TabsTrigger value="registers" disabled={!connected}>
            Registradores
          </TabsTrigger>
          <TabsTrigger value="dashboard" disabled={!connected}>
            Dashboard
          </TabsTrigger>
        </TabsList>
        <TabsContent value="connection">
          <ConnectionTab onConnectionChange={setConnected} />
        </TabsContent>
        <TabsContent value="program">
          <ProgramTab whitekonId={activeWhitekon} />
        </TabsContent>
        <TabsContent value="registers">
          <RegistersTab whitekonId={activeWhitekon} />
        </TabsContent>
        <TabsContent value="dashboard">
          <DashboardTab activeWhitekon={activeWhitekon} onWhitekonChange={setActiveWhitekon} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
