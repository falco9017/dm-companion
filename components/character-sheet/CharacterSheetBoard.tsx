'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { Pencil, Save, X, Trash2, Plus, FileText } from 'lucide-react'
import type { CharacterSheetData, EquipmentItem, Feature, Spellcasting, Skill, Currency } from '@/types/character-sheet'
import { updateCharacterSheet, deleteCharacterSheet } from '@/actions/character-sheet'
import { toast } from 'sonner'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import AbilityScoreCard from './AbilityScoreCard'
import CombatStats from './CombatStats'
import HitPointTracker from './HitPointTracker'
import DeathSaveTracker from './DeathSaveTracker'
import SkillsPanel from './SkillsPanel'
import EquipmentCard from './EquipmentCard'
import FeatureCard from './FeatureCard'
import SpellSection from './SpellSection'
import CurrencyTracker from './CurrencyTracker'
import { useI18n } from '@/lib/i18n-context'

// ── D&D 2024 PHB Data ────────────────────────────────────────────────────────

const SPECIES = [
  'Aasimar', 'Dragonborn', 'Dwarf', 'Elf', 'Gnome', 'Goliath', 'Halfling',
  'Human', 'Orc', 'Tiefling',
  // Common legacy / supplemental
  'Half-Elf', 'Half-Orc', 'Tabaxi', 'Kenku', 'Lizardfolk', 'Tortle',
  'Air Genasi', 'Earth Genasi', 'Fire Genasi', 'Water Genasi', 'Aarakocra',
  'Firbolg', 'Githyanki', 'Githzerai', 'Harengon', 'Owlin', 'Satyr', 'Fairy',
]

const CLASSES = [
  'Artificer', 'Barbarian', 'Bard', 'Cleric', 'Druid', 'Fighter',
  'Monk', 'Paladin', 'Ranger', 'Rogue', 'Sorcerer', 'Warlock', 'Wizard',
]

const SUBCLASSES: Record<string, string[]> = {
  Artificer: ['Alchemist', 'Armorer', 'Artillerist', 'Battle Smith'],
  Barbarian: ['Path of the Berserker', 'Path of the Wild Heart', 'Path of the World Tree', 'Path of the Zealot', 'Path of the Totem Warrior', 'Path of the Storm Herald', 'Path of the Ancestral Guardian'],
  Bard: ['College of Dance', 'College of Glamour', 'College of Lore', 'College of Valor', 'College of Creation', 'College of Eloquence', 'College of Swords'],
  Cleric: ['Life Domain', 'Light Domain', 'Trickery Domain', 'War Domain', 'Arcana Domain', 'Death Domain', 'Forge Domain', 'Grave Domain', 'Knowledge Domain', 'Nature Domain', 'Order Domain', 'Peace Domain', 'Tempest Domain', 'Twilight Domain'],
  Druid: ['Circle of the Land', 'Circle of the Moon', 'Circle of the Sea', 'Circle of the Stars', 'Circle of Wildfire', 'Circle of Spores', 'Circle of Dreams'],
  Fighter: ['Battle Master', 'Champion', 'Eldritch Knight', 'Psi Warrior', 'Arcane Archer', 'Cavalier', 'Echo Knight', 'Rune Knight', 'Samurai'],
  Monk: ['Warrior of the Elements', 'Warrior of the Open Hand', 'Warrior of the Shadow', 'Warrior of Mercy', 'Way of the Astral Self', 'Way of the Drunken Master', 'Way of the Kensei', 'Way of the Sun Soul'],
  Paladin: ['Oath of Devotion', 'Oath of Glory', 'Oath of the Ancients', 'Oath of Vengeance', 'Oath of Conquest', 'Oath of Redemption', 'Oath of the Watchers', 'Oathbreaker'],
  Ranger: ['Beast Master', 'Fey Wanderer', 'Gloom Stalker', 'Hunter', 'Drakewarden', 'Horizon Walker', 'Monster Slayer', 'Swarmkeeper'],
  Rogue: ['Arcane Trickster', 'Assassin', 'Soulknife', 'Thief', 'Inquisitive', 'Mastermind', 'Phantom', 'Scout', 'Swashbuckler'],
  Sorcerer: ['Aberrant Sorcery', 'Clockwork Sorcery', 'Draconic Sorcery', 'Wild Magic Sorcery', 'Shadow Magic', 'Storm Sorcery'],
  Warlock: ['Archfey Patron', 'Celestial Patron', 'Fiend Patron', 'Great Old One Patron', 'Fathomless Patron', 'Genie Patron', 'Hexblade Patron'],
  Wizard: ['Abjurer', 'Diviner', 'Evoker', 'Illusionist', 'Bladesinger', 'Chronurgy Magic', 'Conjurer', 'Enchanter', 'Graviturgy Magic', 'Necromancer', 'Transmuter', 'War Magic'],
}

