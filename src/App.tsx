import { lazy, Suspense, useEffect, useState } from 'react'
import { Overview, Theory } from './pages/Academic'
import { Lab } from './pages/Lab'

const Comparison = lazy(() => import('./pages/Comparison'))
const tabs = {
  'visao-geral': 'Visão geral',
  laboratorio: 'Laboratório',
  comparacao: 'Comparação experimental',
  teoria: 'Fundamentação',
} as const
type Tab = keyof typeof tabs

function currentTab(): Tab {
  const hash = window.location.hash.slice(1)
  return Object.hasOwn(tabs, hash) ? (hash as Tab) : 'laboratorio'
}
export function App() {
  const [tab, setTab] = useState(currentTab)
  useEffect(() => {
    function navigate() {
      setTab(currentTab())
      if (Object.hasOwn(tabs, window.location.hash.slice(1))) window.scrollTo(0, 0)
    }
    window.addEventListener('hashchange', navigate)
    return () => window.removeEventListener('hashchange', navigate)
  }, [])
  return (
    <>
      <a
        href="#conteudo"
        className="skip"
        onClick={(event) => {
          event.preventDefault()
          document.getElementById('conteudo')?.focus()
        }}
      >
        Pular para o conteúdo
      </a>
      <header className="masthead">
        <div className="header-wrap">
          <a href="#laboratorio" className="identity">
            <strong>MaxClique</strong>
            <span>Análise de Algoritmos</span>
          </a>
          <nav aria-label="Navegação principal">
            {Object.entries(tabs).map(([id, label]) => (
              <a key={id} href={`#${id}`} aria-current={id === tab ? 'page' : undefined}>
                {label}
              </a>
            ))}
          </nav>
        </div>
      </header>
      <main className="page-wrap" id="conteudo" tabIndex={-1}>
        <div hidden={tab !== 'laboratorio'}>
          <Lab />
        </div>
        {tab === 'visao-geral' && <Overview />}
        {tab === 'teoria' && <Theory />}
        {tab === 'comparacao' && (
          <Suspense fallback={<p role="status">Carregando dados experimentais…</p>}>
            <Comparison />
          </Suspense>
        )}
      </main>
      <footer className="site-footer">
        UNOCHAPECÓ <span>Ciência da Computação · Análise e Complexidade de Algoritmos</span>
      </footer>
    </>
  )
}
