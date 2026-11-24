# Arquitetura do MaxClique

O MaxClique é um laboratório local para Análise e Complexidade de Algoritmos da UNOCHAPECÓ. A entrega compreende um núcleo TypeScript, um benchmark Node.js e uma aplicação React em português brasileiro. O relatório teórico do grupo fundamenta o problema e as estratégias.

- A camada de grafos mantém uma matriz de adjacência simétrica e valida o formato JSON de intercâmbio.
- O núcleo recebe uma instância e devolve a clique, o estado da execução e os contadores. A camada não depende de React, DOM ou rede.
- O navegador executa o núcleo em um Web Worker cancelável e renderiza os resultados. Cada execução recebe um retrato da instância ativa.
- O benchmark usa o mesmo núcleo em Node.js, registra o ambiente e produz dados brutos e agregados. A interface compara estes dados com rótulo de ambiente próprio.
- O GitHub armazena o código em repositório privado. O GitHub Actions realiza verificações sem publicar a aplicação.

## Grupo

Bruno Antunes, Edson Leandro Soares, Pedro Toigo e Vitor Rodi. Professor Gabriel Henrique Moro. Apresentação em 26 de novembro de 2026.
