const express = require('express');
const client = require('prom-client');
const reflection = require('@grpc/reflection');
client.collectDefaultMetrics();

const path = require('path');
const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');

const PROTO_PATH = path.join(__dirname, 'service.proto');

const packageDef = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true
});
const grpcObj = grpc.loadPackageDefinition(packageDef);
const fibPackage = grpcObj.fibonacci;

function fib(n) {
  if (n <= 1) return n;
  const a = fib(n - 1);
  const b = fib(n - 2);
  return a + b;
}

function fibonacciHandler(call, callback) {
  const n = call.request.n;

  if (n < 0) {
    return callback({
      code: grpc.status.INVALID_ARGUMENT,
      message: "n deve ser maior ou igual a 0"
    });
  }

  const result = fib(n);
  callback(null, { value: result });
}

function main() {
  const server = new grpc.Server();
  server.addService(fibPackage.Fibonacci.service, { Fibonacci: fibonacciHandler });
  
   const reflectionV1 = reflection.buildServerReflectionProtocol(
    'grpc.reflection.v1.ServerReflection',
    server
  );
  const reflectionV1alpha = reflection.buildServerReflectionProtocol(
    'grpc.reflection.v1alpha.ServerReflection', 
    server
  );


  const addr = '0.0.0.0:50051';
  server.bindAsync(
    addr,
    grpc.ServerCredentials.createInsecure(),
    (err, port) => {
      if (err) {
        console.error('Server bind error:', err);
        return;
      }
      console.log(`gRPC server listening on ${addr}`);
      // SEM server.start() - NÃO É MAIS NECESSÁRIO!
    }
  );
}

main();

const metricsApp = express();
metricsApp.get('/metrics', async (req, res) => {
  res.set('Content-Type', client.register.contentType);
  res.end(await client.register.metrics());
});

// Porta diferente do Java
metricsApp.listen(50053, () => {
  console.log('Node.js metrics server running on port 50053');
});
