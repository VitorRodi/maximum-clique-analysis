const bibliography = [
  'CAVIQUE, Luís; REGO, César; THEMIDO, Isabel. Estruturas de vizinhança e procura local no problema da clique máxima. Investigação Operacional, v. 22, p. 1–18, 2002.',
  'GIBBONS, Luana E. et al. Continuous characterizations of the maximum clique problem. DIMACS Technical Report 96-09, 1996.',
  'KARP, Richard M. Reducibility among combinatorial problems. In: MILLER, R. E.; THATCHER, J. W. (ed.). Complexity of computer computations. New York: Plenum Press, 1972. p. 85–103. DOI: 10.1007/978-1-4684-2001-2_9.',
  'UNIVERSITY OF MICHIGAN. Introduction to complexity. EECS 376: Foundations of Computer Science, [s.d.]. Acesso em: 24 nov. 2026.',
  'WU, Qinghua; HAO, Jin-Kao. A review on algorithms for maximum clique problems. European Journal of Operational Research, v. 242, n. 3, p. 693–709, 2015. DOI: 10.1016/j.ejor.2014.09.064.',
]

export function Overview() {
  return (
    <article className="reading">
      <div className="page-heading">
        <h1>Visão geral</h1>
        <p>Análise e Complexidade de Algoritmos · Ciência da Computação · UNOCHAPECÓ</p>
      </div>
      <section>
        <h2>Problema da Clique Máxima</h2>
        <p>
          Em um grafo simples e não direcionado, uma clique é um conjunto de vértices ligados dois a
          dois. O objetivo é encontrar uma clique de maior cardinalidade, representada por ω(G).
        </p>
        <p>
          O laboratório complementa o TPE com implementações, visualização de decisões e medições
          reproduzíveis do custo e da qualidade de três estratégias.
        </p>
        <a className="button primary inline-button" href="#laboratorio">
          Abrir laboratório
        </a>
      </section>
      <section>
        <h2>Algoritmos disponíveis</h2>
        <dl className="definition-list">
          <div>
            <dt>Força bruta</dt>
            <dd>Enumera os subconjuntos e certifica um ótimo quando a busca termina.</dd>
          </div>
          <div>
            <dt>Guloso</dt>
            <dd>Constrói uma clique maximal escolhendo o maior grau no conjunto de candidatos.</dd>
          </div>
          <div>
            <dt>Busca local</dt>
            <dd>
              Parte da clique gulosa e procura trocas que permitam expandir estritamente a solução.
            </dd>
          </div>
        </dl>
      </section>
      <section>
        <h2>Identificação</h2>
        <dl className="definition-list">
          <div>
            <dt>Integrantes</dt>
            <dd>Bruno Antunes, Edson Leandro Soares, Pedro Toigo e Vitor Rodi</dd>
          </div>
          <div>
            <dt>Professor</dt>
            <dd>Gabriel Henrique Moro</dd>
          </div>
          <div>
            <dt>Apresentação</dt>
            <dd>26 de novembro de 2026</dd>
          </div>
        </dl>
      </section>
    </article>
  )
}

export function Theory() {
  return (
    <article className="reading">
      <div className="page-heading">
        <h1>Fundamentação teórica</h1>
        <p>Clique, redução de 3-SAT e limites das estratégias implementadas.</p>
      </div>
      <section>
        <h2>Clique e otimalidade</h2>
        <p>
          Seja G = (V, E). Um subconjunto C ⊆ V é clique se, para cada par distinto u, v ∈ C, {'{u, v}'}{' '}
          ∈ E. Uma clique é <strong>maximal</strong> quando nenhum vértice externo pode ser inserido. Uma
          clique é <strong>máxima</strong> se |C| = ω(G). A segunda propriedade implica a primeira.
        </p>
      </section>
      <section>
        <h2>Complexidade do problema</h2>
        <p>
          A versão de decisão CLIQUE pergunta se ω(G) ≥ k. Um certificado de k vértices pode ser
          verificado em O(k²) após validar os identificadores, usando a matriz de adjacência. CLIQUE
          pertence a NP.
        </p>
        <p>
          Para reduzir 3-SAT, crie um vértice para cada ocorrência de literal em m cláusulas. Conecte
          ocorrências de cláusulas diferentes cujos literais sejam compatíveis e fixe k = m. Uma
          atribuição satisfatória fornece um literal verdadeiro de cada cláusula. Uma clique de tamanho m
          fornece um literal por cláusula sem contradições, que podem ser satisfeitos simultaneamente. A
          construção testa O(m²) pares.
        </p>
        <p>
          Assim, CLIQUE é NP-completo. Calcular ω(G) resolveria CLIQUE pela comparação com k, o que torna
          a otimização NP-difícil.
        </p>
      </section>
      <section>
        <h2>Força bruta · O(n² · 2ⁿ)</h2>
        <pre>{`melhor ← ∅
para cada subconjunto S de V:
    se todos os pares em S são adjacentes e |S| > |melhor|:
        melhor ← S
devolver melhor após completar a enumeração`}</pre>
        <p>
          A visita cobre todos os subconjuntos. A maior solução válida é ótima após a visita completa.
          São O(n) de espaço auxiliar, além da matriz O(n²) e do rastro opcional.
        </p>
      </section>
      <section>
        <h2>Guloso · O(n³)</h2>
        <pre>{`C ← ∅; P ← V
enquanto P não estiver vazio:
    v ← primeiro vértice de maior grau dentro de P
    C ← C ∪ {v}
    P ← P ∩ N(v)
devolver C`}</pre>
        <p>
          Os candidatos são vizinhos de toda a clique. Ao esgotar P, nenhuma inserção é possível. Uma
          escolha de alto grau pode excluir vértices de uma clique maior. O recálculo custa O(n²) por até
          n etapas, com O(n) de espaço auxiliar.
        </p>
      </section>
      <section>
        <h2>Busca local · O(n⁶)</h2>
        <pre>{`C ← guloso(G)
enquanto houver rodadas disponíveis:
    para cada u ∈ C e v ∈ V − C:
        T ← (C − {u}) ∪ {v}
        se T for clique:
            expanda T com o guloso
            se |T| > |C|: aceite a primeira melhora
    pare se nenhuma troca melhorar C
devolver C`}</pre>
        <p>
          Uma rodada avalia O(n²) trocas. A validação custa O(n) e a expansão O(n³). A melhora estrita
          limita o número de rodadas a O(n). O espaço auxiliar é O(n). A vizinhança pode estabilizar em
          ótimo local.
        </p>
      </section>
      <section>
        <h2>Referências</h2>
        <ol className="references">
          {bibliography.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ol>
      </section>
    </article>
  )
}
