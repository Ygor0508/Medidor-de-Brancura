// import { NextResponse } from "next/server"
// import { exec } from "child_process"
// import { promisify } from "util"
// import path from "path"
// import { Mutex } from 'async-mutex'; // Importar o Mutex

// const execAsync = promisify(exec)
// const pythonScriptMutex = new Mutex(); // Criar uma instância do Mutex

// // Cache do último estado conhecido e parâmetros de conexão
// let lastKnownPort: string | null = null
// let lastKnownBaudrate: number = 115200
// let lastKnownUnit: number = 4
// let isDeviceActuallyConnected: boolean = false

// const PYTHON_SCRIPT_NAME = "whitekon-registers.py"
// const SCRIPT_EXECUTION_TIMEOUT = 15000 
// const STATUS_CHECK_TIMEOUT = 7000 
// const SCRIPT_ACCESS_DELAY = 100; // Pequeno delay em ms antes de executar o script dentro do mutex

// interface WhitekonDecodedData {
//   brancura: { media: number | null; online: number | null; desvio_padrao: number | null }
//   temperatura: { calibracao: number | null; online: number | null }
//   rgb: { red: number | null; green: number | null; blue: number | null; clear: number | null }
//   blue_calibracao: { preto: number | null; branco: number | null }
//   amostras: number | null
//   alarmes?: number | null
// }

// // Wrapper para executar o script Python com mutex e delay
// async function executePythonScriptGuarded(args: string[], operationTimeout = SCRIPT_EXECUTION_TIMEOUT) {
//     const release = await pythonScriptMutex.acquire();
//     console.log("API: Mutex adquirido para execução do script Python.");
//     try {
//         await new Promise(resolve => setTimeout(resolve, SCRIPT_ACCESS_DELAY)); // Adiciona delay
        
//         const scriptPath = path.join(process.cwd(), PYTHON_SCRIPT_NAME);
//         const command = `python "${scriptPath}" ${args.join(" ")}`;
//         console.log(`API Executing Python (guarded): ${command}`);

//         const { stdout, stderr } = await execAsync(command, { timeout: operationTimeout });
        
//         if (stderr && stderr.trim() !== "") {
//             console.error(`API Python Script Error (stderr guarded): ${stderr.trim()}`);
//             // Prioriza stderr para a mensagem de erro se existir
//             return { success: false, error: stderr.trim(), stdout: stdout.trim(), stderr: stderr.trim(), exitCode: null };
//         }
//         console.log(`API Python Script Success (stdout guarded): ${stdout.trim()}`);
//         return { success: true, data: stdout.trim(), stdout: stdout.trim(), stderr: stderr.trim(), exitCode: 0 };

//     } catch (error: any) {
//         console.error(`API Error executing guarded script (args: ${args.join(" ")}):`, error);
//         let errorMessage = `Erro ao executar script: ${error.message || "Erro desconhecido"}`;
//         let errorDetails = error.stderr ? error.stderr.trim() : (error.stdout ? error.stdout.trim() : "");

//         if (error.killed && error.signal === "SIGTERM") {
//             errorMessage = `Timeout (${operationTimeout / 1000}s) ao executar o script Python.`;
//             errorDetails = errorMessage;
//         } else if (error.code === 'ENOENT' || (error.message && error.message.includes("ENOENT"))) {
//             errorMessage = `Script Python ("${PYTHON_SCRIPT_NAME}") não encontrado.`;
//             errorDetails = errorMessage;
//         } else if (error.code) { 
//             errorMessage = `Script Python finalizou com erro (código ${error.code}). Detalhes: ${errorDetails || "N/A"}`;
//         }
        
//         if (error.code === 10 || error.code === 20 || error.code === 21 || error.code === 22 || error.code >= 100) {
//             isDeviceActuallyConnected = false;
//             console.log("API: isDeviceActuallyConnected set to false due to Python script error code (guarded):", error.code);
//         }
        
