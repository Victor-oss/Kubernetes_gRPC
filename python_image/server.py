import grpc
from concurrent import futures
import time
import numpy as np
import cv2
import sys
# Adicione o caminho dos arquivos gerados se necessário, ou copie a pasta grpc_utils para cá
sys.path.append('./grpc_utils') 
import image_pb2
import image_pb2_grpc

class ImageProcessor(image_pb2_grpc.ImageServiceServicer):
    def ProcessImage(self, request_iterator, context):
        data_buffer = bytearray()
        operation = "grayscale" # default

        # 1. Iterar sobre o stream recebido
        for request in request_iterator:
            if request.HasField("metadata"):
                operation = request.metadata.operation
                print(f"Operação recebida: {operation}")
            elif request.HasField("chunk_data"):
                data_buffer.extend(request.chunk_data)

        if not data_buffer:
             return image_pb2.ImageResponse(success=False, error_message="Nenhum dado recebido")

        try:
            # 2. Processamento (Igual ao anterior)
            nparr = np.frombuffer(data_buffer, np.uint8)
            img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
            
            if img is None:
                return image_pb2.ImageResponse(success=False, error_message="Imagem corrompida")

            # Aplica filtros
            processed_img = img
            if operation == "grayscale":
                processed_img = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
            elif operation == "blur":
                processed_img = cv2.GaussianBlur(img, (15, 15), 0)
            # ... outros filtros ...

            # 3. Retorna a imagem processada (em um único bloco por enquanto)
            _, img_encoded = cv2.imencode('.jpg', processed_img)
            return image_pb2.ImageResponse(image_data=img_encoded.tobytes(), success=True)

        except Exception as e:
            return image_pb2.ImageResponse(success=False, error_message=str(e))

def serve():
    server = grpc.server(futures.ThreadPoolExecutor(max_workers=10))
    image_pb2_grpc.add_ImageServiceServicer_to_server(ImageProcessor(), server)
    server.add_insecure_port('[::]:50052')
    print("Servidor de Imagem (Streaming) rodando na porta 50052...")
    server.start()
    server.wait_for_termination()

if __name__ == '__main__':
    serve()