import { getGeminiFlash } from './client'
import type { CharacterSheetData } from '@/types/character-sheet'
import { createEmptyCharacterSheet } from '@/types/character-sheet'
import { trackUsage, extractTokenCounts } from '@/lib/usage-tracking'

export async function parseCharacterPdf(
  pdfBase64: string,
  mimeType: string = 'application/pdf',
  userId?: string,
  campaignId?: string
): Promise<CharacterSheetData> {
  const model = getGeminiFlash()

  const prompt = `You are a D&D character sheet parser. Analyze this PDF document which is a D&D 5e character sheet (likely exported from D&D Beyond or a similar tool).

Extract ALL character information and return it as a JSON object with exactly this structure:

{
  "characterName": "string",
  "playerName": "string",
  "class": "string (e.g. Fighter, Wizard)",
  "subclass": "string (e.g. Champion, School of Evocation)",
  "level": number,
  "race": "string (e.g. Human, Elf, Dwarf)",
  "background": "string (e.g. Soldier, Noble)",
  "alignment": "string (e.g. Lawful Good)",
  "experiencePoints": number,
  "abilities": {
    "strength": { "score": number, "modifier": number },
    "dexterity": { "score": number, "modifier": number },
    "constitution": { "score": number, "modifier": number },
    "intelligence": { "score": number, "modifier": number },
    "wisdom": { "score": number, "modifier": number },
    "charisma": { "score": number, "modifier": number }
  },
  "armorClass": number,
  "initiative": number,
  "speed": number,
  "hitPoints": { "maximum": number, "current": number, "temporary": 0 },
  "hitDice": { "total": "string (e.g. 5d10)", "remaining": "string (e.g. 5d10)" },
  "deathSaves": { "successes": 0, "failures": 0 },
  "proficiencyBonus": number,
  "savingThrows": {
    "strength": { "proficient": boolean, "modifier": number },
    "dexterity": { "proficient": boolean, "modifier": number },
    "constitution": { "proficient": boolean, "modifier": number },
    "intelligence": { "proficient": boolean, "modifier": number },
    "wisdom": { "proficient": boolean, "modifier": number },
    "charisma": { "proficient": boolean, "modifier": number }
  },
  "skills": [
    { "name": "Acrobatics", "ability": "DEX", "proficient": boolean, "expertise": boolean, "modifier": number },
    { "name": "Animal Handling", "ability": "WIS", "proficient": boolean, "expertise": boolean, "modifier": number },
    { "name": "Arcana", "ability": "INT", "proficient": boolean, "expertise": boolean, "modifier": number },
    { "name": "Athletics", "ability": "STR", "proficient": boolean, "expertise": boolean, "modifier": number },
    { "name": "Deception", "ability": "CHA", "proficient": boolean, "expertise": boolean, "modifier": number },
    { "name": "History", "ability": "INT", "proficient": boolean, "expertise": boolean, "modifier": number },
    { "name": "Insight", "ability": "WIS", "proficient": boolean, "expertise": boolean, "modifier": number },
    { "name": "Intimidation", "ability": "CHA", "proficient": boolean, "expertise": boolean, "modifier": number },
    { "name": "Investigation", "ability": "INT", "proficient": boolean, "expertise": boolean, "modifier": number },
    { "name": "Medicine", "ability": "WIS", "proficient": boolean, "expertise": boolean, "modifier": number },
    { "name": "Nature", "ability": "INT", "proficient": boolean, "expertise": boolean, "modifier": number },
    { "name": "Perception", "ability": "WIS", "proficient": boolean, "expertise": boolean, "modifier": number },
    { "name": "Performance", "ability": "CHA", "proficient": boolean, "expertise": boolean, "modifier": number },
    { "name": "Persuasion", "ability": "CHA", "proficient": boolean, "expertise": boolean, "modifier": number },
    { "name": "Religion", "ability": "INT", "proficient": boolean, "expertise": boolean, "modifier": number },
    { "name": "Sleight of Hand", "ability": "DEX", "proficient": boolean, "expertise": boolean, "modifier": number },
    { "name": "Stealth", "ability": "DEX", "proficient": boolean, "expertise": boolean, "modifier": number },
    { "name": "Survival", "ability": "WIS", "proficient": boolean, "expertise": boolean, "modifier": number }
  ],
  "equipment": [
    { "name": "string", "quantity": number, "description": "string", "weight": number, "equipped": boolean, "magical": boolean, "attackBonus": number_or_undefined, "damage": "string_or_undefined" }
  ],
  "currency": { "cp": number, "sp": number, "ep": number, "gp": number, "pp": number },
  "features": [
    { "name": "string", "description": "string", "source": "Class|Race|Background|Feat", "usesMax": number_or_undefined, "usesCurrent": 0 }
  ],
  "personalityTraits": "string",
  "ideals": "string",
  "bonds": "string",
  "flaws": "string",
  "spellcasting": null_or_object,
  "notes": "string"
}

If the character has spellcasting, include:
{
  "ability": "string (e.g. WIS, INT, CHA)",
  "saveDC": number,
  "attackBonus": number,
  "spellSlots": [{ "level": number, "total": number, "used": 0 }],
  "spells": [{ "name": "string", "level": number, "prepared": boolean, "ritual": boolean, "concentration": boolean, "description": "brief description", "school": "string" }]
}

For weapons in equipment, include attackBonus and damage fields.
For features with limited uses (like Second Wind), include usesMax.
Set spellcasting to null if the character is not a spellcaster.
For any fields you cannot determine from the PDF, use sensible defaults.
Current HP should equal maximum HP unless the sheet shows otherwise.

Return ONLY the JSON object, no markdown formatting or explanation.`

  const result = await model.generateContent([
    { text: prompt },
    {
      inlineData: {
        mimeType,
        data: pdfBase64,
      },
    },
  ])

  // Track usage
  if (userId) {
    const tokens = extractTokenCounts(result.response.usageMetadata)
    trackUsage(userId, 'character_parse', tokens, campaignId)
  }

  const responseText = result.response.text()

  try {
    // Extract JSON from response (handle potential markdown wrapping)
    const jsonMatch = responseText.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error('No JSON object found in AI response')
    }

    const parsed = JSON.parse(jsonMatch[0]) as CharacterSheetData

    // Merge with empty sheet to ensure all fields exist
    const empty = createEmptyCharacterSheet()
    const merged: CharacterSheetData = {
      ...empty,
      ...parsed,
      abilities: { ...empty.abilities, ...parsed.abilities },
      hitPoints: { ...empty.hitPoints, ...parsed.hitPoints },
      hitDice: { ...empty.hitDice, ...parsed.hitDice },
      deathSaves: { ...empty.deathSaves, ...parsed.deathSaves },
      savingThrows: { ...empty.savingThrows, ...parsed.savingThrows },
      currency: { ...empty.currency, ...parsed.currency },
      skills: parsed.skills?.length > 0 ? parsed.skills : empty.skills,
      equipment: parsed.equipment || [],
      features: parsed.features || [],
    }

    return merged
  } catch (error) {
    console.error('Failed to parse character sheet from PDF:', error)
    console.error('Raw response:', responseText.slice(0, 500))
    throw new Error('Failed to parse character sheet from the PDF. Please try again or create manually.')
  }
}
