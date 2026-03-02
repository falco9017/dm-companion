'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { Pencil, Save, X, Trash2, Plus, FileText, LayoutGrid, ChevronDown, ChevronRight } from 'lucide-react'
import type { CharacterSheetData, EquipmentItem, Feature, Spellcasting, Skill, Currency } from '@/types/character-sheet'
import { updateCharacterSheet, deleteCharacterSheet } from '@/actions/character-sheet'
import { toast } from 'sonner'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { Button } from '@/components/ui/button'
import AbilityScoreCard from './AbilityScoreCard'
import CombatStats from './CombatStats'
import HitPointTracker from './HitPointTracker'
import DeathSaveTracker from './DeathSaveTracker'
import SkillsPanel from './SkillsPanel'
import EquipmentCard from './EquipmentCard'
import FeaturesGroupCard from './FeatureCard'
import SpellSection from './SpellSection'
import CurrencyTracker from './CurrencyTracker'
import { useI18n } from '@/lib/i18n-context'

// ── D&D 2024 PHB Data ────────────────────────────────────────────────────────

const SPECIES = [
  'Aasimar', 'Dragonborn', 'Dwarf', 'Elf', 'Gnome', 'Goliath', 'Halfling',
  'Human', 'Orc', 'Tiefling',
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

const ALIGNMENTS = [
  'Lawful Good', 'Neutral Good', 'Chaotic Good',
  'Lawful Neutral', 'True Neutral', 'Chaotic Neutral',
  'Lawful Evil', 'Neutral Evil', 'Chaotic Evil',
  'Unaligned',
]
void ALIGNMENTS

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
  /** If provided, shows a "Wiki View" toggle button in the header */
  onSwitchToWiki?: () => void
}

// ── Collapsible section helper ────────────────────────────────────────────────

