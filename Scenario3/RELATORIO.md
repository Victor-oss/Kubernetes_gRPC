# Relatório de Análise de Desempenho - Scenario 3: Teste de Stress

## Informações do Teste

**Data de Execução:** 7 de Dezembro de 2025  
**Duração:** 120 segundos  
**Usuários Simultâneos:** 100 (aumento de 100% vs Scenarios 1 e 2)  
**Distribuição de Carga:** Ramp-up linear (0-100 usuários em 30 segundos)  
**Range de Entrada:** Números de 20 a 70  
**Endpoints Testados:** 2 (/api/fib/ e /api/fib-lote/)  
**Configuração de Infraestrutura:** HPA habilitado (2-8 réplicas por serviço)

---

## Resumo Executivo

O teste de stress Scenario 3 revelou **degradação crítica do sistema** sob carga extrema. Das 6.763 requisições processadas, **4.271 falharam com erro HTTP 500** (Internal Server Error), resultando em **taxa de falha de 63,14%**. O sistema demonstrou incapacidade de manter operação estável com 100 usuários simultâneos, apresentando saturação de recursos e colapso de performance após 60 segundos de teste. A latência mediana atingiu 480ms (aumento de 4.700% comparado ao baseline) e percentil P95 alcançou 760ms, com casos extremos ultrapassando 1.400ms.

### Métricas Principais

| Métrica | Resultado | Status |
|---------|-----------|--------|
| Total de Requisições | 6.763 | Alta carga processada |
| **Taxa de Falha** | **63,14%** (4.271 falhas) | ❌ CRÍTICO |
| Requisições Bem-Sucedidas | 2.492 (36,86%) | ❌ Inaceitável |
| Throughput Médio | 56,69 req/s | ⚠️ Abaixo da capacidade nominal |
| **Latência P50** | **480 ms** | ❌ Degradação severa |
| **Latência P95** | **760 ms** | ❌ Experiência ruim |
| **Latência P99** | **890 ms** | ❌ Tail latency extrema |
| Latência Máxima | 1.449,31 ms | ❌ Timeout crítico |

**Classificação de Saúde:** ❌ **CRÍTICO - Sistema não suporta carga de 100 usuários**

---

## Análise de Desempenho por Endpoint

### POST /api/fib/ - Requisições de Número Único

Este endpoint processou a maioria do tráfego (91,67% das requisições totais) e apresentou degradação severa sob stress.

| Métrica | Resultado |
|---------|-----------|
| Requisições Totais | 6.200 |
| **Falhas** | **3.708 (59,81%)** | ❌ |
| Requisições Bem-Sucedidas | 2.492 (40,19%) |
| Throughput | 51,97 req/s |
| Latência P50 | 480 ms |
| Latência P95 | 760 ms |
| Latência P99 | 880 ms |
| Latência Máxima | 1.420,18 ms |

**Análise:** O endpoint principal colapsou sob stress, com quase 60% das requisições resultando em HTTP 500. A latência mediana de 480ms representa degradação de 4.700% comparada ao baseline (10ms). Isso indica saturação de CPU, esgotamento de threads ou timeout de comunicação gRPC.

### POST /api/fib-lote/ - Requisições em Lote

Endpoint de processamento batch apresentou **colapso total** com 100% de taxa de falha.

| Métrica | Resultado |
|---------|-----------|
| Requisições Totais | 563 |
| **Falhas** | **563 (100%)** | ❌ |
| Requisições Bem-Sucedidas | 0 (0%) |
| Throughput | 4,72 req/s |
| Latência P50 | 510 ms |
| Latência P95 | 790 ms |
| Latência P99 | 920 ms |
| Latência Máxima | 1.449,31 ms |

**Análise Crítica:** O endpoint de lote apresentou **100% de taxa de falha**, indicando que operações complexas (múltiplos cálculos Fibonacci por requisição) excedem completamente a capacidade do sistema sob carga extrema. Isso sugere que o backend gRPC (Java ou Node.js) está travando ou rejeitando conexões por sobrecarga.

---