const BACKGROUNDS = [
  'Acolyte', 'Artisan', 'Charlatan', 'Criminal', 'Entertainer', 'Farmer',
  'Folk Hero', 'Guard', 'Guide', 'Hermit', 'Merchant', 'Noble', 'Outlander',
  'Sage', 'Sailor', 'Scribe', 'Soldier', 'Wayfarer',
  // Legacy
  'Anthropologist', 'Archaeologist', 'City Watch', 'Clan Crafter', 'Cloistered Scholar',
  'Courtier', 'Faction Agent', 'Far Traveler', 'Feylost', 'Fisher', 'Ghost of Saltmarsh',
  'Guild Artisan', 'Haunted One', 'Inheritor', 'Investigator', 'Knight', 'Knight of the Order',
  'Marine', 'Pirate', 'Rune Carver', 'Shipwright', 'Smuggler', 'Spy', 'Urban Bounty Hunter',
  'Uthgardt Tribe Member', 'Wildspacer', 'Witchlight Hand',
]

const ALIGNMENTS = [
  'Lawful Good', 'Neutral Good', 'Chaotic Good',
  'Lawful Neutral', 'True Neutral', 'Chaotic Neutral',
  'Lawful Evil', 'Neutral Evil', 'Chaotic Evil',
  'Unaligned',
]

// ── Ability config ────────────────────────────────────────────────────────────

const abilityConfig = [
  { key: 'strength' as const, name: 'Strength', short: 'STR' },
  { key: 'dexterity' as const, name: 'Dexterity', short: 'DEX' },
  { key: 'constitution' as const, name: 'Constitution', short: 'CON' },
  { key: 'intelligence' as const, name: 'Intelligence', short: 'INT' },
  { key: 'wisdom' as const, name: 'Wisdom', short: 'WIS' },
  { key: 'charisma' as const, name: 'Charisma', short: 'CHA' },
]

// ── Props ─────────────────────────────────────────────────────────────────────

