from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json
import service_pb2
import service_pb2_grpc
import grpc

@csrf_exempt
def invert(request):
    if request.method == "POST":
        data = json.loads(request.body)
        user_input = data.get("text", "")

        channel = grpc.insecure_channel('nodejs-service:50051')
        stub = service_pb2_grpc.InverterStub(channel)
        req = service_pb2.InvertRequest(name=user_input)
        resp = stub.Invert(req, timeout=5)

        return JsonResponse({"message": resp.message})

    return JsonResponse({"error": "POST required"}, status=400)