## Perfil de Carga e Comportamento Temporal

### Fase 1: Ramp-up (0-30 segundos, 0-100 usuários)

Durante a fase inicial, o sistema ainda apresentava relativa estabilidade, mas com sinais precoces de degradação.

**Comportamento observado:**
- Segundos 0-10 (5-15 usuários): Taxa de falha inicial de ~50-60%, latência P50 ~40-50ms
- Segundos 10-20 (20-45 usuários): Taxa de falha aumenta para ~60-70%, latência P50 sobe para 30-70ms com spikes até 1.400ms
- Segundos 20-30 (50-100 usuários): Sistema entra em colapso progressivo, falhas atingem 70-80%, latência P50 chega a 82-130ms

**Interpretação:** O sistema começou a falhar imediatamente após atingir 10-15 usuários, indicando que o limite de capacidade está significativamente abaixo de 100 usuários simultâneos.

### Fase 2: Pico Sustentado (30-90 segundos, 100 usuários constantes)

Período de maior degradação, onde o sistema opera em modo de colapso contínuo.

**Comportamento observado:**
- Throughput nominal: 60-64 req/s (mas com 60-65% de falhas)
- Latência P50: aumenta progressivamente de 100ms (30s) para 440ms (90s)
- Latência P95: cresce de 480ms para 740ms
- Taxa de falha: mantém-se entre 60-65% durante todo o período

**Interpretação crítica:** O sistema entra em estado de **saturação permanente**. A latência cresce linearmente ao longo do tempo (de 100ms para 440ms em 60 segundos), sugerindo acúmulo de backlog, exaustão de pool de threads ou memory pressure crescente. A taxa de falha consistente indica que aproximadamente 2/3 das requisições são rejeitadas ou excedem timeout.

### Fase 3: Sustentação Prolongada (90-120 segundos, 100 usuários)

Fase final do teste, onde o sistema se estabiliza em estado degradado permanente.

**Comportamento observado:**
- Latência P50 estabiliza em 450-480ms
- Latência P95 mantém-se em 730-770ms
- Taxa de falha reduz levemente para 55-60%
- Throughput cai para 52-60 req/s

**Interpretação:** O sistema atinge um "novo equilíbrio" degradado, onde aproximadamente metade das requisições são bem-sucedidas com latência 40-50x superior ao baseline. Isso sugere que o autoscaling (HPA) pode ter criado novas réplicas, aliviando parcialmente a pressão, mas sem resolver o problema fundamental de capacidade.

---

## Distribuição de Latência

A distribuição de latência no Scenario 3 apresenta valores extremamente elevados em todos os percentis, indicando experiência de usuário inaceitável.

| Percentil | Latência | Interpretação |
|-----------|----------|----------------|
| P50 | 480 ms | 50% das requisições levam quase meio segundo |
| P66 | 550 ms | 2/3 das requisições excedem 500ms |
| P75 | 600 ms | 3/4 das requisições ultrapassam 600ms |
| P80 | 630 ms | 80% acima de 600ms |
| P90 | 710 ms | 90% acima de 700ms |
| **P95** | **760 ms** | Apenas 5% completam em < 760ms |
| P99 | 890 ms | 1% das requisições leva quase 1 segundo |
| P99.9 | 1.300 ms | 0.1% excede 1,3 segundos |
| P100 (Max) | 1.449,31 ms | Casos extremos próximos a timeout |

**Análise de SLA Compliance:**

❌ **P95 < 100ms:** FALHA (resultado: 760ms, 660% acima do limite)  
❌ **P99 < 200ms:** FALHA (resultado: 890ms, 345% acima do limite)  
❌ **Máximo < 2.000ms:** APROVADO por margem mínima (resultado: 1.449ms)

**Conclusão:** O sistema viola completamente os Service Level Agreements esperados para aplicações interativas. Latências acima de 500ms resultam em experiência de usuário severamente degradada e inaceitável para produção.

---

## Comparação com Scenarios Anteriores

A comparação entre os três scenarios revela claramente o ponto de saturação do sistema.

