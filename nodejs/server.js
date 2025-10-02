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
const inverter = grpcObj.inverter;

function invert(call, callback) {
  const input = call.request.name;
  const reversed = input.split("").reverse().join("");
  callback(null, { message: reversed });
}

function main() {
  const server = new grpc.Server();
  server.addService(inverter.Inverter.service, { Invert: invert });
  const addr = '0.0.0.0:50051';
  server.bindAsync(addr, grpc.ServerCredentials.createInsecure(), (err, port) => {
    if (err) {
      console.error('Server bind error:', err);
      return;
    }
    console.log(`gRPC server listening on ${addr}`);
    server.start();
  });
}

main();
