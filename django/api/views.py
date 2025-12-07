from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json
import service_pb2
import service_pb2_grpc
import number_extractor_pb2
import number_extractor_pb2_grpc
import grpc

@csrf_exempt
def fibonacci_many(request):
    if request.method == "POST":
        excel_file = request.FILES.get('file')
        if not excel_file:
            return JsonResponse({"error": "Forneça um arquivo"}, status=400)

        file_bytes = excel_file.read()

        java_channel = grpc.insecure_channel("java-grpc-service:50052")
        java_stub = number_extractor_pb2_grpc.NumberExtractorServiceStub(java_channel)
        extract_response = java_stub.ExtractNumbers(
            number_extractor_pb2.ExcelRequest(file=file_bytes)
        )

        numbers = list(extract_response.numbers)
        
        fibonacci_results = []
        for num in numbers:
            nodejs_channel = grpc.insecure_channel('nodejs-service:50051')
            nodejs_stub = service_pb2_grpc.FibonacciStub(nodejs_channel)
            fib_response = nodejs_stub.Fibonacci(
                service_pb2.FibonacciRequest(n=num),
                timeout=5
            )
            fibonacci_results.append({
                "input": num,
                "fibonacci": int(fib_response.value)
            })
            nodejs_channel.close()
        
        java_channel.close()
        
        return JsonResponse({
            "fibonacci_results": fibonacci_results
        })

    return JsonResponse({"error": "POST required"}, status=400)

@csrf_exempt
def fibonacci_single(request):
    if request.method == "POST":
        data = json.loads(request.body)
        n = int(data.get("n", 0))

        channel = grpc.insecure_channel('nodejs-service:50051')
        stub = service_pb2_grpc.FibonacciStub(channel)
        response = stub.Fibonacci(service_pb2.FibonacciRequest(n=n))

        channel.close()
        return JsonResponse({"fibonacci": response.value})
    return JsonResponse({"error": "POST required"}, status=400)