| Métrica | Scenario 1 (Baseline) | Scenario 2 (Alta Carga) | Scenario 3 (Stress) | Δ S3 vs S1 |
|---------|----------------------|------------------------|---------------------|-----------|
| Usuários | 50 | 50 | 100 | +100% |
| Entrada | 5-35 | 20-70 | 20-70 | = |
| HPA | 1 réplica fixa | 1 réplica fixa | 2-8 réplicas | Autoscaling |
| **Total Requisições** | 3.540 | 4.852 | 6.763 | +91% |
| **Taxa de Falha** | **0%** | **0%** | **63,14%** | ❌ +63,14% |
| **Taxa de Sucesso** | **100%** | **100%** | **36,86%** | ❌ -63,14% |
| Throughput | 29,7 req/s | 40,72 req/s | 56,69 req/s | +91% |
| **Latência P50** | 10 ms | 10 ms | **480 ms** | ❌ +4.700% |
| **Latência P95** | 24 ms | 39 ms | **760 ms** | ❌ +3.067% |
| **Latência P99** | 50 ms | 60 ms | **890 ms** | ❌ +1.680% |
| Latência Máxima | 140 ms | 153,90 ms | 1.449,31 ms | ❌ +935% |

**Interpretação Comparativa:**

O dobro de usuários (50 → 100) resultou em colapso catastrófico do sistema. Enquanto Scenarios 1 e 2 mantiveram 100% de sucesso com latências aceitáveis (10-60ms P99), o Scenario 3 apresentou degradação de múltiplas ordens de magnitude. A latência P50 aumentou 48 vezes, e a taxa de sucesso caiu de 100% para 37%. 

Isso indica que o **limite de capacidade está entre 50 e 100 usuários**, provavelmente em torno de 60-70 usuários simultâneos. O autoscaling (HPA) foi insuficiente para compensar a carga, sugerindo bottleneck em recursos não escaláveis (CPU por pod, timeout de gRPC, pool de conexões) ou tempo de inicialização de novas réplicas superior à velocidade de aumento de carga.

---

## Análise de Falhas

### Tipos de Erro Registrados

| Tipo de Erro | Ocorrências | Percentual do Total |
|--------------|-------------|---------------------|
| **HTTP 500 (Internal Server Error)** | **4.271** | **63,14%** |
| Requisições Bem-Sucedidas | 2.492 | 36,86% |
| HTTP 4xx | 0 | 0% |
| Timeout | Não registrado | N/A |
| Exceções não tratadas | 0 | 0% |
| Conexão Recusada | Não registrado | N/A |

### Distribuição de Falhas por Endpoint

| Endpoint | Total | Falhas | Taxa de Falha |
|----------|-------|--------|---------------|
| /api/fib/ | 6.200 | 3.708 | 59,81% |
| /api/fib-lote/ | 563 | 563 | **100%** |

**Análise de Causa Raiz:**

O erro **HTTP 500 (Internal Server Error)** dominante indica falha no processamento backend, não no cliente ou rede. As causas prováveis incluem:

1. **Saturação de CPU:** Pods atingem 100% de uso e rejeitam novas requisições
2. **Timeout de gRPC:** Comunicação Django → Node.js → Java excede limite de tempo (default geralmente 30-60s)
3. **Exaustão de Thread Pool:** Backend Java ou Node.js sem threads disponíveis para processar
4. **Memory Pressure:** Sistema entra em GC (Garbage Collection) excessivo ou OOM (Out of Memory)
5. **Cascading Failure:** Falha em um serviço (ex: Java) propaga para toda a cadeia