//         return { success: false, error: errorMessage, stdout: error.stdout || '', stderr: errorDetails, exitCode: error.code };
//     } finally {
//         release();
//         console.log("API: Mutex liberado.");
//     }
// }


// export async function GET(request: Request) {
//   const { searchParams } = new URL(request.url)
//   const action = searchParams.get("action")

//   const port = searchParams.get("port") || lastKnownPort
//   const baudrateStr = searchParams.get("baudrate") || lastKnownBaudrate?.toString()
//   const unitStr = searchParams.get("unit") || lastKnownUnit?.toString()

//   if (!port && action !== 'disconnect') { // disconnect pode ser chamado sem porta conhecida
//     return NextResponse.json({ error: "Porta serial não especificada.", details: "Nenhuma porta ativa ou informada." }, { status: 400 })
//   }
//   const currentBaudrate = baudrateStr ? parseInt(baudrateStr, 10) : 115200
//   const currentUnit = unitStr ? parseInt(unitStr, 10) : 4

//   const baseArgs = port ? [ // Só monta baseArgs se a porta for válida
//     `--port=${port}`,
//     `--baudrate=${currentBaudrate}`,
//     `--unit=${currentUnit}`,
//   ] : [];

//   if (action === "connect") {
//     if(!port) return NextResponse.json({ error: "Porta é obrigatória para conectar."}, {status: 400});
//     const scriptArgs = [...baseArgs, "test_connection"]
//     const result = await executePythonScriptGuarded(scriptArgs) // USA O MUTEX

//     if (result.success && result.data?.includes("CONNECTED")) {
//       isDeviceActuallyConnected = true
//       lastKnownPort = port
//       lastKnownBaudrate = currentBaudrate
//       lastKnownUnit = currentUnit
//       return NextResponse.json({ status: "connected", message: result.data })
//     } else {
//       isDeviceActuallyConnected = false
//       return NextResponse.json(
//         { status: "failed", error: result.error || "Falha ao conectar via script Python.", details: result.stderr || result.stdout },
//         { status: result.error?.includes("Timeout") ? 408 : (result.exitCode === 10 || result.error?.includes("FileNotFoundError") || result.error?.includes("could not open port")) ? 404 : 500 }
//       )
//     }
//   }

//   if (action === "disconnect") {
//     isDeviceActuallyConnected = false
//     console.log("API: Estado interno definido como desconectado via action=disconnect.")
//     // Não precisa limpar lastKnownPort, etc., para permitir reconexão fácil com os mesmos params
//     return NextResponse.json({ status: "disconnected" })
//   }

//   if (action === "status") {
//     if (!lastKnownPort) {
//         isDeviceActuallyConnected = false;
//         return NextResponse.json({ connected: false, message: "Nenhum parâmetro de conexão conhecido para verificar status." })
//     }
//     const statusArgs = [ // Renomeado para evitar conflito com baseArgs acima
//         `--port=${lastKnownPort}`,
//         `--baudrate=${lastKnownBaudrate}`,
//         `--unit=${lastKnownUnit}`,
//         "test_connection",
//         "--register=0" 
//     ];
//     const result = await executePythonScriptGuarded(statusArgs, STATUS_CHECK_TIMEOUT);  // USA O MUTEX

//     isDeviceActuallyConnected = !!(result.success && result.data?.includes("CONNECTED"));
//     if (isDeviceActuallyConnected) {
//         return NextResponse.json({ connected: true, message: "Dispositivo respondeu ao teste de status." });
//     } else {
//         console.log("API: Status check failed. Error:", result.error, "Details:", result.stderr || result.stdout);
//         return NextResponse.json({ connected: false, error: result.error || "Dispositivo não respondeu ao teste de status.", details: result.stderr || result.stdout });
//     }
//   }

//   if (action === "data") {
//     if (!isDeviceActuallyConnected || !lastKnownPort) {
//       return NextResponse.json({ error: "Dispositivo não está conectado ou parâmetros de conexão desconhecidos.", details: `isDeviceActuallyConnected: ${isDeviceActuallyConnected}, lastKnownPort: ${lastKnownPort}` }, { status: 400 })
//     }

