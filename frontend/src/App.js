import React, { useState } from 'react';
import './App.css';

function App() {
  // Estados para armazenar o arquivo e o filtro selecionado
  const [selectedFile, setSelectedFile] = useState(null);
  const [filter, setFilter] = useState('grayscale');
  const [processedImage, setProcessedImage] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!selectedFile) {
      alert("Por favor, selecione uma imagem!");
      return;
    }

    setLoading(true);
    
    // Usamos FormData para enviar arquivos binários
    const formData = new FormData();
    formData.append('image', selectedFile);
    formData.append('filter', filter);

    try {
      const response = await fetch('http://192.168.49.2:30080/api/gateway/', {
        method: 'POST',
        body: formData, // O browser define o Content-Type automaticamente para multipart/form-data
      });

      if (response.ok) {
        // Recebemos a imagem processada como Blob (objeto binário)
        const imageBlob = await response.blob();
        // Criamos uma URL temporária para exibir a imagem
        const imageUrl = URL.createObjectURL(imageBlob);
        setProcessedImage(imageUrl);
      } else {
        alert('Erro ao processar imagem.');
      }
    } catch (error) {
      console.error('Erro:', error);
      alert('Erro de conexão.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Processador de Imagens gRPC</h1>
        
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          
          {/* Input de Arquivo */}
          <input 
            type="file" 
            accept="image/*" 
            onChange={handleFileChange} 
          />

          {/* Seleção de Filtro */}
          <select value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="grayscale">Escala de Cinza</option>
            <option value="blur">Desfoque (Blur)</option>
            <option value="edge">Bordas</option>
            <option value="resize">Reduzir Tamanho (50%)</option>
          </select>

          <button type="submit" disabled={loading}>
            {loading ? 'Processando...' : 'Enviar e Processar'}
          </button>
        </form>

        {/* Exibição do Resultado */}
        {processedImage && (
          <div style={{ marginTop: '20px' }}>
            <h3>Resultado:</h3>
            <img src={processedImage} alt="Processada" style={{ maxWidth: '100%', border: '2px solid white' }} />
          </div>
        )}
      </header>
    </div>
  );
}

export default App;