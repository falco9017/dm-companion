import type { CharacterSheetData } from './character-sheet'

export type CombatantType = 'player' | 'monster' | 'npc'

export interface MonsterAbilities {
  strength: number
  dexterity: number
  constitution: number
  intelligence: number
  wisdom: number
  charisma: number
}

export interface MonsterData {
  size: string
  type: string
  challengeRating: number
  xp: number
  abilities: MonsterAbilities
  armorClass: number
  speed?: string
  specialAbilities?: { name: string; desc: string }[]
  actions?: { name: string; desc: string }[]
  legendaryActions?: { name: string; desc: string }[]
}

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
  // For D&D SRD monsters with structured data
  monsterData?: MonsterData
}