//     const registerAddressStr = searchParams.get("register")
//     const countStr = searchParams.get("count")
    
//     const operationBaseArgs = [ // Recria os args com os parâmetros atuais da conexão
//         `--port=${lastKnownPort}`,
//         `--baudrate=${lastKnownBaudrate}`,
//         `--unit=${lastKnownUnit}`,
//     ];
    
//     let scriptReadArgs: string[];

//     if (registerAddressStr) {
//         const addr = parseInt(registerAddressStr, 10);
//         const cnt = countStr ? parseInt(countStr, 10) : 1;
//         if (isNaN(addr) || isNaN(cnt) || cnt < 1) {
//             return NextResponse.json({ error: "Parâmetros 'register' e 'count' inválidos para leitura de dados." }, { status: 400 });
//         }
//         scriptReadArgs = [...operationBaseArgs, "read_registers", addr.toString(), cnt.toString()];
//     } else { 
//         scriptReadArgs = [...operationBaseArgs, "read_registers", "5", "17"];
//     }
    
//     const result = await executePythonScriptGuarded(scriptReadArgs); // USA O MUTEX

//     if (result.success && result.data) {
//       const rawValues = result.data.trim().split("\n");

//       if (registerAddressStr) { 
//         if (rawValues.length === 1 && !countStr) { // Leitura de um único registro
//              return NextResponse.json({ address: parseInt(registerAddressStr, 10), value: parseInt(rawValues[0], 10) });
//         }
//         const numericValues = rawValues.map(v => parseInt(v, 10));
//         // Verifica se a quantidade de valores retornados corresponde ao solicitado
//         const expectedCount = countStr ? parseInt(countStr, 10) : 1;
//         if (numericValues.length !== expectedCount) {
//             console.warn(`API: Para ${registerAddressStr} (count ${expectedCount}), esperados ${expectedCount} valores, recebidos ${numericValues.length}. Raw: ${result.data}`);
//             return NextResponse.json({ error: "Número inesperado de valores retornados pelo script.", details: `Esperado: ${expectedCount}, Recebido: ${numericValues.length}, Valores: ${rawValues.join(',')}` }, { status: 500 });
//         }
//         return NextResponse.json({ values: numericValues });
//       }
      
//       if (rawValues.length < 17) {
//         console.error("API Dados incompletos para dashboard:", rawValues);
//         return NextResponse.json({ error: "Dados incompletos recebidos para dashboard.", details: rawValues.join('|') }, { status: 500 });
//       }
      
//       const data: WhitekonDecodedData = {
//         brancura: {
//           media: parseFloat(rawValues[0]) / 10.0,
//           online: parseFloat(rawValues[16]) / 10.0,
//           desvio_padrao: parseFloat(rawValues[6]) / 100.0,
//         },
//         temperatura: {
//           calibracao: parseFloat(rawValues[1]) / 10.0,
//           online: parseFloat(rawValues[2]) / 10.0,
//         },
//         rgb: {
//           red: parseInt(rawValues[10]), green: parseInt(rawValues[11]),
//           blue: parseInt(rawValues[12]), clear: parseInt(rawValues[13]),
//         },
//         blue_calibracao: { preto: parseInt(rawValues[3]), branco: parseInt(rawValues[4]) },
//         amostras: parseInt(rawValues[14]),
//         alarmes: parseInt(rawValues[5]),
//       };
//       return NextResponse.json(data);
//     } else {
//       console.log("API: Falha na leitura de dados (guarded). Error:", result.error, "Details:", result.stderr || result.stdout);
//       return NextResponse.json({ error: result.error || "Falha ao ler dados do dispositivo.", details: result.stderr || result.stdout }, { status: 500 });
//     }
//   }
//   return NextResponse.json({ error: `Ação GET inválida ou não implementada: ${action}` }, { status: 400 });
// }

// export async function POST(request: Request) {
//   if (!isDeviceActuallyConnected || !lastKnownPort) {
//     return NextResponse.json({ error: "Dispositivo não conectado ou parâmetros de conexão desconhecidos para escrita." }, { status: 400 });
//   }

