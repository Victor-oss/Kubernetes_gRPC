package com.example.number_extractor;

import io.grpc.Server;
import io.grpc.ServerBuilder;
import io.grpc.stub.StreamObserver;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;

import com.example.number_extractor.ExcelRequest;
import com.example.number_extractor.ExcelResponse;
import com.example.number_extractor.NumberExtractorServiceGrpc;

import java.io.ByteArrayInputStream;
import java.util.ArrayList;
import java.util.List;

public class NumberExtractorServer {
    public static void main(String[] args) throws Exception {
        MetricsServer.start();
        Server server = ServerBuilder.forPort(50052)
                .addService(new NumberExtractorServiceImpl())
                .build()
                .start();

        System.out.println("gRPC Server started on port 50052");
        server.awaitTermination();
    }

    static class NumberExtractorServiceImpl extends NumberExtractorServiceGrpc.NumberExtractorServiceImplBase {

        @Override
        public void extractNumbers(ExcelRequest request, StreamObserver<ExcelResponse> responseObserver) {
            byte[] excelData = request.getFile().toByteArray();
            List<Integer> result = new ArrayList<>();

            try (Workbook workbook = new XSSFWorkbook(new ByteArrayInputStream(excelData))) {
                Sheet sheet = workbook.getSheetAt(0);

                for (Row row : sheet) {
                    Cell cell = row.getCell(0);
                    if (cell != null && cell.getCellType() == CellType.NUMERIC) {
                        result.add((int) cell.getNumericCellValue());
                    }
                }

            } catch (Exception e) {
                responseObserver.onError(e);
                return;
            }

            ExcelResponse response = ExcelResponse.newBuilder()
                    .addAllNumbers(result)
                    .build();

            responseObserver.onNext(response);
            responseObserver.onCompleted();
        }
    }
}
