# import serial
# import minimalmodbus
# import argparse
# import sys
# import time
# import os
# import fcntl
# import serial.tools.list_ports

# # Define a global variable for the lock file path
# LOCK_FILE = "/tmp/whitekon_registers.lock"

# def create_lock_file():
#     """Creates a lock file to prevent concurrent script executions."""
#     try:
#         lockfile = open(LOCK_FILE, "w")
#         fcntl.flock(lockfile.fileno(), fcntl.LOCK_EX | fcntl.LOCK_NB)
#         return lockfile
#     except IOError:
#         print("Another instance of the script is already running.")
#         sys.exit(1)

# def release_lock_file(lockfile):
#     """Releases the lock file."""
#     fcntl.flock(lockfile.fileno(), fcntl.LOCK_UN)
#     lockfile.close()
#     os.remove(LOCK_FILE)

# def read_register(instrument, register_address, register_description, args):
#     """Reads a register from the Modbus instrument and prints the value."""
#     try:
#         value = instrument.read_register(register_address, 1)  # Read as integer
#         print(f"{register_description}: {value}")
#     except Exception as e:
#         print(f"Erro ao ler {register_description} (endereço {register_address}): {e}")

# # Versão simplificada para Windows - sem dependência de fcntl
# def main():
#     parser = argparse.ArgumentParser(description="Comunicação com o dispositivo WhiteKon via Modbus.")
#     parser.add_argument("--port", required=True, help="Porta serial (ex: COM8)")
#     parser.add_argument("--baudrate", type=int, default=115200, help="Baud rate (default: 115200)")
#     parser.add_argument("--unit", type=int, default=4, help="Endereço Modbus (default: 4)")
#     parser.add_argument("--test", action="store_true", help="Modo teste - apenas verifica conexão")
#     parser.add_argument("--check-status", action="store_true", help="Verifica status da conexão")
#     parser.add_argument("--interactive", action="store_true", help="Modo interativo")
#     parser.add_argument("--force", action="store_true", help="Força execução")
    
#     args = parser.parse_args()
    
#     # Imprime informações para debug
#     print(f"Iniciando script com porta={args.port}, baudrate={args.baudrate}, unit={args.unit}")
#     sys.stdout.flush()
    
#     # Lista portas disponíveis
#     available_ports = [port.device for port in serial.tools.list_ports.comports()]
#     print(f"Portas disponíveis: {available_ports}")
#     sys.stdout.flush()
    
#     # Verifica se a porta existe
#     if args.port not in available_ports:
#         print(f"AVISO: A porta {args.port} não foi encontrada no sistema!")
#         print(f"Portas disponíveis: {available_ports}")
#         sys.stdout.flush()
    
#     # Modo de teste - apenas verifica se consegue abrir a porta
#     if args.test:
#         try:
#             # Tenta abrir a porta serial
#             ser = serial.Serial(args.port, args.baudrate, timeout=1)
#             ser.close()
#             print("CONNECTED")
#             sys.stdout.flush()
#             return
#         except Exception as e:
#             print(f"FAILED: {str(e)}")
#             sys.stdout.flush()
#             return
    
#     # Modo de verificação de status
#     if args.check_status:
#         try:
#             # Tenta abrir a porta serial
#             ser = serial.Serial(args.port, args.baudrate, timeout=1)
#             ser.close()
#             print("STATUS:CONNECTED")
#             sys.stdout.flush()
#             return
#         except Exception as e:
#             print(f"STATUS:DISCONNECTED ({str(e)})")
#             sys.stdout.flush()
#             return
    
#     # Modo interativo - para leitura/escrita de registros
#     if args.interactive:
#         try:
#             # Simula leitura de registros para teste
#             if sys.stdin.isatty():
#                 print("Modo interativo requer entrada via pipe")
#                 return
                
#             while True:
#                 command = sys.stdin.readline().strip()
#                 if not command:
#                     time.sleep(0.1)
#                     continue
                    
#                 parts = command.split()
#                 if parts[0] == 'read' and len(parts) >= 2:
#                     start = int(parts[1])
#                     count = int(parts[2]) if len(parts) > 2 else 1
                    
