# 🏃 RotaFit — Aplicativo Móvel de Rastreamento de Corrida com Trilha Sonora

> **Projeto 3 de 5** da disciplina de **Programação para Dispositivos Móveis**  
> **Professor**: Me. Bruno Assunção Dias  
> **Instituição**: IESB  

---

## 🌟 1. Visão Geral

O **RotaFit** é uma aplicação móvel desenvolvida com React Native, Expo e TypeScript, voltada para corredores que desejam registrar suas corridas ao ar livre com geolocalização precisa via GPS, traçado de percurso desenhado em SVG vetorial (sem custos com APIs proprietárias de mapas), acompanhamento de ritmo (*pace*), calorias estimadas e integração com Spotify para controle de música em tempo real.

O projeto segue rigorosamente os padrões de arquitetura em camadas, autenticação social segura (Google via Supabase Auth com OAuth 2.0 PKCE) e persistência em banco relacional PostgreSQL com políticas ativas de **Row Level Security (RLS)**.

---

## 🎨 2. Design System: Liquid Glass & Tema Duplo

A interface adota a estética visual **Liquid Glass**, caracterizada por:
* **Superfícies vítreas translúcidas**: uso de desfoque de fundo (`expo-blur`), bordas com glow e reflexo especular em gradiente (`expo-linear-gradient`).
* **Tema Duplo com persistência local**:
  * **Tema Claro**: inspirado em *Milano Red* (`#B81104`) sobre tons suaves de *Lemon Chiffon* (`#FFF9E6`).
  * **Tema Escuro**: inspirado nas cores do *Flamengo* — fundo profundo quase preto (`#0B0B0D`) e realces em vermelho vibrante (`#E6141E`).
  * Alternância dinâmica entre **Sistema**, **Claro** e **Escuro** com detecção automática do esquema do dispositivo.

---

## 🗺️ 3. Traçado de Rotas em SVG Puro (Zero Custo com Mapas)

Ao invés de depender de SDKs pagos ou chaves restritas da Google Maps API / Mapbox:
* As coordenadas GPS capturadas pelo `expo-location` são submetidas a filtros de plausibilidade física (algoritmo Haversine + velocidade máxima humana de 10 m/s para descartar teletransportes espúrios de GPS).
* Um algoritmo de simplificação **Ramer-Douglas-Peucker** reduz o número de nós intermediários colineares.
* O componente `RoutePath` projeta a latitude e a longitude na viewport do SVG, renderizando curvas suaves Bézier com gradiente e marcadores de partida (verde) e chegada/posição atual (vermelho brilhante).

---

## 🎵 4. Integração com Spotify

* Autenticação via **OAuth 2.0 com PKCE** sem compartilhamento de segredos de cliente no app.
* Armazenamento seguro de tokens com `expo-secure-store` (e fallback web no AsyncStorage).
* Painel de reprodução com arte do álbum, título da faixa, artista e botões de controle (`play`, `pause`, `avançar`, `voltar`).
* Vinculação da música em reprodução aos dados da corrida salva no banco.
* **Modo Demonstração Integrado**: caso execute sem uma `Client ID` do Spotify registrada, o aplicativo simula perfeitamente faixas de treino para permitir testes imediatos da interface.

---

## 🛡️ 5. Banco de Dados e Segurança (PostgreSQL + Supabase)

O esquema relacional (`supabase/schema.sql`) define:
* Tabela `public.runs` associada ao usuário autenticado (`auth.uid()`).
* **Row Level Security (RLS)**:
  * Políticas estritas de `SELECT`, `INSERT` e `DELETE` onde cada usuário só acessa e manipula seus próprios registros.
  * Usuários anônimos têm acesso negado.
* **Restrições de integridade**: distâncias e durações não negativas, verificação de datas consistentes (`ended_at >= started_at`).
* Função analítica `public.weekly_stats()` que consolida quilometragem semanal, minutos totais e ritmo médio ponderado.

---

## 📁 6. Estrutura do Projeto

