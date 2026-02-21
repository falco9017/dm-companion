import type { CharacterSheetData } from './character-sheet'

export type CombatantType = 'player' | 'monster' | 'npc'

export interface Combatant {
  id: string
  name: string
  type: CombatantType
  initiative: number
  initiativeModifier: number
  currentHp: number
  maxHp: number
  temporaryHp: number
  ac: number
  notes: string
  // For wiki-linked entries
  wikiEntryId?: string
  wikiContent?: string
  // For player characters with full sheets
  characterSheet?: CharacterSheetData
}