#                     # Simula valores para teste
#                     for i in range(count):
#                         # Gera valores simulados para cada registro
#                         if start + i == 5:  # BRANCURA_MEDIA
#                             print("850")  # 85.0%
#                         elif start + i == 6:  # TEMP_CALIBRACAO
#                             print("250")  # 25.0°C
#                         elif start + i == 7:  # TEMP_ONLINE
#                             print("260")  # 26.0°C
#                         elif start + i == 8:  # BLUE_PRETO
#                             print("1200")
#                         elif start + i == 9:  # BLUE_BRANCO
#                             print("8500")
#                         elif start + i == 10:  # ALARMES
#                             print("0")
#                         elif start + i == 11:  # DESVIO_PADRAO
#                             print("25")  # 0.25%
#                         elif start + i == 15:  # RED
#                             print("2500")
#                         elif start + i == 16:  # GREEN
#                             print("3000")
#                         elif start + i == 17:  # BLUE
#                             print("2800")
#                         elif start + i == 18:  # CLEAR
#                             print("9000")
#                         elif start + i == 19:  # CONTADOR_AMOSTRAS
#                             print("10")
#                         elif start + i == 20:  # BRANCURA_SEM_CORRECAO
#                             print("840")  # 84.0%
#                         elif start + i == 21:  # BRANCURA_ONLINE
#                             print("845")  # 84.5%
#                         else:
#                             print("0")
                    
#                     sys.stdout.flush()
                    
#                 elif parts[0] == 'write' and len(parts) == 3:
#                     address = int(parts[1])
#                     value = int(parts[2])
#                     print("OK")
#                     sys.stdout.flush()
                    
#                 elif command == 'exit':
#                     break
                    
#                 else:
#                     print(f"ERROR: Comando inválido: {command}")
#                     sys.stdout.flush()
                    
#         except Exception as e:
#             print(f"ERROR: {str(e)}")
#             sys.stdout.flush()
#             return

# if __name__ == "__main__":
#     try:
#         main()
#     except Exception as e:
#         print(f"ERRO CRÍTICO: {str(e)}")
#         sys.stdout.flush()

import sys
import argparse
import minimalmodbus
import serial

def parse_args():
    parser = argparse.ArgumentParser(
        description="Ferramenta de leitura/escrita Modbus RTU"
    )
    parser.add_argument(
        '--port', required=True,
        help='Porta serial (ex.: COM8)'
    )
    parser.add_argument(
        '--baudrate', type=int, default=9600,
        help='Baud rate da conexão (padrão: 9600)'
    )
    parser.add_argument(
        '--unit', type=int, default=1,
        help='ID do escravo Modbus (padrão: 1)'
    )
    parser.add_argument(
        '--timeout', type=float, default=1.0,
        help='Timeout em segundos para leitura/escrita (padrão: 1.0)'
    )
    parser.add_argument(
        '--test', action='store_true',
        help='Lê o registrador 0 para teste de comunicação'
    )
    # Futuras flags: read, write, address, value, etc.
    return parser.parse_args()

def configure_instrument(port: str, unit: int, baudrate: int, timeout: float):
    """
    Cria e configura o objeto Instrument do minimalmodbus.
    """
    instr = minimalmodbus.Instrument(port, unit, mode=minimalmodbus.MODE_RTU)
    instr.serial.baudrate = baudrate
    instr.serial.bytesize = 8
    instr.serial.parity   = serial.PARITY_NONE
    instr.serial.stopbits = 1
    instr.serial.timeout  = timeout
    # opcional: instr.debug = True
    return instr

def main():
    args = parse_args()

    try:
        instr = configure_instrument(
            port=args.port,
            unit=args.unit,
            baudrate=args.baudrate,
            timeout=args.timeout
        )

        if args.test:
            # Leitura de teste: registrador 0, sem decimais
            value = instr.read_register(registeraddress=0, number_of_decimals=0)
            print(f"[OK] Leitura de teste: registrador[0] = {value}")
        else:
            # Aqui você pode implementar outras operações de leitura/escrita,
            # por exemplo, via argumentos --read, --write, --address, --value, etc.
            print("Nenhuma ação especificada. Use --test ou adicione comandos de read/write.")
            sys.exit(0)

    except minimalmodbus.NoResponseError:
        print("[Erro] Sem resposta do escravo Modbus.")
        sys.exit(2)
    except minimalmodbus.InvalidResponseError as e:
        print(f"[Erro] Resposta inválida do escravo: {e}")
        sys.exit(3)
    except Exception as e:
        print(f"[Erro] Exceção não tratada: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()