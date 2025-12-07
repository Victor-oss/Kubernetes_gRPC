from locust import HttpUser, task, between
import random
import time

class FibonacciUser(HttpUser):
    wait_time = between(1, 3)
    
    @task(3)
    def calculate_fibonacci(self):
        """Teste de cálculo unitário"""
        n = random.randint(20, 70)
        self.client.post(
            "/api/fib/",
            json={"n": n},
            headers={"Content-Type": "application/json"}
        )
    
    @task(1)
    def upload_excel(self):
        """Teste de upload em lote (opcional)"""
        # Gerar Excel simples em tempo real
        import openpyxl
        from io import BytesIO
        
        wb = openpyxl.Workbook() 
        ws = wb.active
        for i in range(10):
            ws[f'A{i+1}'] = random.randint(20, 70)
        
        excel_bytes = BytesIO()
        wb.save(excel_bytes)
        excel_bytes.seek(0)
        
        files = {'file': ('test.xlsx', excel_bytes.getvalue())}
        self.client.post("/api/fib-lote/", files=files)

class FibonacciUser2(HttpUser):
    """Perfil de usuário que faz apenas cálculos unitários"""
    wait_time = between(0.5, 1)
    
    @task
    def rapid_fibonacci(self):
        n = random.randint(20, 70)
        self.client.post(
            "/api/fib/",
            json={"n": n},
            headers={"Content-Type": "application/json"}
        )