//   try {
//     const body = await request.json();
//     const { register, value } = body;

//     if (register === undefined || value === undefined || typeof register !== 'number' || typeof value !== 'number') {
//       return NextResponse.json({ error: "Parâmetros 'register' (número) e 'value' (número) são obrigatórios para escrita." }, { status: 400 });
//     }

//     const scriptArgs = [
//       `--port=${lastKnownPort}`,
//       `--baudrate=${lastKnownBaudrate!}`,
//       `--unit=${lastKnownUnit!}`,
//       "write_register",
//       register.toString(),
//       value.toString()
//     ];

//     const result = await executePythonScriptGuarded(scriptArgs); // USA O MUTEX

//     if (result.success && result.data?.includes("WRITE_OK")) {
//       return NextResponse.json({ success: true, message: `Registro ${register} atualizado para ${value} com sucesso.` });
//     } else {
//       return NextResponse.json(
//         { success: false, error: result.error || "Falha ao escrever no registro.", details: result.stderr || result.stdout },
//         { status: 500 }
//       );
//     }
//   } catch (error: any) {
//     console.error("API Erro ao processar requisição POST:", error);
//     return NextResponse.json({ error: `Erro interno ao processar escrita: ${error.message}` }, { status: 500 });
//   }
// }
import { NextResponse } from "next/server"
import { exec } from "child_process"
import { promisify } from "util"
import path from "path"
import { Mutex } from 'async-mutex';

const execAsync = promisify(exec)
const pythonScriptMutex = new Mutex();

let lastKnownPort: string | null = null
let lastKnownBaudrate: number = 115200
let lastKnownUnit: number = 4
let isDeviceActuallyConnected: boolean = false

const PYTHON_SCRIPT_NAME = "whitekon-registers.py" // Certifique-se que este é o nome correto e está na raiz
const SCRIPT_EXECUTION_TIMEOUT = 15000 
const STATUS_CHECK_TIMEOUT = 7000 
const SCRIPT_ACCESS_DELAY = 150; // Aumentado um pouco o delay para dar mais margem à porta serial

interface WhitekonDecodedData {
  brancura: { media: number | null; online: number | null; desvio_padrao: number | null }
  temperatura: { calibracao: number | null; online: number | null }
  rgb: { red: number | null; green: number | null; blue: number | null; clear: number | null }
  blue_calibracao: { preto: number | null; branco: number | null }
  amostras: number | null
  alarmes?: number | null
}

