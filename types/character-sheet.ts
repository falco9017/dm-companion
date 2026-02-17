export interface AbilityScore {
  score: number
  modifier: number
}

export interface Abilities {
  strength: AbilityScore
  dexterity: AbilityScore
  constitution: AbilityScore
  intelligence: AbilityScore
  wisdom: AbilityScore
  charisma: AbilityScore
}

export interface SavingThrow {
  proficient: boolean
  modifier: number
}

export interface SavingThrows {
  strength: SavingThrow
  dexterity: SavingThrow
  constitution: SavingThrow
  intelligence: SavingThrow
  wisdom: SavingThrow
  charisma: SavingThrow
}

export interface Skill {
  name: string
  ability: string
  proficient: boolean
  expertise: boolean
  modifier: number
}

export interface EquipmentItem {
  name: string
  quantity: number
  description: string
  weight: number
  equipped: boolean
  magical: boolean
  attackBonus?: number
  damage?: string
}

export interface Feature {
  name: string
  description: string
  source: string
  usesMax?: number
  usesCurrent?: number
}

export interface SpellSlot {
  level: number
  total: number
  used: number
}

export interface Spell {
  name: string
  level: number
  prepared: boolean
  ritual: boolean
  concentration: boolean
  description: string
  school: string
}

export interface Spellcasting {
  ability: string
  saveDC: number
  attackBonus: number
  spellSlots: SpellSlot[]
  spells: Spell[]
}

export interface Currency {
  cp: number
  sp: number
  ep: number
  gp: number
  pp: number
}

export interface CharacterSheetData {
  // Identity
  characterName: string
  playerName: string
  class: string
  subclass: string
  level: number
  race: string
  background: string
  alignment: string
  experiencePoints: number

  // Ability Scores
  abilities: Abilities

  // Combat Stats
  armorClass: number
  initiative: number
  speed: number
  hitPoints: { maximum: number; current: number; temporary: number }
  hitDice: { total: string; remaining: string }
  deathSaves: { successes: number; failures: number }
  proficiencyBonus: number

  // Saving Throws
  savingThrows: SavingThrows

  // Skills
  skills: Skill[]

  // Equipment
  equipment: EquipmentItem[]
  currency: Currency

  // Features & Traits
  features: Feature[]

  // Personality
  personalityTraits: string
  ideals: string
  bonds: string
  flaws: string

  // Spellcasting (null if non-caster)
  spellcasting: Spellcasting | null

  // Notes
  notes: string
}

// Default empty character sheet for manual creation
export function createEmptyCharacterSheet(): CharacterSheetData {
  return {
    characterName: '',
    playerName: '',
    class: '',
    subclass: '',
    level: 1,
    race: '',
    background: '',
    alignment: '',
    experiencePoints: 0,
    abilities: {
      strength: { score: 10, modifier: 0 },
      dexterity: { score: 10, modifier: 0 },
      constitution: { score: 10, modifier: 0 },
      intelligence: { score: 10, modifier: 0 },
      wisdom: { score: 10, modifier: 0 },
      charisma: { score: 10, modifier: 0 },
    },
    armorClass: 10,
    initiative: 0,
    speed: 30,
    hitPoints: { maximum: 10, current: 10, temporary: 0 },
    hitDice: { total: '1d10', remaining: '1d10' },
    deathSaves: { successes: 0, failures: 0 },
    proficiencyBonus: 2,
    savingThrows: {
      strength: { proficient: false, modifier: 0 },
      dexterity: { proficient: false, modifier: 0 },
      constitution: { proficient: false, modifier: 0 },
      intelligence: { proficient: false, modifier: 0 },
      wisdom: { proficient: false, modifier: 0 },
      charisma: { proficient: false, modifier: 0 },
    },
    skills: [
      { name: 'Acrobatics', ability: 'DEX', proficient: false, expertise: false, modifier: 0 },
      { name: 'Animal Handling', ability: 'WIS', proficient: false, expertise: false, modifier: 0 },
      { name: 'Arcana', ability: 'INT', proficient: false, expertise: false, modifier: 0 },
      { name: 'Athletics', ability: 'STR', proficient: false, expertise: false, modifier: 0 },
      { name: 'Deception', ability: 'CHA', proficient: false, expertise: false, modifier: 0 },
      { name: 'History', ability: 'INT', proficient: false, expertise: false, modifier: 0 },
      { name: 'Insight', ability: 'WIS', proficient: false, expertise: false, modifier: 0 },
      { name: 'Intimidation', ability: 'CHA', proficient: false, expertise: false, modifier: 0 },
      { name: 'Investigation', ability: 'INT', proficient: false, expertise: false, modifier: 0 },
      { name: 'Medicine', ability: 'WIS', proficient: false, expertise: false, modifier: 0 },
      { name: 'Nature', ability: 'INT', proficient: false, expertise: false, modifier: 0 },
      { name: 'Perception', ability: 'WIS', proficient: false, expertise: false, modifier: 0 },
      { name: 'Performance', ability: 'CHA', proficient: false, expertise: false, modifier: 0 },
      { name: 'Persuasion', ability: 'CHA', proficient: false, expertise: false, modifier: 0 },
      { name: 'Religion', ability: 'INT', proficient: false, expertise: false, modifier: 0 },
      { name: 'Sleight of Hand', ability: 'DEX', proficient: false, expertise: false, modifier: 0 },
      { name: 'Stealth', ability: 'DEX', proficient: false, expertise: false, modifier: 0 },
      { name: 'Survival', ability: 'WIS', proficient: false, expertise: false, modifier: 0 },
    ],
    equipment: [],
    currency: { cp: 0, sp: 0, ep: 0, gp: 0, pp: 0 },
    features: [],
    personalityTraits: '',
    ideals: '',
    bonds: '',
    flaws: '',
    spellcasting: null,
    notes: '',
  }
}