interface CharacterSheetBoardProps {
  characterSheetId: string
  userId: string
  campaignId: string
  initialData: CharacterSheetData
  pdfBlobUrl?: string | null
  onBack: () => void
  onUnsavedChange?: (isDirty: boolean) => void
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function CharacterSheetBoard({
  characterSheetId,
  userId,
  initialData,
  pdfBlobUrl,
  onBack,
  onUnsavedChange,
}: CharacterSheetBoardProps) {
  const [data, setData] = useState<CharacterSheetData>(initialData)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false)
  const { t } = useI18n()
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const autoSave = useCallback(
    (newData: CharacterSheetData) => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current)
      saveTimeoutRef.current = setTimeout(async () => {
        try {
          await updateCharacterSheet(characterSheetId, userId, newData)
        } catch (err) {
          console.error('Auto-save failed:', err)
        }
      }, 800)
    },
    [characterSheetId, userId]
  )

  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current)
      onUnsavedChange?.(false)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const updateData = (patch: Partial<CharacterSheetData>) => {
    const newData = { ...data, ...patch }
    setData(newData)
    if (!editing) autoSave(newData)
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await updateCharacterSheet(characterSheetId, userId, data)
      setEditing(false)
      onUnsavedChange?.(false)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    try {
      await deleteCharacterSheet(characterSheetId, userId)
      onBack()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete')
    }
  }

  const updateAbility = (key: keyof typeof data.abilities, score: number) => {
    const modifier = Math.floor((score - 10) / 2)
    updateData({
      abilities: {
        ...data.abilities,
        [key]: { score, modifier },
      },
    })
  }

  const addEquipment = () => {
    updateData({
      equipment: [
        ...data.equipment,
        { name: 'New Item', quantity: 1, description: '', weight: 0, equipped: false, magical: false },
      ],
    })
  }

  const updateEquipment = (index: number, item: EquipmentItem) => {
    const updated = [...data.equipment]
    updated[index] = item
    updateData({ equipment: updated })
  }

  const removeEquipment = (index: number) => {
    updateData({ equipment: data.equipment.filter((_, i) => i !== index) })
  }

  const addFeature = () => {
    updateData({
      features: [
        ...data.features,
        { name: 'New Feature', description: '', source: 'Class' },
      ],
    })
  }

  const updateFeature = (index: number, feature: Feature) => {
    const updated = [...data.features]
    updated[index] = feature
    updateData({ features: updated })
  }

  const removeFeature = (index: number) => {
    updateData({ features: data.features.filter((_, i) => i !== index) })
  }

  // Subclass suggestions based on selected class
  const subclassSuggestions = SUBCLASSES[data.class] ?? []

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6">
      <div className="max-w-5xl mx-auto">

        {/* ── Identity Card ─────────────────────────────────────────────────── */}
        <div className="mb-4 p-4 rounded-xl border border-border bg-card">
          <div className="flex items-start justify-between gap-3 mb-3">
            {/* Character Name */}
            <div className="flex-1 min-w-0">
              {editing ? (
                <input
                  type="text"
                  value={data.characterName}
                  onChange={(e) => updateData({ characterName: e.target.value })}
                  className="text-2xl font-bold text-foreground bg-transparent border-b border-border focus:border-primary focus:outline-none w-full"
                  placeholder={t('characterSheet.characterNamePlaceholder')}
                />
              ) : (
                <h1 className="text-2xl font-bold text-foreground text-glow truncate">
                  {data.characterName || t('characterSheet.unnamedCharacter')}
                </h1>
              )}
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-1 flex-shrink-0">
              {editing ? (
                <>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="p-2 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                    title={saving ? t('common.saving') : t('common.save')}
                  >
                    <Save className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => { setEditing(false); setData(initialData); onUnsavedChange?.(false) }}
                    className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
                    title={t('common.cancel')}
                  >
                    <X className="w-4 h-4" />
                  </button>
                </>
              ) : (
                <>
                  {pdfBlobUrl && (
                    <a
                      href={pdfBlobUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
                      title="View original PDF"
                    >
                      <FileText className="w-4 h-4" />
                    </a>
                  )}
                  <button
                    onClick={() => { setEditing(true); onUnsavedChange?.(true) }}
                    className="p-2 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                    title={t('common.edit')}
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setConfirmDeleteOpen(true)}
                    className="p-2 rounded-lg text-muted-foreground hover:text-red-400 hover:bg-destructive/10 transition-colors"
                    title={t('common.delete')}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Identity Fields Grid */}
          {editing ? (
            <div className="space-y-2">
              {/* Row 1: Race / Class / Level / Subclass */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <ComboField
                  label={t('characterSheet.race')}
                  value={data.race}
                  onChange={(v) => updateData({ race: v })}
                  options={SPECIES}
                  listId="cs-species"
                  placeholder={t('characterSheet.racePlaceholder')}
                />
                <ComboField
                  label={t('characterSheet.class')}
                  value={data.class}
                  onChange={(v) => updateData({ class: v })}
                  options={CLASSES}
                  listId="cs-classes"
                  placeholder={t('characterSheet.classPlaceholder')}
                />
                <LevelField
                  value={data.level}
                  onChange={(v) => updateData({ level: v })}
                  label={t('characterSheet.level')}
                />
                <ComboField
                  label={t('characterSheet.subclass')}
                  value={data.subclass}
                  onChange={(v) => updateData({ subclass: v })}
                  options={subclassSuggestions}
                  listId="cs-subclasses"
                  placeholder={t('characterSheet.subclassPlaceholder')}
                />
              </div>
            </div>
          ) : (
            /* View Mode */
            <div className="space-y-1.5">
              {/* Primary badges row */}
              <div className="flex flex-wrap items-center gap-1.5">
                {data.race && (
                  <IdentityBadge color="emerald" label={t('characterSheet.race')} value={data.race} />
                )}
                {data.class && (
                  <IdentityBadge color="blue" label={t('characterSheet.class')} value={
                    `${data.class} ${data.level}${data.subclass ? ` — ${data.subclass}` : ''}`
                  } />
                )}
              </div>
            </div>
          )}
        </div>

        {/* ── Main Board Grid ────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Left Column: Ability Scores */}
          <div className="lg:col-span-2 space-y-4">
            <div className="p-3 rounded-xl border border-border bg-card">
              <h3 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-3 text-center">
                {t('characterSheet.abilities')}
              </h3>
              <div className="flex flex-row lg:flex-col items-center justify-center gap-3 flex-wrap">
                {abilityConfig.map(({ key, name }) => (
                  <AbilityScoreCard
                    key={key}
                    name={name}
                    ability={data.abilities[key]}
                    saveProficient={data.savingThrows[key].proficient}
                    saveModifier={data.savingThrows[key].modifier}
                    editing={editing}
                    onChange={(score) => updateAbility(key, score)}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Center Column: Combat + Skills (expanded without personality column) */}
          <div className="lg:col-span-10 space-y-4">
            {/* Combat Stats */}
            <div className="p-4 rounded-xl border border-border bg-card">
              <CombatStats
                armorClass={data.armorClass}
                initiative={data.initiative}
                speed={data.speed}
                proficiencyBonus={data.proficiencyBonus}
                editing={editing}
                onChange={(field, value) => updateData({ [field]: value })}
              />
              <div className="mt-3">
                <HitPointTracker
                  current={data.hitPoints.current}
                  maximum={data.hitPoints.maximum}
                  temporary={data.hitPoints.temporary}
                  editing={editing}
                  onChange={(hp) => updateData({ hitPoints: hp })}
                />
              </div>
              <div className="mt-3 flex flex-wrap gap-3">
                <DeathSaveTracker
                  successes={data.deathSaves.successes}
                  failures={data.deathSaves.failures}
                  onChange={(saves) => updateData({ deathSaves: saves })}
                />
                <div className="flex items-center gap-2 p-2 rounded-lg border border-border bg-card">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    {t('characterSheet.hitDice')}
                  </span>
                  {editing ? (
                    <>
                      <input
                        type="text"
                        value={data.hitDice.remaining}
                        onChange={(e) => updateData({ hitDice: { ...data.hitDice, remaining: e.target.value } })}
                        className="w-12 text-xs text-center bg-transparent border-b border-border focus:border-primary focus:outline-none text-foreground"
                      />
                      <span className="text-[10px] text-muted-foreground">/</span>
                      <input
                        type="text"
                        value={data.hitDice.total}
                        onChange={(e) => updateData({ hitDice: { ...data.hitDice, total: e.target.value } })}
                        className="w-12 text-xs text-center bg-transparent border-b border-border focus:border-primary focus:outline-none text-foreground"
                      />
                    </>
                  ) : (
                    <span className="text-xs text-foreground">
                      {data.hitDice.remaining} / {data.hitDice.total}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Skills */}
            <div className="p-4 rounded-xl border border-border bg-card">
              <SkillsPanel
                skills={data.skills}
                editing={editing}
                onChange={(skills: Skill[]) => updateData({ skills })}
              />
            </div>
          </div>
        </div>

        {/* ── Equipment ─────────────────────────────────────────────────────── */}
        <div className="mt-4 p-4 rounded-xl border border-border bg-card">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              {t('characterSheet.equipment')}
            </h3>
            <button
              onClick={addEquipment}
              className="flex items-center gap-1 text-xs text-primary hover:text-primary transition-colors"
            >
              <Plus className="w-3.5 h-3.5" /> {t('characterSheet.addItem')}
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
            {data.equipment.map((item, i) => (
              <EquipmentCard
                key={i}
                item={item}
                editing={editing}
                onUpdate={(updated) => updateEquipment(i, updated)}
                onRemove={() => removeEquipment(i)}
              />
            ))}
            {data.equipment.length === 0 && (
              <p className="text-xs text-muted-foreground col-span-full text-center py-4">
                {t('characterSheet.noEquipment')}
              </p>
            )}
          </div>
          <div className="mt-3 pt-3 border-t border-border">
            <CurrencyTracker
              currency={data.currency}
              onChange={(currency: Currency) => updateData({ currency })}
            />
          </div>
        </div>

        {/* ── Features & Traits ─────────────────────────────────────────────── */}
        <div className="mt-4 p-4 rounded-xl border border-border bg-card">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              {t('characterSheet.features')}
            </h3>
            {editing && (
              <button
                onClick={addFeature}
                className="flex items-center gap-1 text-xs text-primary hover:text-primary transition-colors"
              >
                <Plus className="w-3.5 h-3.5" /> {t('characterSheet.addFeature')}
              </button>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {data.features.map((feature, i) => (
              <FeatureCard
                key={i}
                feature={feature}
                editing={editing}
                onUpdate={(updated) => updateFeature(i, updated)}
                onRemove={() => removeFeature(i)}
              />
            ))}
            {data.features.length === 0 && (
              <p className="text-xs text-muted-foreground col-span-full text-center py-4">
                {t('characterSheet.noFeatures')}
              </p>
            )}
          </div>
        </div>

        {/* ── Spellcasting ──────────────────────────────────────────────────── */}
        {(data.spellcasting || editing) && (
          <div className="mt-4 p-4 rounded-xl border border-border bg-card">
            {data.spellcasting ? (
              <SpellSection
                spellcasting={data.spellcasting}
                editing={editing}
                characterClass={data.class}
                onChange={(spellcasting: Spellcasting) => updateData({ spellcasting })}
              />
            ) : editing ? (
              <button
                onClick={() =>
                  updateData({
                    spellcasting: {
                      ability: 'WIS',
                      saveDC: 10,
                      attackBonus: 2,
                      spellSlots: [],
                      spells: [],
                    },
                  })
                }
                className="flex items-center gap-2 text-sm text-primary hover:text-primary transition-colors mx-auto py-4"
              >
                <Plus className="w-4 h-4" /> {t('characterSheet.addSpellcasting')}
              </button>
            ) : null}
          </div>
        )}

        {/* ── Notes & Background ────────────────────────────────────────────── */}
        <div className="mt-4 p-4 rounded-xl border border-border bg-card">
          <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">
            {t('characterSheet.notesAndBackground')}
          </h3>
          <div className="space-y-3">
            <div className="p-2 rounded-lg border border-border bg-card border-l-2 border-l-amber-400">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">
                {t('characterSheet.background')}
              </label>
              <input
                list="cs-backgrounds"
                value={data.background}
                onChange={(e) => updateData({ background: e.target.value })}
                className="w-full text-sm text-foreground bg-transparent border-none focus:outline-none"
                placeholder={t('characterSheet.backgroundPlaceholder')}
              />
              <datalist id="cs-backgrounds">
                {BACKGROUNDS.map((o) => (
                  <option key={o} value={o} />
                ))}
              </datalist>
            </div>

            {/* General Notes */}
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">
                {t('characterSheet.notes')}
              </p>
              <textarea
                value={data.notes}
                onChange={(e) => updateData({ notes: e.target.value })}
                rows={4}
                className="w-full text-sm text-muted-foreground bg-transparent border border-border rounded-lg p-3 focus:border-primary focus:outline-none resize-y"
                placeholder={t('characterSheet.notesPlaceholder')}
              />
            </div>
          </div>
        </div>

      </div>
      <ConfirmDialog
        open={confirmDeleteOpen}
        onOpenChange={setConfirmDeleteOpen}
        title="Delete Character Sheet"
        description="Delete this character sheet? The wiki entry will remain."
        confirmLabel="Delete"
        cancelLabel="Cancel"
        variant="destructive"
        onConfirm={handleDelete}
      />
    </div>
  )
}

// ── Helper Components ─────────────────────────────────────────────────────────

/** Labeled text input for identity fields */
function IdentityField({
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
}: {
  label: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
  type?: string
}) {
  return (
    <div>
      <label className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-0.5">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full text-sm text-foreground bg-card border border-border rounded-lg px-2 py-1.5 focus:border-primary focus:outline-none"
      />
    </div>
  )
}

/** Combobox input: datalist suggestions + free text override */
function ComboField({
  label,
  value,
  onChange,
  options,
  listId,
  placeholder,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  options: string[]
  listId: string
  placeholder?: string
}) {
  return (
    <div>
      <label className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-0.5">
        {label}
      </label>
      <input
        list={listId}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full text-sm text-foreground bg-card border border-border rounded-lg px-2 py-1.5 focus:border-primary focus:outline-none"
      />
      <datalist id={listId}>
        {options.map((o) => (
          <option key={o} value={o} />
        ))}
      </datalist>
    </div>
  )
}

/** Level selector 1–20 with datalist */
function LevelField({
  label,
  value,
  onChange,
}: {
  label: string
  value: number
  onChange: (v: number) => void
}) {
  return (
    <div>
      <label className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-0.5">
        {label}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value))}
        className="w-full text-sm text-foreground bg-card border border-border rounded-lg px-2 py-1.5 focus:border-primary focus:outline-none appearance-none"
      >
        {Array.from({ length: 20 }, (_, i) => i + 1).map((lv) => (
          <option key={lv} value={lv}>{lv}</option>
        ))}
      </select>
    </div>
  )
}

/** View-mode identity badge */
function IdentityBadge({
  color,
  label,
  value,
}: {
  color: 'emerald' | 'blue' | 'amber' | 'neutral'
  label: string
  value: string
}) {
  const colorMap = {
    emerald: 'bg-emerald-500/20 text-emerald-300',
    blue: 'bg-blue-500/20 text-blue-300',
    amber: 'bg-amber-500/20 text-amber-300',
    neutral: 'bg-white/5 text-muted-foreground',
  }
  return (
    <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full ${colorMap[color]}`}>
      <span className="opacity-60 text-[10px]">{label}</span>
      {value}
    </span>
  )
}

/** Single personality/background field in the notes section */
function PersonalityField({
  label,
  color,
  value,
  onChange,
}: {
  label: string
  color: string
  value: string
  onChange: (v: string) => void
}) {
  if (!value && !onChange) return null
  return (
    <div className={`p-2 rounded-lg border border-border bg-card border-l-2 ${color}`}>
      <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">{label}</p>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={2}
        className="w-full text-xs text-muted-foreground bg-transparent border-none focus:outline-none resize-none"
        placeholder={`${label}...`}
      />
    </div>
  )
}
