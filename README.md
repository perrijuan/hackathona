# 📌 Vector – Plataforma de Caronas Universitárias  

Vector é um aplicativo open source feito por universitários e para universitários, com foco em acessibilidade, segurança e inclusão no transporte estudantil.  
O projeto nasceu em um hackathon com a missão de reduzir desigualdades no acesso ao ensino superior, oferecendo caronas seguras, econômicas e colaborativas.  

## Imagens 
<img width="1885" height="916" alt="Screenshot_20250827_215702" src="https://github.com/user-attachments/assets/a169cfbd-caa4-46a1-9b8b-c7c9566fc73f" />
<img width="1910" height="915" alt="Screenshot_20250827_220150" src="https://github.com/user-attachments/assets/2d33ba35-11e4-4e3c-b7d8-296bccf92ed5" />
<img width="1920" height="932" alt="Screenshot_20250827_221529" src="https://github.com/user-attachments/assets/b23a5a48-4ad7-4d60-84b5-06798fa5f397" />
<img width="1910" height="915" alt="Screenshot_20250827_220150" src="https://github.com/user-attachments/assets/95ced67c-088f-4874-8920-84c39be32183" />
<img width="1897" height="923" alt="Screenshot_20250827_220031" src="https://github.com/user-attachments/assets/1ab7314e-585a-4b06-820e-d3a47eb4c221" />


## ✨ Funcionalidades  

- 🚗 Carona Solidária – Sistema de caronas gratuitas ou a baixo custo para estudantes em vulnerabilidade.  
- ❤️ Comunidade Segura – Avaliação de motoristas, chat direto e hubs de encontro seguro.  
- 🤝 Open Source – Código aberto para que qualquer pessoa possa auditar, contribuir e expandir.  
- 💸 Baixo Custo Real – Preços acessíveis, pensados para a realidade financeira de estudantes.  
- 🏆 Gamificação (futuro) – Pontos e recompensas para motoristas e usuários ativos.  

## 🔗 Links Úteis  

- Repositório GitHub: https://github.com/claudio-asj/hackathona  
- Deploy (Vercel): https://hackatona.vercel.app/  
- Deploy de Teste (Vercel Dev): https://hackaton-dev.vercel.app/

## 🛠️ Tecnologias  

- ⚡ Vite – Bundler rápido e moderno  
- ⚛️ React com TypeScript  
- 🎨 Shadcn/UI – Componentes acessíveis e estilizados  
- 🔥 Firebase – Autenticação, banco de dados e hosting  
- 🎭 Tailwind CSS – Estilização responsiva
-   Ia generativa - Modelos open-source 

## 📦 Instalação  

Clone o repositório e instale as dependências:  

cd hackathona  
npm install  

## ⚙️ Configuração do Ambiente  

Crie um arquivo `.env` na raiz do projeto e adicione as chaves do Firebase:  

VITE_API_KEY="AIzaS...."  
VITE_AUTH_DOMAIN="hack..."  
VITE_PROJECT_ID="hackatonamob4"  
VITE_STORAGE_BUCKET="hack..."  
VITE_MESSAGING_SENDER_ID="50..."  
VITE_APP_ID="1:507969476135:web:1a2..."  
VITE_MEASUREMENT_ID="G-X..."  

Importante: nunca exponha suas próprias chaves de produção em repositórios públicos.  
As chaves acima são de exemplo para rodar o projeto localmente.  

## ▶️ Rodando o projeto  

npm run dev  

O app ficará disponível em:  
http://localhost:5173  

## 🤝 Contribuindo  

Este é um projeto open source. Toda contribuição é bem-vinda!  

1. Faça um fork  
2. Crie uma branch (git checkout -b minha-feature)  
3. Commit suas alterações (git commit -m "feat: minha nova feature")  
4. Faça um push (git push origin minha-feature)  
5. Abra um Pull Request 🚀  

## 👨‍💻 Equipe  

IMPORT PANDAS 🐼  
- Claudio Jr.  
- Nicolas Macedo  
- Bernardo Lopes  
- Juan Perri



## Chat API - Backend Flask

Backend Flask para o chatbot usando transformers e pipeline.

## Estrutura do Projeto

```
chat/
├── app.py                 # Aplicação principal Flask
├── run.py                 # Script para executar o servidor
├── wsgi.py               # WSGI para produção
├── requirements.txt      # Dependências Python
├── env.example          # Exemplo de variáveis de ambiente
├── README.md            # Esta documentação
├── config/              # Configurações
│   ├── __init__.py
│   └── settings.py
├── models/              # Modelos de ML
│   ├── __init__.py
│   └── chat_model.py
├── routes/              # Rotas da API
│   ├── __init__.py
│   └── chat_routes.py
├── services/            # Serviços
│   ├── __init__.py
│   └── chat_service.py
└── utils/               # Utilitários
    ├── __init__.py
    └── validators.py
```