```text
rotafit/
├── app/                        # Rotas e telas gerenciadas pelo Expo Router
│   ├── (auth)/                 # Grupo de autenticação
│   │   ├── _layout.tsx
│   │   └── login.tsx           # Tela de login (Google + Modo Visitante)
│   ├── (app)/                  # Grupo autenticado
│   │   ├── (tabs)/             # Navegador de abas principais
│   │   │   ├── _layout.tsx     # Barra de abas com efeito Liquid Glass
│   │   │   ├── index.tsx       # Tela inicial com métricas semanais e atalho
│   │   │   ├── history.tsx     # Histórico de percursos com thumbnails SVG
│   │   │   └── profile.tsx     # Preferências de tema, Spotify e logout
│   │   ├── run/
│   │   │   ├── active.tsx      # Rastreamento ao vivo em tempo real
│   │   │   └── [id].tsx        # Detalhes e mapa da corrida salva
│   │   └── _layout.tsx
│   └── _layout.tsx             # Root layout com Providers e guarda de rotas
├── src/
│   ├── components/             # Componentes reutilizáveis
│   │   ├── glass/GlassSurface  # Primitiva de vidro com blur e highlight
│   │   ├── Button.tsx          # Botões em pill com variantes Liquid Glass
│   │   ├── Card.tsx            # Cartão translúcido
│   │   ├── GoogleIcon.tsx      # Ícone vetorial oficial do Google
│   │   ├── RoutePath.tsx       # Renderizador de percurso em SVG puro
│   │   ├── Screen.tsx          # Envoltório de tela com gradiente e safe area
│   │   ├── StateViews.tsx      # Estados de carregamento, erro e vazio
│   │   ├── ThemePicker.tsx     # Seletor segmentado Claro/Escuro/Sistema
│   │   └── spotify/            # Card de reprodução musical
│   ├── context/                # Contextos de autenticação, tema e Spotify
│   ├── hooks/                  # Custom hooks (GPS, Player, Corridas)
│   ├── lib/                    # Supabase client, OAuth e SecureStore
│   ├── services/               # Serviços de API e banco de dados
│   ├── theme/                  # Tokens e paletas de cores
│   ├── types/                  # Definições completas TypeScript
│   └── utils/                  # Algoritmos puros (Geo, Tracker, Greeting)
├── __tests__/                  # Suíte de testes unitários com Jest
│   ├── geo.test.ts             # Testes de Haversine, ritmo, plausibilidade
│   ├── greeting.test.ts        # Testes de saudação por horário
│   └── tracker.test.ts         # Testes da máquina de estados do tracker
├── supabase/
│   ├── schema.sql              # DDL da tabela runs, RLS e weekly_stats
│   └── tests/
│       └── db.test.mjs         # Testes de RLS em memória via @electric-sql/pglite
├── package.json
└── tsconfig.json
```

---

## 🚀 7. Instalação e Execução

### 1. Clonar o repositório e instalar dependências
```bash
npm install
```

### 2. Configurar variáveis de ambiente
Crie um arquivo `.env` na raiz do projeto com base no `.env.example`:
```env
EXPO_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anonima
EXPO_PUBLIC_SPOTIFY_CLIENT_ID=seu-client-id-spotify
```
*(Nota: O aplicativo conta com modo fallback automático e mock integrado para permitir a demonstração completa sem necessidade obrigatória de chaves de nuvem ativas).*

### 3. Executar as baterias de testes
O projeto conta com **43 testes automatizados** distribuídos entre lógica pura e banco de dados:
```bash
# Executa todos os testes (Jest + Testes de RLS no PostgreSQL)
npm test

# Executa apenas os testes unitários do app (32 testes)
npm run test:app

# Executa apenas os testes de RLS do banco com PGlite (11 testes)
npm run test:db
```

### 4. Checagem estrita de tipos
```bash
npm run typecheck
```

### 5. Iniciar a aplicação
```bash
npx expo start
```
* Pressione `w` no terminal para abrir no navegador web.
* Ou leia o QR Code com o aplicativo **Expo Go** em seu smartphone Android ou iOS.

---

## 🧪 8. Como Testar Cada Funcionalidade

1. **Autenticação**:
   * Na tela de login, toque em **"Entrar com Google"** para testar o fluxo de OAuth PKCE, ou toque em **"Continuar como Visitante"** para acessar imediatamente com a conta de demonstração.
2. **Iniciar uma Corrida**:
   * Na aba **Início**, toque no botão **"INICIAR NOVA CORRIDA"**.
   * O aplicativo solicitará permissão de GPS e começará a desenhar o percurso em tempo real na tela.
   * Você pode testar os botões de **Pausar**, **Retomar** e **Finalizar**.
3. **Salvar a Corrida**:
   * Ao finalizar, dê um nome ao treino no modal (ex.: *"Treino Noturno"*) e confirme.
   * O percurso será registrado no banco e você será direcionado à tela de resumo com o traçado completo em SVG e estatísticas detalhadas.
4. **Spotify**:
   * Na tela inicial ou de perfil, teste a conexão e controle as músicas (play, pause, pular faixa).
5. **Aparência e Temas**:
   * Acesse a aba **Perfil** e selecione entre os modos **Claro**, **Escuro** e **Sistema**. O design Liquid Glass adaptará imediatamente suas cores e transparências.
