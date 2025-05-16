const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const port = 3000;

app.use(express.static('public'));
app.use(express.json());

const facesPath = path.join(__dirname, 'data', 'faces.json');

app.get('/faces', (req, res) => {
  const data = fs.existsSync(facesPath)
    ? fs.readFileSync(facesPath)
    : '[]';
  res.json(JSON.parse(data));
});

app.post('/cadastrar-rosto', (req, res) => {
  const { nome, descritor } = req.body;
  if (!nome || !descritor) return res.status(400).send("Dados inválidos");

  const data = fs.existsSync(facesPath)
    ? JSON.parse(fs.readFileSync(facesPath))
    : [];

  let pessoa = data.find(p => p.nome === nome);
  if (!pessoa) {
    pessoa = { nome, descriptors: [] };
    data.push(pessoa);
  }

  pessoa.descriptors.push(descritor);

  fs.writeFileSync(facesPath, JSON.stringify(data, null, 2));
  res.send("Rosto cadastrado com sucesso!");
});

app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});