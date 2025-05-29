import { NextResponse } from "next/server"
import { exec } from "child_process"
import { promisify } from "util"
import path from "path"

const execAsync = promisify(exec)

interface WhitekonData {
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

// Variáveis para controlar a conexão real
let connected = false
let port = ""
let baudrate = 115200
let unit = 4

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const action = searchParams.get("action")

  if (action === "connect") {
    const portParam = searchParams.get("port")
    const baudrateParam = searchParams.get("baudrate")
    const unitParam = searchParams.get("unit")

    if (!portParam) {
      return NextResponse.json({ status: "failed", error: "Porta não especificada" }, { status: 400 })
    }

    port = portParam
    baudrate = baudrateParam ? Number.parseInt(baudrateParam) : 115200
    unit = unitParam ? Number.parseInt(unitParam) : 4

    console.log(`Tentando conectar: porta=${port}, baudrate=${baudrate}, unidade=${unit}`)

    try {
      // Usa path.join para criar um caminho compatível com o sistema operacional
      const scriptPath = path.join(process.cwd(), "whitekon-registers.py")
      console.log(
        `Executando script: python "${scriptPath}" --port=${port} --baudrate=${baudrate} --unit=${unit} --test`,
      )

      // Executa com timeout
      const execPromise = execAsync(
        `python "${scriptPath}" --port=${port} --baudrate=${baudrate} --unit=${unit} --test`,
        { timeout: 10000 }, // 10 segundos de timeout
      )

      const { stdout, stderr } = await execPromise

      console.log("Saída do script:", stdout)
      if (stderr) console.error("Erro do script:", stderr)

      if (stdout.includes("CONNECTED")) {
        connected = true
        return NextResponse.json({ status: "connected" })
      } else {
        connected = false
        return NextResponse.json(
          {
            status: "failed",
            error: stderr || stdout || "Falha na conexão. Verifique se o dispositivo está conectado.",
          },
          { status: 400 },
        )
      }
    } catch (execError: any) {
      console.error("Erro ao executar script Python:", execError)

      // Verifica se é um erro de timeout
      if (execError.killed && execError.signal === "SIGTERM") {
        return NextResponse.json(
          {
            status: "failed",
            error: "Timeout ao tentar conectar. O dispositivo não está respondendo.",
          },
          { status: 408 },
        )
      }

      // Verifica se é um erro de "comando não encontrado"
      if (execError.message && execError.message.includes("ENOENT")) {
        return NextResponse.json(
          {
            status: "failed",
            error:
              "Script Python não encontrado. Verifique se o arquivo whitekon-registers.py está no diretório correto.",
          },
          { status: 500 },
        )
      }

      return NextResponse.json(
        {
          status: "failed",
          error: `Erro ao executar script: ${execError.message || "Erro desconhecido"}`,
        },
        { status: 500 },
      )
    }
  }

  if (action === "disconnect") {
    try {
      // Encerra qualquer conexão ativa
      if (connected) {
        const scriptPath = path.join(process.cwd(), "whitekon-registers.py")
        await execAsync(`python "${scriptPath}" --port=${port} --force --check-status`)
      }
      connected = false
      return NextResponse.json({ status: "disconnected" })
    } catch (error) {
      console.error("Erro ao desconectar:", error)
      return NextResponse.json({ error: "Erro ao desconectar" }, { status: 500 })
    }
  }

  if (action === "status") {
    try {
      if (connected) {
        // Verifica se a conexão ainda está ativa
        const scriptPath = path.join(process.cwd(), "whitekon-registers.py")
        const { stdout } = await execAsync(`python "${scriptPath}" --port=${port} --check-status`)
        connected = stdout.includes("STATUS:CONNECTED")
      }
      return NextResponse.json({ connected })
    } catch (error) {
      console.error("Erro ao verificar status:", error)
      connected = false
      return NextResponse.json({ connected: false })
    }
  }

