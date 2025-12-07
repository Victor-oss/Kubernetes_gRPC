import React, { useState } from "react";

function App() {
  const [n, setN] = useState("");
  const [messageFib, setFib] = useState("")
  const [file, setFile] = useState(null);
  const [fibonacciResults, setFibonacciResults] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmitFibSingle = (e) => {
    e.preventDefault();
    if (isNaN(n) || n === "") {
      setFib("Por favor, digite apenas números.");
      return;
    }
    fetch("http://localhost:8000/api/fib/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ n: n })
    })
      .then(r => r.json())
      .then(data => setFib(data.fibonacci))
      .catch(err => setFib("Erro: " + err.message));
  };

  const handleFileChange = (e) => {

    setFile(e.target.files[0]);

    setFibonacciResults([]);

    setErrorMessage("");

  };



  const handleSubmitFibMany = (e) => {
    e.preventDefault();

    if (!file) {
      setErrorMessage("Por favor, selecione um arquivo Excel.");
      return;
    }

    const formData = new FormData();

    formData.append("file", file);

    fetch("http://localhost:8000/api/fib-lote/", {
      method: "POST",
      body: formData
    })
      .then(r => r.json())
      .then(data => {
        if (data.error) {
          setErrorMessage(data.error);
        } else {
          setFibonacciResults(data.fibonacci_results);
          setErrorMessage("");
        }
      })
      .catch(err => setErrorMessage("Erro: " + err.message));
  };

  return (
    <div
      style={{
        paddingTop: "2rem",
        textAlign: "center",
        width: "100%",
        height: "100vh",
        backgroundColor: "#005C53",
        color: "#0CF25D",
      }}
    >
      <p>Insira um número n e obtenha o n-ésimo número de Fibonacci</p>
      <form onSubmit={handleSubmitFibSingle}>
        <input
          value={n}
          onChange={(ev) => setN(ev.target.value)}
          placeholder="Digite um número"
          style={{ padding: "0.5rem", marginRight: "0.5rem" }}
        />
        <button type="submit">Executar</button>
      </form>
      {messageFib && <h2>Resultado: {messageFib}</h2>}

      <hr style={{ margin: "2rem 0", borderColor: "#0CF25D" }} />



      <p>Upload de arquivo Excel para calcular Fibonacci em lote</p>

      <form onSubmit={handleSubmitFibMany}>

        <input

          type="file"

          accept=".xlsx,.xls"

          onChange={handleFileChange}

          style={{ padding: "0.5rem", marginRight: "0.5rem" }}

        />

        <button type="submit">Processar Excel</button>

      </form>

      {errorMessage && <h3 style={{ color: "red" }}>{errorMessage}</h3>}
      {fibonacciResults.length > 0 && (
        <div style={{ marginTop: "2rem", padding: "1rem" }}>
          <h2>Resultados:</h2>
          <table style={{
            margin: "0 auto",
            borderCollapse: "collapse",
            backgroundColor: "#003d36",
            color: "#0CF25D"
          }}>
            <thead>
              <tr>
                <th style={{ border: "1px solid #0CF25D", padding: "0.5rem" }}>Número</th>
                <th style={{ border: "1px solid #0CF25D", padding: "0.5rem" }}>Fibonacci</th>
              </tr>
            </thead>
            <tbody>
              {fibonacciResults.map((result, index) => (
                <tr key={index}>
                  <td style={{ border: "1px solid #0CF25D", padding: "0.5rem" }}>{result.input}</td>
                  <td style={{ border: "1px solid #0CF25D", padding: "0.5rem" }}>{result.fibonacci}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default App;
