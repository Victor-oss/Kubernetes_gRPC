import React, { useState } from "react";

function App() {
  const [input, setInput] = useState("");
  const [message, setMessage] = useState("");
  const [num1, setNum1] = useState("");
  const [num2, setNum2] = useState("");
  const [messageSoma, setMessageSoma] = useState("")

  const handleSubmit = (e) => {
    e.preventDefault();
    fetch("http://localhost:8000/api/invert/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: input })
    })
      .then(r => r.json())
      .then(data => setMessage(data.message))
      .catch(err => setMessage("Error: " + err.message));
  };

  const handleSubmitSoma = (e) => {
    e.preventDefault();
    if (isNaN(num1) || isNaN(num2) || num1 === "" || num2 === "") {
      setMessageSoma("Por favor, digite apenas números.");
      return;
    }

    fetch("http://localhost:8000/api/sum/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ a: num1, b: num2 })
    })
      .then(r => r.json())
      .then(data => setMessageSoma(data.sum))
      .catch(err => setMessageSoma("Error: " + err.message));
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
      <h2>Inverte Palavras (Servidor NodeJS)</h2>
      <form onSubmit={handleSubmit}>
        <input
          value={input}
          onChange={(ev) => setInput(ev.target.value)}
          placeholder="Digite uma palavra"
          style={{ padding: "0.5rem", marginRight: "0.5rem" }}
        />
        <button type="submit">Inverter</button>
      </form>
      {message && <h2>Resultado: {message}</h2>}

      <h2>Soma (Servidor Java)</h2>
      <form onSubmit={handleSubmitSoma}>
        <input
          value={num1}
          onChange={(ev) => setNum1(ev.target.value)}
          placeholder="Digite um número"
          style={{ padding: "0.5rem", marginRight: "0.5rem" }}
        />
        <input
          value={num2}
          onChange={(ev) => setNum2(ev.target.value)}
          placeholder="Digite um número"
          style={{ padding: "0.5rem", marginRight: "0.5rem" }}
        />
        <button type="submit">Somar</button>
      </form>
      {messageSoma && <h2>Resultado: {messageSoma}</h2>}
    </div>
  );
}

export default App;
