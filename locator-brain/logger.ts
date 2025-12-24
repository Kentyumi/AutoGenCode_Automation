import { LocatorDecision } from './types';

function strength(score: number): 'STRONG' | 'OK' | 'WEAK' {
  if (score >= 80) return 'STRONG';
  if (score >= 50) return 'OK';
  return 'WEAK';
}

export function logDecision(decision: LocatorDecision) {
  const chosen = decision.chosen;
  const score = chosen.score ?? 0;

  console.log(`
[LocatorBrain]
  target   : "${decision.target}"
  chosen   : ${chosen.strategy} → ${chosen.value}
  score    : ${score.toFixed(2)} (${strength(score)})
`);

  if (decision.alternatives?.length) {
    console.log('  alternatives:');
    decision.alternatives.slice(0, 3).forEach((alt, idx) => {
      console.log(
        `    ${idx + 1}. ${alt.strategy} → ${alt.value} (${(alt.score ?? 0).toFixed(2)})`
      );
    });
  }

  if (strength(score) === 'WEAK') {
    console.log('  ⚠ Locator quality LOW – consider improving semantic name or DOM attributes');
  }
}
