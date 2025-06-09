# import sys
# import argparse
# import minimalmodbus
# import serial
# import json

# def configure_instrument(port: str, slave_address: int, baudrate: int, timeout: float):
#     """
#     Configura e retorna um objeto Instrument do minimalmodbus.
#     Levanta exceções específicas em caso de falha.
#     """
#     try:
#         instrument = minimalmodbus.Instrument(port, slave_address, mode=minimalmodbus.MODE_RTU)
#         instrument.serial.baudrate = baudrate
#         instrument.serial.bytesize = 8
#         instrument.serial.parity = serial.PARITY_NONE
#         instrument.serial.stopbits = 1
#         instrument.serial.timeout = timeout
#         # instrument.debug = True 
#         return instrument
#     except serial.SerialException as e:
#         print(f"PYTHON_SERIAL_ERROR: Falha ao abrir porta serial {port}: {e}", file=sys.stderr)
#         sys.exit(10) 
#     except Exception as e:
#         print(f"PYTHON_CONFIG_ERROR: Erro ao configurar instrumento: {e}", file=sys.stderr)
#         sys.exit(11)

# def main():
#     parser = argparse.ArgumentParser(
#         description="Ferramenta de linha de comando para comunicação Modbus com o dispositivo WhiteKon."
#     )
#     parser.add_argument("--port", required=True, help="Porta serial (ex: COM8 ou /dev/ttyUSB0)")
#     parser.add_argument("--baudrate", type=int, default=115200, help="Baud rate (padrão: 115200)")
#     parser.add_argument("--unit", type=int, default=4, help="ID do escravo Modbus (padrão: 4)")
#     parser.add_argument("--timeout", type=float, default=1.0, help="Timeout da comunicação Modbus em segundos (padrão: 1.0)")

#     subparsers = parser.add_subparsers(dest="action", required=True, help="Ação a ser executada")

#     test_parser = subparsers.add_parser("test_connection", help="Testa a conexão com o dispositivo lendo um registrador.")
#     test_parser.add_argument("--register", type=int, default=0, help="Registrador para teste de leitura (padrão: 0)")

#     read_parser = subparsers.add_parser("read_registers", help="Lê um ou mais registros Modbus.")
#     read_parser.add_argument("address", type=int, help="Endereço do primeiro registrador a ser lido.")
#     read_parser.add_argument("count", type=int, help="Número de registradores a serem lidos.")
#     read_parser.add_argument("--functioncode", type=int, default=3, choices=[3, 4], help="Código de função Modbus para leitura (3: Holding, 4: Input - padrão: 3).")

#     write_parser = subparsers.add_parser("write_register", help="Escreve em um único registrador Modbus.")
#     write_parser.add_argument("address", type=int, help="Endereço do registrador a ser escrito.")
#     write_parser.add_argument("value", type=int, help="Valor a ser escrito no registrador.")
#     write_parser.add_argument("--functioncode", type=int, default=6, choices=[6, 16], help="Código de função Modbus para escrita (6: Single, 16: Multiple - padrão: 6).")
    
#     args = parser.parse_args()

#     instrument = None
#     try:
#         instrument = configure_instrument(args.port, args.unit, args.baudrate, args.timeout)

#         if args.action == "test_connection":
#             try:
#                 value = instrument.read_register(args.register, functioncode=3) 
#                 print(f"CONNECTED: Register {args.register} value = {value}")
#             except Exception as e:
#                 print(f"PYTHON_MODBUS_ERROR: Teste de leitura do registrador {args.register} falhou: {e}", file=sys.stderr)
#                 sys.exit(20)

#         elif args.action == "read_registers":
#             try:
#                 values = instrument.read_registers(args.address, args.count, functioncode=args.functioncode)
#                 for val in values:
#                     print(val)
#             except Exception as e:
#                 print(f"PYTHON_MODBUS_ERROR: Falha ao ler {args.count} registro(s) de {args.address} (FC{args.functioncode}): {e}", file=sys.stderr)
#                 sys.exit(21)
        
#         elif args.action == "write_register":
#             try:
#                 if args.functioncode == 6:
#                     instrument.write_register(args.address, args.value, functioncode=6)
#                 elif args.functioncode == 16:
#                     instrument.write_registers(args.address, [args.value])
#                 print("WRITE_OK")
#             except Exception as e:
#                 print(f"PYTHON_MODBUS_ERROR: Falha ao escrever {args.value} no registrador {args.address} (FC{args.functioncode}): {e}", file=sys.stderr)
#                 sys.exit(22)

#     except minimalmodbus.NoResponseError:
#         print("PYTHON_MODBUS_ERROR: Sem resposta do dispositivo Modbus. Verifique a conexão e o ID do escravo.", file=sys.stderr)
#         sys.exit(100)
#     except minimalmodbus.InvalidResponseError as e:
#         print(f"PYTHON_MODBUS_ERROR: Resposta inválida do dispositivo Modbus: {e}", file=sys.stderr)
#         sys.exit(101)
#     except serial.SerialException as e:
#         print(f"PYTHON_SERIAL_ERROR: Erro na porta serial {args.port} durante a operação: {e}", file=sys.stderr)
#         sys.exit(102)
#     except Exception as e:
#         print(f"PYTHON_UNEXPECTED_ERROR: Erro inesperado no script: {str(e)}", file=sys.stderr)
#         sys.exit(200)
#     finally:
#         if instrument and instrument.serial.is_open:
#             try:
#                 instrument.serial.close()
#                 # print("PYTHON_DEBUG: Porta serial fechada.", file=sys.stderr) 
#             except Exception as e:
#                 print(f"PYTHON_CLEANUP_ERROR: Erro ao tentar fechar a porta serial: {e}", file=sys.stderr)

