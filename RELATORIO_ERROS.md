# Relatório de Erros e Ocorrências de Desenvolvimento — RotaFit

Este documento registra cronologicamente todas as falhas, erros de ferramentas/dependências, incompatibilidades e suas respectivas resoluções durante a construção do projeto **RotaFit** (Projeto 3 de 5 - Programação para Dispositivos Móveis - IESB).

---

## 1. Etapa de Inicialização e Instalação de Dependências

### Ocorrência 1.1: Falha ao executar `npx expo install` sem instalação prévia do módulo `expo`
* **Data/Hora**: 05/11/2026 - 09:28
* **Comando executado**:
  ```bash
  npx expo install expo-router react-native-safe-area-context ...
  ```
* **Sintoma / Mensagem de Erro**:
  ```text
  ConfigError: Cannot determine the project's Expo SDK version because the module `expo` is not installed. Install it with `npm install expo` and try again.
  ```
* **Causa Raiz**:
  O projeto foi inicializado com a flag `--no-install` para otimizar o tempo de download do template inicial. Sem a pasta `node_modules` com o pacote `expo` instalado, o utilitário `npx expo install` não consegue determinar a versão do SDK da aplicação para escolher as versões compatíveis dos pacotes nativos.
* **Solução Adotada**:
  Executou-se primeiramente o `npm install` com as dependências básicas presentes no `package.json` inicial do template. Logo em seguida, o `npx expo install` foi executado novamente com êxito, vinculando as 18 bibliotecas nativas compatíveis com a versão do Expo SDK.
* **Status**: ✅ Resolvido

---

## 2. Etapa de Testes e Lógica de Domínio

### Ocorrência 2.1: Execução indevida de arquivos ESM pelo Jest (`supabase/tests/db.test.mjs`)
* **Data/Hora**: 05/11/2026 - 10:19
* **Comando executado**:
  ```bash
  npm run test:app
  ```
* **Sintoma / Mensagem de Erro**:
  ```text
  FAIL supabase/tests/db.test.mjs
    Must use import to load ES Module: ...\supabase\tests\db.test.mjs
    The file contains ESM syntax (import/export) that could not be executed as CommonJS.
  ```
* **Causa Raiz**:
  O arquivo de testes de banco de dados `db.test.mjs` utiliza ECMAScript Modules (ESM) para rodar com o test runner nativo do Node (`node --test`), enquanto o Jest padrão do Expo está configurado para CommonJS/TypeScript. Sem delimitação explícita das raízes do Jest no `package.json`, ele escaneou recursivamente a pasta `supabase/tests/`.
* **Solução Adotada**:
  Adicionou-se a propriedade `"roots": ["<rootDir>/__tests__"]` na configuração do Jest dentro do `package.json`. Dessa forma, o Jest isola estritamente os testes unitários do aplicativo React Native, enquanto `npm run test:db` executa exclusivamente o `node --test` nos testes de banco.
* **Status**: ✅ Resolvido

### Ocorrência 2.2: Avaliação falsy de timestamp `0` no cálculo de tempo decorrido (`elapsedSeconds`)
* **Data/Hora**: 05/11/2026 - 10:19
* **Comando executado**:
  ```bash
  npm run test:app
  ```
* **Sintoma / Mensagem de Erro**:
  ```text
  ● Tracker State Machine › finaliza a corrida e congela o tempo
    expect(received).toBe(expected) // Object.is equality
    Expected: 60
    Received: 0
  ```
* **Causa Raiz**:
  A função `elapsedSeconds` continha a verificação `if (!state.startedAt) return 0;`. Em testes unitários que iniciam simulações com `timestamp: 0` (época Unix inicial em testes mockados), a expressão `!0` avalia como `true`, fazendo a função retornar zero erroneamente mesmo com a corrida iniciada e finalizada.
* **Solução Adotada**:
  A checagem foi refatorada para `if (state.startedAt === null) return 0;`, garantindo que qualquer número de timestamp válido (inclusive zero) seja tratado como uma corrida devidamente iniciada.
* **Status**: ✅ Resolvido

---

## 3. Etapa de Compilação e Verificação Estática de Tipos (TypeScript Strict)

### Ocorrência 3.1: Identificador de ícone inexistente no mapa de glifos do Ionicons (`logo-spotify`)
* **Data/Hora**: 05/11/2026 - 10:27
* **Comando executado**:
  ```bash
  npm run typecheck
  ```
* **Sintoma / Mensagem de Erro**:
  ```text
  app/(app)/(tabs)/profile.tsx(111,27): error TS2322: Type '"logo-spotify"' is not assignable to type ...
  ```
* **Causa Raiz**:
  O conjunto de glifos `Ionicons` da biblioteca `@expo/vector-icons` não possui o ícone `"logo-spotify"`. O nome correto para o logotipo do Spotify reside no conjunto `FontAwesome`.
* **Solução Adotada**:
  Importou-se `FontAwesome` de `@expo/vector-icons` especificamente para o logotipo do Spotify (`name="spotify"`), mantendo a fidelidade visual e a validação estrita de tipos no TypeScript.
* **Status**: ✅ Resolvido

### Ocorrência 3.2: Namespace `NodeJS.Timeout` não disponível no ambiente React Native / Dom
* **Data/Hora**: 05/11/2026 - 10:27
* **Comando executado**:
  ```bash
  npm run typecheck
  ```
* **Sintoma / Mensagem de Erro**:
  ```text
  src/hooks/useRunTracker.ts(22,26): error TS2694: Namespace 'global.NodeJS' has no exported member 'Timeout'.
  ```
* **Causa Raiz**:
  Em projetos React Native com `tsconfig.json` voltado para o runtime móvel/web (sem `@types/node` global), o namespace `NodeJS.Timeout` não é reconhecido pelo compilador.
* **Solução Adotada**:
  Substituiu-se a tipagem para o utilitário nativo multiplataforma `ReturnType<typeof setInterval>` e `ReturnType<typeof setTimeout>`.
* **Status**: ✅ Resolvido

### Ocorrência 3.3: Incompatibilidade de retorno na prop `onRefresh` do `RefreshControl` com o React Query
* **Data/Hora**: 05/11/2026 - 10:27
* **Comando executado**:
  ```bash
  npm run typecheck
  ```
* **Sintoma / Mensagem de Erro**:
  ```text
  app/(app)/(tabs)/history.tsx: Type '(options?: RefetchOptions) => Promise<QueryObserverResult>' is not assignable to type '() => void | Promise<void>'.
  ```
* **Causa Raiz**:
  A função `refetch()` do `@tanstack/react-query` retorna uma Promise que resolve em um `QueryObserverResult`. Já a prop `onRefresh` do componente `RefreshControl` do React Native exige que a Promise resolva estritamente em `void`.
* **Solução Adotada**:
  Envolveu-se a chamada em uma arrow function `onRefresh={() => { refetch(); }}`, descartando o objeto de retorno da Promise e satisfazendo o contrato de tipagem do React Native.
* **Status**: ✅ Resolvido

---