## Instalação

1. **Instale as dependências:**
```bash
cd chat
pip install -r requirements.txt
```

2. **Configure as variáveis de ambiente:**
```bash
cp env.example .env
# Edite o arquivo .env com suas configurações
```

3. **Execute o servidor:**
```bash
python run.py
```

## Endpoints da API

### Health Check
- **GET** `/api/chat/health`
- Verifica se a API está funcionando

### Informações do Modelo
- **GET** `/api/chat/model/info`
- Retorna informações sobre o modelo carregado

### Sessões de Chat

#### Criar Sessão
- **POST** `/api/chat/session/create`
- Cria uma nova sessão de chat
- **Resposta:**
```json
{
  "session_id": "uuid-da-sessao",
  "message": "Sessão criada com sucesso"
}
```

#### Enviar Mensagem
- **POST** `/api/chat/session/{session_id}/message`
- Envia uma mensagem e recebe resposta
- **Body:**
```json
{
  "message": "Sua mensagem aqui",
  "max_length": 1000,
  "temperature": 0.7
}
```
- **Resposta:**
```json
{
  "response": "Resposta do modelo",
  "session_id": "uuid-da-sessao",
  "timestamp": "2024-01-01T12:00:00",
  "model": "microsoft/DialoGPT-medium"
}
```

#### Obter Histórico
- **GET** `/api/chat/session/{session_id}/history`
- Retorna o histórico de mensagens da sessão

#### Limpar Sessão
- **DELETE** `/api/chat/session/{session_id}/clear`
- Limpa o histórico da sessão

#### Streaming (SSE)
- **POST** `/api/chat/session/{session_id}/stream`
- Envia mensagem e recebe resposta em streaming
- Usa Server-Sent Events (SSE)

## Configurações

### Variáveis de Ambiente

- `SECRET_KEY`: Chave secreta do Flask
- `DEBUG`: Modo debug (True/False)
- `PORT`: Porta do servidor (padrão: 5000)
- `DEFAULT_MODEL`: Modelo a ser usado (padrão: microsoft/DialoGPT-medium)
- `MAX_MESSAGE_LENGTH`: Comprimento máximo da mensagem
- `DEFAULT_TEMPERATURE`: Temperatura para geração (0.0-2.0)
- `CORS_ORIGINS`: Origens permitidas para CORS

### Modelos Disponíveis

- `microsoft/DialoGPT-small`: Modelo pequeno (117M parâmetros)


## Desenvolvimento

### Executar em Desenvolvimento
```bash
python run.py
```

### Setup Automatizado (Recomendado)

Para configurar todo o ambiente (virtualenv, dependências, criação de `.env`, download antecipado do modelo e opção 8-bit), use o script na raiz do projeto:

```bash
bash scripts/setup_local_llm.sh
```

Opções disponíveis:

- `--model <NOME>`: força um modelo (ex: `Qwen/Qwen1.8B-Chat`)
- `--simple`: usa `requirements_simple.txt` (sem transformers) – útil para apenas API sem geração
- `--8bit`: tenta instalar `bitsandbytes` e ativa carregamento 8-bit (GPU necessária)
- `--python <bin>`: especifica binário Python (ex: `python3.11`)

Exemplos:
```bash
# Setup padrão
bash scripts/setup_local_llm.sh

# Modelo específico maior
bash scripts/setup_local_llm.sh --model Qwen/Qwen1.8B-Chat

# Ambiente leve + 8-bit
bash scripts/setup_local_llm.sh --simple --8bit --model Qwen/Qwen1.5-0.5B-Chat

# Usando Python 3.11
bash scripts/setup_local_llm.sh --python python3.11
```

Depois de rodar:
```bash
source .venv/bin/activate
python chat/run.py
```

### Executar em Produção
```bash
gunicorn chat.wsgi:app
```

### Testar Endpoints
```bash

curl http://localhost:5000/api/chat/health


curl -X POST http://localhost:5000/api/chat/session/create

curl -X POST http://localhost:5000/api/chat/session/{session_id}/message \
  -H "Content-Type: application/json" \
  -d '{"message": "Olá, como você está?"}'
```


As rotas da API seguem o padrão RESTful e retornam JSON.


## 📜 Licença  

Este projeto é licenciado sob a MIT License.  
Sinta-se livre para usar, modificar e compartilhar.  
