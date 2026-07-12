import { expect } from 'vitest'
import '@testing-library/jest-dom/vitest'
import type { AxeResults } from 'axe-core'

// vitest-axe@0.1.0 expõe axe()/configureAxe() (usados nos testes), mas seus
// próprios matchers (toHaveNoViolations) só existem como declaração de tipo.
// O JS de extend-expect.js está vazio, e matchers.d.ts marca o export como
// type-only mesmo tendo um valor real em matchers.js. Em vez de lutar contra
// esse pacote quebrado, implementamos o matcher (trivial: sem violações =
// passa) e o tipamos aqui.
declare module 'vitest' {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  interface Assertion<T = any> {
    toHaveNoViolations(): T
  }
}

expect.extend({
  toHaveNoViolations(results: AxeResults) {
    const pass = results.violations.length === 0
    return {
      pass,
      message: () =>
        pass
          ? 'esperava violações de acessibilidade, mas não encontrou nenhuma'
          : `encontrou ${results.violations.length} violação(ões) de acessibilidade:\n` +
            results.violations.map((v) => `- ${v.id}: ${v.help} (${v.nodes.length} elemento(s))`).join('\n'),
    }
  },
})
