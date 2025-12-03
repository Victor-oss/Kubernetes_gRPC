from django.http import HttpResponse, JsonResponse
from rest_framework.views import APIView
from rest_framework.parsers import MultiPartParser, FormParser
import grpc
# Importando da pasta onde geramos os arquivos
from grpc_utils import image_pb2, image_pb2_grpc

CHUNK_SIZE = 64 * 1024 # 64KB por pedaço

def generate_chunks(file_obj, operation):
    """Função geradora que envia metadados primeiro, depois pedaços do arquivo."""
    
    # 1. Primeiro envio: Metadados
    metadata = image_pb2.ImageMetadata(operation=operation, file_type="jpg")
    yield image_pb2.ImageUploadRequest(metadata=metadata)

    # 2. Envios seguintes: Chunks de dados
    while True:
        chunk = file_obj.read(CHUNK_SIZE)
        if not chunk:
            break
        yield image_pb2.ImageUploadRequest(chunk_data=chunk)

class GatewayView(APIView):
    parser_classes = (MultiPartParser, FormParser)

    def post(self, request):
        if 'image' not in request.FILES:
            return JsonResponse({'error': 'Nenhuma imagem enviada'}, status=400)

        uploaded_file = request.FILES['image']
        filter_type = request.data.get('filter', 'grayscale')

        try:
            # Conexão gRPC (use o nome do service do k8s se estiver lá)
            with grpc.insecure_channel('python-service:50052') as channel:
                stub = image_pb2_grpc.ImageServiceStub(channel)
                
                # Chamada Streaming: Passamos o gerador (função) como argumento
                response = stub.ProcessImage(generate_chunks(uploaded_file, filter_type))

            if response.success:
                return HttpResponse(response.image_data, content_type="image/jpeg")
            else:
                return JsonResponse({'error': response.error_message}, status=500)

        except grpc.RpcError as e:
            return JsonResponse({'error': f'Erro gRPC: {e.details()}'}, status=503)