from django.http import JsonResponse
import service_pb2
import service_pb2_grpc
import grpc

def hello(request):
    channel = grpc.insecure_channel('nodejs-service:50051')
    stub = service_pb2_grpc.GreeterStub(channel)
    req = service_pb2.HelloRequest(name='django')
    resp = stub.SayHello(req, timeout=5)
    return JsonResponse({"message": resp.message})
