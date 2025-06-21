import { Combo } from './types';

export function assignCombos(
  numPlayers: number,
  enabledCombos: Array<Combo>,
  assignments: Array<Combo>
): Array<Combo> | null {
  if (assignments.length === numPlayers) {
    return assignments;
  }

  if (enabledCombos.length === 0) {
    return null;
  }

  for (const combo of enabledCombos) {
    assignments.push(combo);
    const validCombos = enabledCombos.filter(
      (c) =>
        c.factionId !== combo.factionId && c.playerMatId !== combo.playerMatId
    );

    const foundAssignments: Array<Combo> | null = assignCombos(
      numPlayers,
      validCombos,
      assignments
    );

    if (foundAssignments) {
      return foundAssignments;
    }
    assignments.pop();
  }

  return null;
}