async function executePythonScriptGuarded(args: string[], operationTimeout = SCRIPT_EXECUTION_TIMEOUT) {
    if (!args.some(arg => arg.startsWith('--port='))) {
        console.error("API: Tentativa de executar script Python sem especificar a porta nos argumentos:", args);
        return { success: false, error: "Porta serial não especificada para o script Python.", stdout: '', stderr: 'Porta não fornecida internamente.', exitCode: -1 };
    }

    const release = await pythonScriptMutex.acquire();
    console.log("API: Mutex adquirido para execução do script Python.");
    try {
        await new Promise(resolve => setTimeout(resolve, SCRIPT_ACCESS_DELAY));
        
        const scriptPath = path.join(process.cwd(), PYTHON_SCRIPT_NAME);
        const command = `python "${scriptPath}" ${args.join(" ")}`;
        console.log(`API Executing Python (guarded): ${command}`);

        const { stdout, stderr } = await execAsync(command, { timeout: operationTimeout });
        
        if (stderr && stderr.trim() !== "") {
            const trimmedStderr = stderr.trim();
            console.error(`API Python Script Error (stderr guarded): ${trimmedStderr}`);
            // Se o erro for de permissão ou falha ao abrir a porta, marca como desconectado
            if (trimmedStderr.includes("PermissionError") || trimmedStderr.includes("could not open port")) {
                isDeviceActuallyConnected = false;
                console.log("API: isDeviceActuallyConnected set to false due to Python serial/permission error.");
            }
            return { success: false, error: trimmedStderr, stdout: stdout.trim(), stderr: trimmedStderr, exitCode: null };
        }
        console.log(`API Python Script Success (stdout guarded): ${stdout.trim()}`);
        return { success: true, data: stdout.trim(), stdout: stdout.trim(), stderr: stderr.trim(), exitCode: 0 };

    } catch (error: any) {
        console.error(`API Error executing guarded script (args: ${args.join(" ")}):`, error);
        let errorMessage = `Erro ao executar script: ${error.message || "Erro desconhecido"}`;
        let errorDetails = error.stderr ? error.stderr.trim() : (error.stdout ? error.stdout.trim() : "N/A");

        if (error.killed && error.signal === "SIGTERM") {
            errorMessage = `Timeout (${operationTimeout / 1000}s) ao executar o script Python.`;
            errorDetails = errorMessage;
        } else if (error.code === 'ENOENT' || (error.message && error.message.includes("ENOENT"))) {
            errorMessage = `Script Python ("${PYTHON_SCRIPT_NAME}") não encontrado. Verifique o caminho.`;
            errorDetails = errorMessage;
        } else if (error.code) { 
            errorMessage = `Script Python finalizou com erro (código ${error.code}).`;
            // errorDetails já deve conter stderr ou stdout
        }
        
        // Códigos de erro do script Python que indicam problemas de conexão/serial
        if (error.code === 10 || error.code === 20 || error.code === 21 || error.code === 22 || error.code >= 100 || (error.stderr && (error.stderr.includes("PermissionError") || error.stderr.includes("could not open port")))) {
            isDeviceActuallyConnected = false;
            console.log("API: isDeviceActuallyConnected set to false due to Python script error (catch block):", error.code, error.stderr);
        }
        
        return { success: false, error: errorMessage, stdout: error.stdout?.trim() || '', stderr: errorDetails, exitCode: error.code };
    } finally {
        release();
        console.log("API: Mutex liberado.");
    }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const action = searchParams.get("action")

  const portReq = searchParams.get("port") 
  const baudrateStrReq = searchParams.get("baudrate")
  const unitStrReq = searchParams.get("unit")

  // Prioriza parâmetros da requisição; se não vierem, usa os últimos conhecidos.
  const currentPort = portReq || lastKnownPort;
  const currentBaudrate = baudrateStrReq ? parseInt(baudrateStrReq, 10) : (lastKnownBaudrate || 115200);
  const currentUnit = unitStrReq ? parseInt(unitStrReq, 10) : (lastKnownUnit || 4);

  if (!currentPort && action !== 'disconnect') {
    return NextResponse.json({ error: "Porta serial não especificada ou conhecida.", details: "Nenhuma porta ativa ou informada para a operação." }, { status: 400 })
  }
  
  const baseArgs = currentPort ? [
    `--port=${currentPort}`,
    `--baudrate=${currentBaudrate}`,
    `--unit=${currentUnit}`,
  ] : [];


  if (action === "connect") {
    if(!currentPort) return NextResponse.json({ error: "Porta é obrigatória para conectar."}, {status: 400});
    const scriptArgs = [...baseArgs, "test_connection"]
    const result = await executePythonScriptGuarded(scriptArgs)

    if (result.success && result.data?.includes("CONNECTED")) {
      isDeviceActuallyConnected = true
      lastKnownPort = currentPort // Salva os parâmetros usados na conexão bem-sucedida
      lastKnownBaudrate = currentBaudrate
      lastKnownUnit = currentUnit
      return NextResponse.json({ status: "connected", message: result.data })
    } else {
      isDeviceActuallyConnected = false
      return NextResponse.json(
        { status: "failed", error: result.error || "Falha ao conectar via script Python.", details: result.stderr || result.stdout },
        { status: result.error?.includes("Timeout") ? 408 : (result.exitCode === 10 || result.error?.includes("FileNotFoundError") || result.error?.includes("could not open port")) ? 404 : 500 }
      )
    }
  }

  if (action === "disconnect") {
    isDeviceActuallyConnected = false
    // Não limpar lastKnownPort etc. para facilitar reconexão com mesmos params
    console.log("API: Estado interno definido como desconectado via action=disconnect.")
    return NextResponse.json({ status: "disconnected" })
  }

  if (action === "status") {
    if (!lastKnownPort) { // Se nunca houve uma tentativa de conexão bem-sucedida
        isDeviceActuallyConnected = false;
        return NextResponse.json({ connected: false, message: "Nenhum parâmetro de conexão anterior bem-sucedido para verificar status." })
    }
    // Usa os últimos parâmetros de uma conexão bem-sucedida
    const statusArgs = [
        `--port=${lastKnownPort}`,
        `--baudrate=${lastKnownBaudrate}`,
        `--unit=${lastKnownUnit}`,
        "test_connection",
        "--register=0" 
    ];
    const result = await executePythonScriptGuarded(statusArgs, STATUS_CHECK_TIMEOUT); 

    // A atribuição de isDeviceActuallyConnected é feita dentro do executePythonScriptGuarded em caso de erro
    // Aqui, apenas confirmamos o estado com base no sucesso da operação de status.
    const statusConnected = !!(result.success && result.data?.includes("CONNECTED"));
    if (isDeviceActuallyConnected !== statusConnected) {
        console.warn(`API: Sincronizando isDeviceActuallyConnected com o resultado do status. Anterior: ${isDeviceActuallyConnected}, Atual: ${statusConnected}`);
        isDeviceActuallyConnected = statusConnected;
    }
    
    if (isDeviceActuallyConnected) {
        return NextResponse.json({ connected: true, message: "Dispositivo respondeu ao teste de status." });
    } else {
        console.log("API: Status check failed. Error:", result.error, "Details:", result.stderr || result.stdout);
        return NextResponse.json({ connected: false, error: result.error || "Dispositivo não respondeu ao teste de status.", details: result.stderr || result.stdout });
    }
  }

  if (action === "data") {
    if (!isDeviceActuallyConnected || !lastKnownPort) {
      return NextResponse.json({ error: "Dispositivo não está conectado ou parâmetros de conexão válidos desconhecidos.", details: `isDeviceActuallyConnected: ${isDeviceActuallyConnected}, lastKnownPort: ${lastKnownPort}` }, { status: 400 })
    }

    const registerAddressStr = searchParams.get("register")
    const countStr = searchParams.get("count")
    
    const operationBaseArgs = [
        `--port=${lastKnownPort}`,
        `--baudrate=${lastKnownBaudrate}`,
        `--unit=${lastKnownUnit}`,
    ];
    
    let scriptReadArgs: string[];

    if (registerAddressStr) {
        const addr = parseInt(registerAddressStr, 10);
        const cnt = countStr ? parseInt(countStr, 10) : 1;
        if (isNaN(addr) || isNaN(cnt) || cnt < 1) {
            return NextResponse.json({ error: "Parâmetros 'register' e 'count' inválidos para leitura de dados." }, { status: 400 });
        }
        scriptReadArgs = [...operationBaseArgs, "read_registers", addr.toString(), cnt.toString()];
    } else { 
        scriptReadArgs = [...operationBaseArgs, "read_registers", "5", "17"]; // Padrão para Dashboard
    }
    
    const result = await executePythonScriptGuarded(scriptReadArgs);

    if (result.success && result.data) {
      const rawValues = result.data.trim().split("\n");

      if (registerAddressStr) { 
        const expectedCount = countStr ? parseInt(countStr, 10) : 1;
        if (rawValues.length !== expectedCount) {
            console.warn(`API: Para ${registerAddressStr} (count ${expectedCount}), esperados ${expectedCount} valores, recebidos ${rawValues.length}. Raw: ${result.data}`);
            return NextResponse.json({ error: "Número inesperado de valores retornados pelo script.", details: `Esperado: ${expectedCount}, Recebido: ${rawValues.length}, Valores: ${rawValues.join(',')}` }, { status: 500 });
        }
        if (expectedCount === 1 && !countStr) { // Leitura de um único registro
             return NextResponse.json({ address: parseInt(registerAddressStr, 10), value: parseInt(rawValues[0], 10) });
        }
        const numericValues = rawValues.map(v => parseInt(v, 10));
        return NextResponse.json({ values: numericValues });
      }
      
      if (rawValues.length < 17) { // Leitura para Dashboard
        console.error("API Dados incompletos para dashboard:", rawValues.length, "valores:", rawValues.join("|"));
        return NextResponse.json({ error: "Dados incompletos recebidos para dashboard.", details: `Esperado: 17, Recebido: ${rawValues.length}` }, { status: 500 });
      }
      
      // ATENÇÃO: Revise estas escalas com a documentação do seu dispositivo!
      const data: WhitekonDecodedData = {
        brancura: {
          media: parseFloat(rawValues[0]) / 10.0,      // REG 5  (índice 0 de 17)
          online: parseFloat(rawValues[16]) / 10.0,     // REG 21 (índice 16 de 17)
          desvio_padrao: parseFloat(rawValues[6]) / 100.0,// REG 11 (índice 6 de 17)
        },
        temperatura: {
          calibracao: parseFloat(rawValues[1]) / 10.0, // REG 6 (índice 1 de 17)
          online: parseFloat(rawValues[2]) / 10.0,     // REG 7 (índice 2 de 17)
        },
        rgb: {
          red: parseInt(rawValues[10]),        // REG 15 (índice 10 de 17)
          green: parseInt(rawValues[11]),      // REG 16 (índice 11 de 17)
          blue: parseInt(rawValues[12]),       // REG 17 (índice 12 de 17)
          clear: parseInt(rawValues[13]),      // REG 18 (índice 13 de 17)
        },
        blue_calibracao: { preto: parseInt(rawValues[3]), branco: parseInt(rawValues[4]) },
        amostras: parseInt(rawValues[14]),     // REG 19 (índice 14 de 17)
        alarmes: parseInt(rawValues[5]),       // REG 10 (índice 5 de 17)
      };
      return NextResponse.json(data);
    } else {
      console.log("API: Falha na leitura de dados (guarded). Error:", result.error, "Details:", result.stderr || result.stdout);
      return NextResponse.json({ error: result.error || "Falha ao ler dados do dispositivo.", details: result.stderr || result.stdout }, { status: 500 });
    }
  }
  return NextResponse.json({ error: `Ação GET inválida ou não implementada: ${action}` }, { status: 400 });
}

