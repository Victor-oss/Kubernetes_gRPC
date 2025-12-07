### 1️⃣ Configuração Base (Baseline)

**Cenário**: Aplicação mínima, sem paralelização.

**Setup**:
```yaml
# Desabilitar HPA (fixar réplicas em 1)
kubectl patch hpa django-hpa -p '{"spec":{"minReplicas":1,"maxReplicas":1}}'
kubectl patch hpa nodejs-hpa -p '{"spec":{"minReplicas":1,"maxReplicas":1}}'
kubectl patch hpa java-hpa -p '{"spec":{"minReplicas":1,"maxReplicas":1}}'

# Verificar
kubectl get hpa
kubectl get pods
```

**Iniciar maquina virtual python**
```bash
python3 -m venv venv
source venv/bin/activate
pip install locust
pip install openpyxl
```

3 cenários diferentes:

Carga normal (wait_time 1-3s)
Carga alta (wait_time 0.5-1s)
Stress test (wait_time 0s)

Cenário 1 - Baseline
========================
Carga: 50 usuários
Duração: 2 minutos
spawn rate: 2 
wait_times: 1–3s e 0.5–1s (mix dos dois perfis).

Numeros entre 5 e 35


comando locust:
```bash
locust -f locustfile.py --host http://localhost:8000         --users 50 --spawn-rate 2 --run-time 2m --headless       --csv=scenario1_baseline
```

CSV: scenario1_baseline_stats.csv

Total: 3.540 requisições, 0 falhas (100% sucesso).

Throughput agregado: ~29,7 req/s.

Latência agregada (ms): mediana 310; média 380,8; min ~9; max ~1.674; P95 1.000; P99 1.300; P99.9 1.600.

Por endpoint:

/api/fib/ — 3.248 req, 0 falhas; mediana 290 ms; média 360 ms; min ~9 ms; max ~1.558 ms; P95 990; P99 1.300; P99.9 1.500.

/api/fib-lote/ — 292 req, 0 falhas; mediana 570 ms; média 611 ms; min ~40 ms; max ~1.674 ms; P95 1.200; P99 1.600; P99.9 1.700.

Requisições:
Total: 3540
Por segundo: ~29,7
Sucesso: 100% Falha: 0%
Latência (ms):
Mínima: ~9
Média: ~381
Máxima: ~1674
P95: 1000
P99: 1300
Taxa de erro:
HTTP 5xx: 0
Timeout: 0
gRPC errors: 0

Observações:
Apenas 1 replicas ativas por serviço (Django, Node.js, Java).
_______________________________

Resumo dos artefatos em scenario1 (Cenário 1 – baseline) coletados com prometheus:

scenario1_baseline_exceptions.csv: vazio (nenhuma exceção registrada).
CPU por Pod (_)-data-2025-12-07 04_50_52.csv (java-grpc-server-b788f4fb-dfklx):
CPU típica: ~0.15–0.30 cores na maior parte do tempo.
Picos relevantes: ~4.5 (01:54:30), 6.02 (01:56:00), 5.96 (01:56:30), ~4.8 (02:04:00), ~4.28 (02:03:30).
Após os picos, volta rápido para ~0.15–0.25.
Memória por Pod (Mi)-data-2025-12-07 04_51_09.csv (mesmo pod):
Estável entre 114–127 Mi quase todo o período.
Pequeno aumento na faixa 02:03–02:04: chega a 134 Mi no pico; depois estabiliza ~125–127 Mi.
Interpretação rápida:

Não há falhas/exceções reportadas.
O Java pod ficou com CPU baixa na maior parte do tempo, mas sofreu rajadas curtas (até ~6 cores, possivelmente ruído de coleta ou carga concentrada). Se esses picos forem reais, valeria correlacionar com o horário do teste Locust para ver se coincidem com a fase de maior throughput.
Memória estável e baixa (< 140 Mi), sem sinais de leak.

---