  if (action === "data") {
    if (!connected) {
      return NextResponse.json({ error: "Não conectado" }, { status: 400 })
    }

    try {
      // Lê os registros necessários para montar o objeto de dados
      const scriptPath = path.join(process.cwd(), "whitekon-registers.py")
      const { stdout, stderr } = await execAsync(
        `python "${scriptPath}" --port=${port} --baudrate=${baudrate} --unit=${unit} --interactive`,
        { input: "read 5 17\n" }, // Lê os registros de 5 a 21 (brancura, temperatura, RGB, etc.)
      )

      if (stderr) {
        console.error("Erro na leitura:", stderr)
        return NextResponse.json({ error: "Erro na leitura dos registros" }, { status: 500 })
      }

      // Processa a saída para extrair os valores dos registros
      const values = stdout
        .trim()
        .split("\n")
        .filter(
          (line) =>
            !line.includes("ERROR") &&
            !line.includes("CONNECTED") &&
            !line.includes("Iniciando") &&
            !line.includes("Portas"),
        )

      if (values.length < 17) {
        console.error("Dados incompletos:", values)
        return NextResponse.json(
          {
            error: "Dados incompletos",
            details: {
              valuesLength: values.length,
              values: values,
            },
          },
          { status: 500 },
        )
      }

      // Converte os valores para números e monta o objeto de dados
      const data: WhitekonData = {
        brancura: {
          media: Number.parseFloat(values[0]) / 10, // Registro 5: BRANCURA_MEDIA
          online: Number.parseFloat(values[16]) / 10, // Registro 21: BRANCURA_ONLINE
          desvio_padrao: Number.parseFloat(values[6]) / 100, // Registro 11: DESVIO_PADRAO
        },
        temperatura: {
          calibracao: Number.parseFloat(values[1]) / 10, // Registro 6: TEMP_CALIBRACAO
          online: Number.parseFloat(values[2]) / 10, // Registro 7: TEMP_ONLINE
        },
        rgb: {
          red: Number.parseInt(values[10]), // Registro 15: RED
          green: Number.parseInt(values[11]), // Registro 16: GREEN
          blue: Number.parseInt(values[12]), // Registro 17: BLUE
          clear: Number.parseInt(values[13]), // Registro 18: CLEAR
        },
        blue_calibracao: {
          preto: Number.parseInt(values[3]), // Registro 8: BLUE_PRETO
          branco: Number.parseInt(values[4]), // Registro 9: BLUE_BRANCO
        },
        amostras: Number.parseInt(values[14]), // Registro 19: CONTADOR_AMOSTRAS
        alarmes: Number.parseInt(values[5]), // Registro 10: ALARMES
      }

      return NextResponse.json(data)
    } catch (error) {
      console.error("Erro ao obter dados:", error)
      return NextResponse.json({ error: "Erro ao obter dados do dispositivo" }, { status: 500 })
    }
  }

  return NextResponse.json({ error: "Ação inválida" }, { status: 400 })
}

export async function POST(request: Request) {
  if (!connected) {
    return NextResponse.json({ error: "Não conectado" }, { status: 400 })
  }

  try {
    const data = await request.json()
    const { register, value } = data

    if (register === undefined || value === undefined) {
      return NextResponse.json({ error: "Parâmetros inválidos" }, { status: 400 })
    }

    // Escreve no registro usando o script Python
    const scriptPath = path.join(process.cwd(), "whitekon-registers.py")
    const { stdout, stderr } = await execAsync(
      `python "${scriptPath}" --port=${port} --baudrate=${baudrate} --unit=${unit} --interactive`,
      { input: `write ${register} ${value}\nexit\n` },
    )

    if (stderr || stdout.includes("ERROR")) {
      console.error("Erro na escrita:", stderr || stdout)
      return NextResponse.json({ error: "Erro ao escrever no registro" }, { status: 500 })
    }

    if (stdout.includes("OK")) {
      // Determina a mensagem de sucesso com base no registro
      let message = `Registro ${register} atualizado para ${value}`

      switch (register) {
        case 0: // MODO_OPERACAO
          message = `Modo de operação alterado para ${value}`
          break
        case 27: // COMANDOS_CALIBRACAO
          if (value === 0x5501) {
            message = "Calibração de escuro iniciada"
          } else if (value === 0x5502) {
            message = "Calibração de claro iniciada"
          }
          break
        case 29: // AUTOMATICO_MANUAL
          message = `Modo ${value === 0 ? "automático" : "manual"} ativado`
          break
        case 34: // TEMPO_INTEGRACAO
          message = "Tempo de integração alterado"
          break
      }

      return NextResponse.json({ success: true, message })
    }

    return NextResponse.json({ error: "Falha na escrita do registro" }, { status: 500 })
  } catch (error) {
    console.error("Erro ao processar requisição:", error)
    return NextResponse.json({ error: "Erro ao processar requisição" }, { status: 500 })
  }
}