# if __name__ == "__main__":
#     main()

import sys
import argparse
import minimalmodbus
import serial
# import json # Não usado ativamente para output agora, mas pode ser útil no futuro

def configure_instrument(port: str, slave_address: int, baudrate: int, timeout: float):
    try:
        instrument = minimalmodbus.Instrument(port, slave_address, mode=minimalmodbus.MODE_RTU)
        instrument.serial.baudrate = baudrate
        instrument.serial.bytesize = 8
        instrument.serial.parity = serial.PARITY_NONE
        instrument.serial.stopbits = 1
        instrument.serial.timeout = timeout
        # instrument.debug = True 
        return instrument
    except serial.SerialException as e:
        print(f"PYTHON_SERIAL_ERROR: Falha ao abrir porta serial {port}: {e}", file=sys.stderr)
        sys.exit(10) 
    except Exception as e:
        print(f"PYTHON_CONFIG_ERROR: Erro ao configurar instrumento: {e}", file=sys.stderr)
        sys.exit(11)

def main():
    parser = argparse.ArgumentParser(
        description="Ferramenta de linha de comando para comunicação Modbus com o dispositivo WhiteKon."
    )
    parser.add_argument("--port", required=True, help="Porta serial (ex: COM8 ou /dev/ttyUSB0)")
    parser.add_argument("--baudrate", type=int, default=115200, help="Baud rate (padrão: 115200)")
    parser.add_argument("--unit", type=int, default=4, help="ID do escravo Modbus (padrão: 4)")
    parser.add_argument("--timeout", type=float, default=1.0, help="Timeout da comunicação Modbus em segundos (padrão: 1.0)")

    subparsers = parser.add_subparsers(dest="action", required=True, help="Ação a ser executada")

    test_parser = subparsers.add_parser("test_connection", help="Testa a conexão com o dispositivo lendo um registrador.")
    test_parser.add_argument("--register", type=int, default=0, help="Registrador para teste de leitura (padrão: 0)")

    read_parser = subparsers.add_parser("read_registers", help="Lê um ou mais registros Modbus.")
    read_parser.add_argument("address", type=int, help="Endereço do primeiro registrador a ser lido.")
    read_parser.add_argument("count", type=int, help="Número de registradores a serem lidos.")
    read_parser.add_argument("--functioncode", type=int, default=3, choices=[3, 4], help="Código de função Modbus para leitura (3: Holding, 4: Input - padrão: 3).")

    write_parser = subparsers.add_parser("write_register", help="Escreve em um único registrador Modbus.")
    write_parser.add_argument("address", type=int, help="Endereço do registrador a ser escrito.")
    write_parser.add_argument("value", type=int, help="Valor a ser escrito no registrador.")
    write_parser.add_argument("--functioncode", type=int, default=6, choices=[6, 16], help="Código de função Modbus para escrita (6: Single, 16: Multiple - padrão: 6).")
    
    args = parser.parse_args()

    instrument = None
    try:
        instrument = configure_instrument(args.port, args.unit, args.baudrate, args.timeout)

        if args.action == "test_connection":
            try:
                value = instrument.read_register(args.register, functioncode=3) 
                print(f"CONNECTED: Register {args.register} value = {value}")
            except Exception as e:
                print(f"PYTHON_MODBUS_ERROR: Teste de leitura do registrador {args.register} falhou: {e}", file=sys.stderr)
                sys.exit(20)

        elif args.action == "read_registers":
            try:
                values = instrument.read_registers(args.address, args.count, functioncode=args.functioncode)
                for val in values:
                    print(val)
            except Exception as e:
                print(f"PYTHON_MODBUS_ERROR: Falha ao ler {args.count} registro(s) de {args.address} (FC{args.functioncode}): {e}", file=sys.stderr)
                sys.exit(21)
        
        elif args.action == "write_register":
            try:
                if args.functioncode == 6:
                    instrument.write_register(args.address, args.value, functioncode=6)
                elif args.functioncode == 16: # FC16 espera uma LISTA de valores. Para escrever um único valor com FC16:
                    instrument.write_registers(args.address, [args.value])
                print("WRITE_OK")
            except Exception as e:
                print(f"PYTHON_MODBUS_ERROR: Falha ao escrever {args.value} no registrador {args.address} (FC{args.functioncode}): {e}", file=sys.stderr)
                sys.exit(22)

    except minimalmodbus.NoResponseError:
        print("PYTHON_MODBUS_ERROR: Sem resposta do dispositivo Modbus. Verifique a conexão e o ID do escravo.", file=sys.stderr)
        sys.exit(100)
    except minimalmodbus.InvalidResponseError as e:
        print(f"PYTHON_MODBUS_ERROR: Resposta inválida do dispositivo Modbus: {e}", file=sys.stderr)
        sys.exit(101)
    except serial.SerialException as e: # Captura erros seriais que podem ocorrer após a configuração inicial
        print(f"PYTHON_SERIAL_ERROR: Erro na porta serial {args.port} durante a operação: {e}", file=sys.stderr)
        sys.exit(102) 
    except Exception as e:
        print(f"PYTHON_UNEXPECTED_ERROR: Erro inesperado no script: {str(e)}", file=sys.stderr)
        sys.exit(200)
    finally:
        if instrument and instrument.serial.is_open:
            try:
                instrument.serial.close()
                # print("PYTHON_DEBUG: Porta serial fechada.", file=sys.stderr) 
            except Exception as e:
                print(f"PYTHON_CLEANUP_ERROR: Erro ao tentar fechar a porta serial: {e}", file=sys.stderr)

if __name__ == "__main__":
    main()