export async function POST(request: Request) {
  if (!isDeviceActuallyConnected || !lastKnownPort) {
    return NextResponse.json({ error: "Dispositivo não conectado ou parâmetros de conexão válidos desconhecidos para escrita." }, { status: 400 });
  }

  try {
    const body = await request.json();
    const { register, value } = body;

    if (register === undefined || value === undefined || typeof register !== 'number' || typeof value !== 'number') {
      return NextResponse.json({ error: "Parâmetros 'register' (número) e 'value' (número) são obrigatórios para escrita." }, { status: 400 });
    }

    const scriptArgs = [
      `--port=${lastKnownPort}`,
      `--baudrate=${lastKnownBaudrate!}`,
      `--unit=${lastKnownUnit!}`,
      "write_register",
      register.toString(),
      value.toString()
    ];

    const result = await executePythonScriptGuarded(scriptArgs); // USA O MUTEX

    if (result.success && result.data?.includes("WRITE_OK")) {
      return NextResponse.json({ success: true, message: `Registro ${register} atualizado para ${value} com sucesso.` });
    } else {
      return NextResponse.json(
        { success: false, error: result.error || "Falha ao escrever no registro.", details: result.stderr || result.stdout },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error("API Erro ao processar requisição POST:", error);
    return NextResponse.json({ error: `Erro interno ao processar escrita: ${error.message}` }, { status: 500 });
  }
}