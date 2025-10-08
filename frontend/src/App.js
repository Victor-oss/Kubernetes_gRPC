import React, { useState } from "react";

function App() {
  const [input, setInput] = useState("");
  const [message, setMessage] = useState("");

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
      <h2>Inverte Palavras (Servidor Django)</h2>
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
    </div>
  );
}

export default App;