A **taxa de 100% de falha em /api/fib-lote/** é particularmente reveladora: operações que exigem múltiplos cálculos Fibonacci (números 20-70) são computacionalmente caras demais para o sistema atual sob carga extrema.

---

## Análise de Recursos (HPA e Escalabilidade)

### Comportamento do Horizontal Pod Autoscaler

O teste foi executado com HPA habilitado (minReplicas: 2, maxReplicas: 8, target CPU: 70%). Apesar do autoscaling, o sistema falhou.

**Hipóteses sobre comportamento do HPA:**

1. **Tempo de Inicialização (Cold Start):** Novos pods levam 30-60s para estar prontos (pull de imagem, health checks, warmup). Durante ramp-up de 30s (0→100 usuários), novos pods não tiveram tempo de inicializar.

2. **Limite de CPU atingido:** Se todos os 8 pods atingiram 100% de CPU simultaneamente, não há mais capacidade disponível para escalar.

3. **Bottleneck não escalável:** O gargalo pode estar em recurso compartilhado (ex: banco de dados, se houver) ou em limitação algorítmica (cálculo Fibonacci recursivo sem memoização).

4. **Threshold de CPU:** Com target de 70%, HPA pode ter escalado tarde demais (quando CPU já estava em 90-100%).

**Recomendação:** Coletar métricas de CPU/Memória dos pods durante o teste para confirmar se HPA escalou e quantos pods foram criados.

---

## Conclusões e Recomendações

### Status de Saúde do Sistema

**Classificação: ❌ CRÍTICO - NÃO APROVADO PARA PRODUÇÃO**

O sistema apresentou colapso operacional sob carga de 100 usuários simultâneos. Com taxa de falha de 63% e latências de 480-890ms (P50-P99), a experiência de usuário é inaceitável e o sistema não atende requisitos mínimos de disponibilidade.

### Capacidade Máxima Identificada

Baseado nos resultados dos três scenarios:

| Cenário | Usuários | Taxa de Sucesso | Latência P95 | Status |
|---------|----------|----------------|--------------|--------|
| Scenario 1 | 50 | 100% | 24 ms | ✅ Excelente |
| Scenario 2 | 50 | 100% | 39 ms | ✅ Bom |
| Scenario 3 | 100 | 36,86% | 760 ms | ❌ Crítico |

**Capacidade Estimada:** O sistema suporta de forma confiável **até 50 usuários simultâneos**. Entre 50 e 100 usuários, há um ponto de quebra onde o sistema colapsa. Recomenda-se teste incremental (60, 70, 80 usuários) para identificar o limite exato.

### Ações Imediatas (Bloqueantes para Produção)

1. **Otimização de Algoritmo Fibonacci**
   - **Problema:** Cálculo recursivo sem memoização é O(2^n), insustentável para n > 40
   - **Solução:** Implementar versão iterativa O(n) ou memoização com cache
   - **Impacto Estimado:** Redução de 80-90% em tempo de CPU por requisição

2. **Aumento de Recursos de Pod**
   - **Problema:** Pods podem estar sub-provisionados (CPU/Memory limits baixos)
   - **Solução:** Revisar `resources.requests` e `resources.limits` nos deployments
   - **Sugestão:** Dobrar CPU/Memory limits como teste inicial

3. **Tuning de Timeout gRPC**
   - **Problema:** Timeouts padrão (30-60s) podem estar sendo atingidos
   - **Solução:** Ajustar timeouts ou implementar circuit breaker
   - **Implementação:** Configurar deadline de gRPC para 10-15s e fail-fast

4. **Rate Limiting no Django**
   - **Problema:** Sistema aceita todas as requisições, mesmo quando saturado
   - **Solução:** Implementar rate limiting (ex: django-ratelimit) para proteger backend
   - **Configuração:** Limitar a 40 req/s por IP ou globalmente

### Otimizações Recomendadas (Médio Prazo)

1. **Implementação de Cache**
   - Usar Redis/Memcached para cachear resultados de Fibonacci
   - TTL de 1 hora para números frequentemente requisitados
   - Impacto: Redução de 70-90% de carga no backend para valores repetidos

2. **Revisão de Configuração HPA**
   - Reduzir threshold de CPU de 70% para 50%
   - Aumentar maxReplicas de 8 para 12-16
   - Configurar scale-down delay para evitar flapping

3. **Connection Pooling gRPC**
   - Verificar se Django mantém pool de conexões gRPC persistentes
   - Configurar keep-alive para reduzir overhead de handshake

4. **Monitoramento Proativo**
   - Alertas quando P95 > 100ms ou taxa de erro > 1%
   - Dashboard com CPU/Memory por pod em tempo real
   - Trace distribuído (Jaeger/Zipkin) para identificar gargalos na cadeia Django→Node→Java

### Testes Futuros Necessários

1. **Teste de Busca de Limite**
   - Executar testes com 60, 70, 80, 90 usuários
   - Identificar exatamente onde ocorre degradação
   - Objetivo: Mapear curva de capacidade

2. **Teste Pós-Otimização**
   - Após implementar otimizações (Fibonacci iterativo, cache, etc.)
   - Re-executar Scenario 3 (100 usuários) e validar melhoria
   - Meta: Taxa de sucesso > 99%, P95 < 100ms

3. **Teste de Sustentabilidade**
   - Teste de 1 hora com carga sustentada em 80% da capacidade
   - Verificar memory leaks, degradação gradual
   - Objetivo: Garantir estabilidade em operação prolongada

4. **Teste de Recuperação**
   - Simular falha de pod e observar tempo de recovery
   - Validar comportamento do HPA em spike súbito de carga
   - Objetivo: Garantir resiliência a falhas

### Priorização de Ações

| Ação | Impacto | Esforço | Prioridade |
|------|---------|---------|-----------|
| Fibonacci iterativo/memoização | Alto | Baixo | 🔴 P0 (Crítico) |
| Aumento de CPU/Memory limits | Alto | Baixo | 🔴 P0 (Crítico) |
| Timeout gRPC tuning | Médio | Baixo | 🟡 P1 (Alto) |
| Rate limiting Django | Médio | Médio | 🟡 P1 (Alto) |
| Cache Redis | Alto | Médio | 🟡 P1 (Alto) |
| HPA tuning | Médio | Baixo | 🟢 P2 (Médio) |
| Monitoramento avançado | Baixo | Alto | 🟢 P2 (Médio) |

---

## Apêndice: Definições Técnicas

**Taxa de Falha:** Percentual de requisições que resultaram em erro HTTP (neste caso, HTTP 500). Calculada como (Falhas / Total de Requisições) × 100.

**HTTP 500 (Internal Server Error):** Erro genérico do servidor indicando que a requisição não pôde ser processada devido a problema interno (crash, exception, timeout, etc.).

**Latência P95:** 95º percentil de latência. Significa que 95% das requisições completaram em tempo menor ou igual a este valor, e apenas 5% foram mais lentas.

**Tail Latency:** Latência dos percentis superiores (P95, P99, P99.9), representando os casos mais lentos. Crítica para experiência de usuário, pois mesmo que rara, impacta percepção geral.

**HPA (Horizontal Pod Autoscaler):** Recurso do Kubernetes que automaticamente aumenta ou diminui o número de réplicas de pods baseado em métricas (CPU, memória, custom metrics).

**Throughput:** Número de requisições processadas por segundo. Não diferencia entre requisições bem-sucedidas e falhadas.

**gRPC (Google Remote Procedure Call):** Protocolo de comunicação de alto desempenho usado entre os microserviços (Django → Node.js → Java).

**Circuit Breaker:** Padrão de design que previne cascading failures: se um serviço falha repetidamente, o circuit breaker "abre" e rejeita requisições imediatamente sem tentar chamar o serviço degradado.

---

## Metadados do Relatório

| Campo | Valor |
|-------|-------|
| Versão do Relatório | 1.0 |
| Data de Geração | 7 de Dezembro de 2025 |
| Período de Teste | 120 segundos |
| Ambiente | Kubernetes (Minikube) com HPA habilitado |
| Ferramenta de Teste | Locust |
| Status | ❌ CRÍTICO - Falha Operacional |
| Aprovação para Produção | **NÃO APROVADO** |
| Ações Bloqueantes | Otimização de algoritmo + Aumento de recursos |

---

**CLASSIFICAÇÃO FINAL: ❌ SISTEMA NÃO PRONTO PARA PRODUÇÃO COM 100+ USUÁRIOS**