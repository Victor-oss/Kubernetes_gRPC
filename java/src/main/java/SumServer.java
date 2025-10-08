package com.example.sum;

import io.grpc.Server;
import io.grpc.ServerBuilder;
import io.grpc.stub.StreamObserver;

public class SumServer {
    public static void main(String[] args) throws Exception {
        Server server = ServerBuilder.forPort(50052)
                .addService(new SumServiceImpl())
                .build()
                .start();

        System.out.println("gRPC Server started on port 50052");
        server.awaitTermination();
    }

    static class SumServiceImpl extends SumServiceGrpc.SumServiceImplBase {
        @Override
        public void add(AddRequest request, StreamObserver<AddResponse> responseObserver) {
            int result = request.getA() + request.getB();
            AddResponse response = AddResponse.newBuilder().setSum(result).build();
            responseObserver.onNext(response);
            responseObserver.onCompleted();
        }
    }
}