function SectionHeader({
  title,
  collapsed,
  onToggle,
  action,
}: {
  title: string
  collapsed: boolean
  onToggle: () => void
  action?: React.ReactNode
}) {
  return (
    <div className="flex items-center justify-between dnd-header-border cursor-pointer" onClick={onToggle}>
      <div className="flex items-center gap-1.5">
        <button className="p-0.5 text-ink-secondary hover:text-ink transition-colors">
          {collapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
        <h3 className="dnd-section-title">{title}</h3>
      </div>
      {action && <div onClick={(e) => e.stopPropagation()}>{action}</div>}
    </div>
  )
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function CharacterSheetBoard({
  characterSheetId,
  userId,
  initialData,
  pdfBlobUrl,
  onBack,
  onUnsavedChange,
  onSwitchToWiki,
}: CharacterSheetBoardProps) {
  const [data, setData] = useState<CharacterSheetData>(initialData)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false)
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({})
  const { t } = useI18n()
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const toggleSection = (key: string) =>
    setCollapsed((prev) => ({ ...prev, [key]: !prev[key] }))

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

  const addFeature = (source: 'Class' | 'Race' | 'Background') => {
    updateData({
      features: [
        ...data.features,
        { name: 'New Feature', description: '', source },
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

  const subclassSuggestions = SUBCLASSES[data.class] ?? []

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* ── Sticky toolbar ──────────────────────────────────────────────────── */}
      <div className="flex-shrink-0 border-b bg-background/90 backdrop-blur-sm px-4 py-2 flex items-center justify-between gap-2 z-10">
        {/* View toggle */}
        <div className="flex items-center gap-1">
          {onSwitchToWiki && (
            <>
              <div className="flex items-center gap-1 text-xs font-medium px-2.5 py-1 bg-secondary text-secondary-foreground rounded-md">
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>{t('characterSheet.boardView')}</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={onSwitchToWiki}
                className="gap-1 text-muted-foreground h-7 text-xs"
              >
                <FileText className="w-3.5 h-3.5" />
                {t('characterSheet.wikiView')}
              </Button>
            </>
          )}
          {pdfBlobUrl && (
            <a
              href={pdfBlobUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
              title="View original PDF"
            >
              <FileText className="w-3.5 h-3.5" />
            </a>
          )}
        </div>

        {/* Edit / Save / Delete */}
        <div className="flex items-center gap-1">
          {editing ? (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSave}
                disabled={saving}
                className="h-7 gap-1 text-xs text-gold-dark hover:text-gold hover:bg-gold/10"
                title={saving ? t('common.saving') : t('common.save')}
              >
                <Save className="w-3.5 h-3.5" />
                {saving ? t('common.saving') : t('common.save')}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => { setEditing(false); setData(initialData); onUnsavedChange?.(false) }}
                className="h-7 gap-1 text-xs"
                title={t('common.cancel')}
              >
                <X className="w-3.5 h-3.5" />
                {t('common.cancel')}
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => { setEditing(true); onUnsavedChange?.(true) }}
                className="h-7 gap-1 text-xs"
                title={t('common.edit')}
              >
                <Pencil className="w-3.5 h-3.5" />
                {t('common.edit')}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setConfirmDeleteOpen(true)}
                className="h-7 gap-1 text-xs text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                title={t('common.delete')}
              >
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            </>
          )}
        </div>
      </div>

      {/* ── Scrollable content ──────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 parchment-bg">
        <div className="max-w-5xl mx-auto">

          {/* ── Identity Card ──────────────────────────────────────────────── */}
          <div className="mb-4 p-4 dnd-frame parchment-inner">
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="flex-1 min-w-0">
                {editing ? (
                  <input
                    type="text"
                    value={data.characterName}
                    onChange={(e) => updateData({ characterName: e.target.value })}
                    className="text-2xl font-bold text-ink bg-transparent border-b-2 border-gold/40 focus:border-gold focus:outline-none focus:ring-0 w-full"
                    placeholder={t('characterSheet.characterNamePlaceholder')}
                  />
                ) : (
                  <h1 className="text-2xl font-bold text-ink truncate" style={{ borderBottom: '2px solid var(--gold)', paddingBottom: '2px', display: 'inline-block' }}>
                    {data.characterName || t('characterSheet.unnamedCharacter')}
                  </h1>
                )}
              </div>
            </div>

            {editing ? (
              <div className="space-y-2">
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
              <div className="space-y-1.5">
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

          {/* ── Main Board Grid ─────────────────────────────────────────────── */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            {/* Left Column: Ability Scores */}
            <div className="lg:col-span-2 space-y-4">
              <div className="p-3 dnd-frame parchment-inner">
                <SectionHeader
                  title={t('characterSheet.abilities')}
                  collapsed={!!collapsed['abilities']}
                  onToggle={() => toggleSection('abilities')}
                />
                {!collapsed['abilities'] && (
                  <div className="flex flex-row lg:flex-col items-center justify-center gap-3 flex-wrap mt-2">
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
                )}
              </div>
            </div>

            {/* Center Column */}
            <div className="lg:col-span-10 space-y-4">
              {/* Combat Stats */}
              <div className="p-4 dnd-frame parchment-inner">
                <SectionHeader
                  title={t('characterSheet.combat')}
                  collapsed={!!collapsed['combat']}
                  onToggle={() => toggleSection('combat')}
                />
                {!collapsed['combat'] && (
                  <div className="mt-2">
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
                      <div className="flex items-center gap-2 p-2 dnd-frame-light parchment-inner">
                        <span className="dnd-section-title text-[10px]">
                          {t('characterSheet.hitDice')}
                        </span>
                        {editing ? (
                          <>
                            <input
                              type="text"
                              value={data.hitDice.remaining}
                              onChange={(e) => updateData({ hitDice: { ...data.hitDice, remaining: e.target.value } })}
                              className="w-12 text-xs text-center bg-transparent border-b border-gold/40 focus:border-gold focus:outline-none text-ink"
                            />
                            <span className="text-[10px] text-ink-secondary">/</span>
                            <input
                              type="text"
                              value={data.hitDice.total}
                              onChange={(e) => updateData({ hitDice: { ...data.hitDice, total: e.target.value } })}
                              className="w-12 text-xs text-center bg-transparent border-b border-gold/40 focus:border-gold focus:outline-none text-ink"
                            />
                          </>
                        ) : (
                          <span className="text-xs text-ink">
                            {data.hitDice.remaining} / {data.hitDice.total}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Skills */}
              <div className="p-4 dnd-frame parchment-inner">
                <SectionHeader
                  title={t('characterSheet.skills')}
                  collapsed={!!collapsed['skills']}
                  onToggle={() => toggleSection('skills')}
                />
                {!collapsed['skills'] && (
                  <div className="mt-2">
                    <SkillsPanel
                      skills={data.skills}
                      editing={editing}
                      onChange={(skills: Skill[]) => updateData({ skills })}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ── Equipment ──────────────────────────────────────────────────── */}
          <div className="mt-4 p-4 dnd-frame parchment-inner">
            <SectionHeader
              title={t('characterSheet.equipment')}
              collapsed={!!collapsed['equipment']}
              onToggle={() => toggleSection('equipment')}
              action={
                <button
                  onClick={addEquipment}
                  className="flex items-center gap-1 text-xs text-gold-dark hover:text-gold transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" /> {t('characterSheet.addItem')}
                </button>
              }
            />
            {!collapsed['equipment'] && (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 mt-2">
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
                    <p className="text-xs text-ink-secondary col-span-full text-center py-4">
                      {t('characterSheet.noEquipment')}
                    </p>
                  )}
                </div>
                <div className="dnd-divider"></div>
                <div className="mt-3">
                  <CurrencyTracker
                    currency={data.currency}
                    onChange={(currency: Currency) => updateData({ currency })}
                  />
                </div>
              </>
            )}
          </div>

          {/* ── Features & Traits ──────────────────────────────────────────── */}
          <div className="mt-4 p-4 dnd-frame parchment-inner">
            <SectionHeader
              title={t('characterSheet.features')}
              collapsed={!!collapsed['features']}
              onToggle={() => toggleSection('features')}
            />
            {!collapsed['features'] && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
                {(['Class', 'Race'] as const).map((src) => (
                  <FeaturesGroupCard
                    key={src}
                    source={src}
                    features={data.features
                      .map((f, i) => ({ feature: f, index: i }))
                      .filter(({ feature }) =>
                        src === 'Class'
                          ? feature.source === 'Class' || feature.source === 'Feat' || feature.source === 'Background'
                          : feature.source === src
                      )}
                    editing={editing}
                    onUpdate={updateFeature}
                    onRemove={removeFeature}
                    onAdd={() => addFeature(src)}
                  />
                ))}
              </div>
            )}
          </div>

          {/* ── Spellcasting ─────────────────────────────────────────────── */}
          {(data.spellcasting || editing) && (
            <div className="mt-4 p-4 dnd-frame parchment-inner">
              {data.spellcasting ? (
                <>
                  <SectionHeader
                    title="Spellcasting"
                    collapsed={!!collapsed['spells']}
                    onToggle={() => toggleSection('spells')}
                  />
                  {!collapsed['spells'] && (
                    <div className="mt-2">
                      <SpellSection
                        spellcasting={data.spellcasting}
                        editing={editing}
                        characterClass={data.class}
                        onChange={(spellcasting: Spellcasting) => updateData({ spellcasting })}
                      />
                    </div>
                  )}
                </>
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
                  className="flex items-center gap-2 text-sm text-gold-dark hover:text-gold transition-colors mx-auto py-4"
                >
                  <Plus className="w-4 h-4" /> {t('characterSheet.addSpellcasting')}
                </button>
              ) : null}
            </div>
          )}

          {/* ── Notes & Background ──────────────────────────────────────── */}
          <div className="mt-4 p-4 dnd-frame parchment-inner">
            <SectionHeader
              title={t('characterSheet.notesAndBackground')}
              collapsed={!!collapsed['notes']}
              onToggle={() => toggleSection('notes')}
            />
            {!collapsed['notes'] && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
                <div>
                  <p className="dnd-section-title text-[10px] mb-1">
                    {t('characterSheet.background')}
                  </p>
                  <textarea
                    value={data.background}
                    onChange={(e) => updateData({ background: e.target.value })}
                    rows={5}
                    className="w-full text-sm text-ink-secondary bg-transparent border border-gold/30 rounded-lg p-3 focus:border-gold focus:outline-none resize-y"
                    placeholder={t('characterSheet.backgroundPlaceholder')}
                  />
                </div>
                <div>
                  <p className="dnd-section-title text-[10px] mb-1">
                    {t('characterSheet.notes')}
                  </p>
                  <textarea
                    value={data.notes}
                    onChange={(e) => updateData({ notes: e.target.value })}
                    rows={5}
                    className="w-full text-sm text-ink-secondary bg-transparent border border-gold/30 rounded-lg p-3 focus:border-gold focus:outline-none resize-y"
                    placeholder={t('characterSheet.notesPlaceholder')}
                  />
                </div>
              </div>
            )}
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
      <label className="block dnd-section-title text-[10px] mb-0.5">{label}</label>
      <input
        list={listId}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full text-sm text-ink bg-parchment-dark/30 border border-gold/30 rounded-lg px-2 py-1.5 focus:border-gold focus:outline-none"
      />
      <datalist id={listId}>
        {options.map((o) => (
          <option key={o} value={o} />
        ))}
      </datalist>
    </div>
  )
}

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
      <label className="block dnd-section-title text-[10px] mb-0.5">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value))}
        className="w-full text-sm text-ink bg-parchment-dark/30 border border-gold/30 rounded-lg px-2 py-1.5 focus:border-gold focus:outline-none appearance-none"
      >
        {Array.from({ length: 20 }, (_, i) => i + 1).map((lv) => (
          <option key={lv} value={lv}>{lv}</option>
        ))}
      </select>
    </div>
  )
}

function IdentityBadge({
  color,
  label,
  value,
}: {
  color: 'emerald' | 'blue' | 'amber' | 'neutral'
  label: string
  value: string
}) {
  void color
  return (
    <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-parchment-dark/50 text-ink border border-gold/30">
      <span className="opacity-70 text-[10px] text-gold-dark">{label}</span>
      {value}
    </span>
  )
}
