'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { Pencil, Save, X, Trash2, Plus, FileText } from 'lucide-react'
import type { CharacterSheetData, EquipmentItem, Feature, Spellcasting, Skill, Currency } from '@/types/character-sheet'
import { updateCharacterSheet, deleteCharacterSheet } from '@/actions/character-sheet'
import AbilityScoreCard from './AbilityScoreCard'
import CombatStats from './CombatStats'
import HitPointTracker from './HitPointTracker'
import DeathSaveTracker from './DeathSaveTracker'
import SkillsPanel from './SkillsPanel'
import EquipmentCard from './EquipmentCard'
import FeatureCard from './FeatureCard'
import SpellSection from './SpellSection'
import CurrencyTracker from './CurrencyTracker'
import PersonalityCard from './PersonalityCard'
import { useI18n } from '@/lib/i18n-context'

interface CharacterSheetBoardProps {
  characterSheetId: string
  userId: string
  campaignId: string
  initialData: CharacterSheetData
  pdfBlobUrl?: string | null
  onBack: () => void
}

const abilityConfig = [
  { key: 'strength' as const, name: 'Strength', short: 'STR' },
  { key: 'dexterity' as const, name: 'Dexterity', short: 'DEX' },
  { key: 'constitution' as const, name: 'Constitution', short: 'CON' },
  { key: 'intelligence' as const, name: 'Intelligence', short: 'INT' },
  { key: 'wisdom' as const, name: 'Wisdom', short: 'WIS' },
  { key: 'charisma' as const, name: 'Charisma', short: 'CHA' },
]

export default function CharacterSheetBoard({
  characterSheetId,
  userId,
  initialData,
  pdfBlobUrl,
  onBack,
}: CharacterSheetBoardProps) {
  const [data, setData] = useState<CharacterSheetData>(initialData)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const { t } = useI18n()
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Auto-save with debounce for interactive changes (HP, slots, etc.)
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
    }
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
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Delete this character sheet? The wiki entry will remain.')) return
    try {
      await deleteCharacterSheet(characterSheetId, userId)
      onBack()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete')
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

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6">
      <div className="max-w-5xl mx-auto">
        {/* Identity Bar */}
        <div className="mb-4 p-4 rounded-xl border border-border-theme bg-surface-elevated">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              {editing ? (
                <input
                  type="text"
                  value={data.characterName}
                  onChange={(e) => updateData({ characterName: e.target.value })}
                  className="text-2xl font-bold text-text-primary bg-transparent border-b border-border-theme focus:border-accent-purple focus:outline-none w-full mb-2"
                  placeholder="Character Name"
                />
              ) : (
                <h1 className="text-2xl font-bold text-text-primary text-glow mb-1">
                  {data.characterName || 'Unnamed Character'}
                </h1>
              )}
              <div className="flex flex-wrap items-center gap-2">
                {editing ? (
                  <>
                    <EditableTag value={data.race} onChange={(v) => updateData({ race: v })} placeholder="Race" />
                    <EditableTag value={data.class} onChange={(v) => updateData({ class: v })} placeholder="Class" />
                    <EditableTag value={String(data.level)} onChange={(v) => updateData({ level: parseInt(v) || 1 })} placeholder="Lv" small />
                    <EditableTag value={data.subclass} onChange={(v) => updateData({ subclass: v })} placeholder="Subclass" />
                    <EditableTag value={data.background} onChange={(v) => updateData({ background: v })} placeholder="Background" />
                    <EditableTag value={data.alignment} onChange={(v) => updateData({ alignment: v })} placeholder="Alignment" />
                  </>
                ) : (
                  <>
                    {data.race && <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300">{data.race}</span>}
                    {data.class && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300">
                        {data.class} {data.level}
                        {data.subclass && ` (${data.subclass})`}
                      </span>
                    )}
                    {data.background && <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300">{data.background}</span>}
                    {data.alignment && <span className="text-xs px-2 py-0.5 rounded-full bg-white/5 text-text-muted">{data.alignment}</span>}
                  </>
                )}
              </div>
              {editing && (
                <div className="flex gap-2 mt-2">
                  <EditableTag value={data.playerName} onChange={(v) => updateData({ playerName: v })} placeholder="Player Name" />
                  <EditableTag value={String(data.experiencePoints)} onChange={(v) => updateData({ experiencePoints: parseInt(v) || 0 })} placeholder="XP" small />
                </div>
              )}
              {!editing && data.playerName && (
                <p className="text-xs text-text-muted mt-1">Player: {data.playerName}</p>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1 flex-shrink-0">
              {editing ? (
                <>
                  <button onClick={handleSave} disabled={saving} className="p-2 rounded-lg text-text-muted hover:text-accent-purple-light hover:bg-accent-purple/10 transition-colors" title={saving ? t('common.saving') : t('common.save')}>
                    <Save className="w-4 h-4" />
                  </button>
                  <button onClick={() => { setEditing(false); setData(initialData) }} className="p-2 rounded-lg text-text-muted hover:text-text-primary hover:bg-white/5 transition-colors" title={t('common.cancel')}>
                    <X className="w-4 h-4" />
                  </button>
                </>
              ) : (
                <>
                  {pdfBlobUrl && (
                    <a href={pdfBlobUrl} target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg text-text-muted hover:text-text-primary hover:bg-white/5 transition-colors" title="View original PDF">
                      <FileText className="w-4 h-4" />
                    </a>
                  )}
                  <button onClick={() => setEditing(true)} className="p-2 rounded-lg text-text-muted hover:text-accent-purple-light hover:bg-accent-purple/10 transition-colors" title={t('common.edit')}>
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button onClick={handleDelete} className="p-2 rounded-lg text-text-muted hover:text-red-400 hover:bg-error/10 transition-colors" title={t('common.delete')}>
                    <Trash2 className="w-4 h-4" />
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Main Board Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Left Column: Ability Scores */}
          <div className="lg:col-span-2 space-y-4">
            <div className="p-3 rounded-xl border border-border-theme bg-surface-elevated">
              <h3 className="text-[10px] font-bold uppercase tracking-wider text-text-muted mb-3 text-center">Abilities</h3>
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

          {/* Center Column: Combat + Skills */}
          <div className="lg:col-span-6 space-y-4">
            {/* Combat Stats */}
            <div className="p-4 rounded-xl border border-border-theme bg-surface-elevated">
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
                <div className="flex items-center gap-2 p-2 rounded-lg border border-border-theme bg-surface-elevated">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted">Hit Dice</span>
                  {editing ? (
                    <>
                      <input type="text" value={data.hitDice.remaining} onChange={(e) => updateData({ hitDice: { ...data.hitDice, remaining: e.target.value } })} className="w-12 text-xs text-center bg-transparent border-b border-border-theme focus:border-accent-purple focus:outline-none text-text-primary" />
                      <span className="text-[10px] text-text-muted">/</span>
                      <input type="text" value={data.hitDice.total} onChange={(e) => updateData({ hitDice: { ...data.hitDice, total: e.target.value } })} className="w-12 text-xs text-center bg-transparent border-b border-border-theme focus:border-accent-purple focus:outline-none text-text-primary" />
                    </>
                  ) : (
                    <span className="text-xs text-text-primary">{data.hitDice.remaining} / {data.hitDice.total}</span>
                  )}
                </div>
              </div>
            </div>

            {/* Skills */}
            <div className="p-4 rounded-xl border border-border-theme bg-surface-elevated">
              <SkillsPanel
                skills={data.skills}
                editing={editing}
                onChange={(skills: Skill[]) => updateData({ skills })}
              />
            </div>
          </div>

          {/* Right Column: Personality */}
          <div className="lg:col-span-4 space-y-4">
            <div className="p-4 rounded-xl border border-border-theme bg-surface-elevated">
              <PersonalityCard
                personalityTraits={data.personalityTraits}
                ideals={data.ideals}
                bonds={data.bonds}
                flaws={data.flaws}
                editing={editing}
                onChange={(field, value) => updateData({ [field]: value })}
              />
            </div>
          </div>
        </div>

        {/* Equipment Cards */}
        <div className="mt-4 p-4 rounded-xl border border-border-theme bg-surface-elevated">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-text-muted">Equipment</h3>
            {(editing || true) && (
              <button
                onClick={addEquipment}
                className="flex items-center gap-1 text-xs text-accent-purple-light hover:text-accent-purple transition-colors"
              >
                <Plus className="w-3.5 h-3.5" /> Add Item
              </button>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
            {data.equipment.map((item, i) => (
              <EquipmentCard
                key={`${item.name}-${i}`}
                item={item}
                editing={editing}
                onUpdate={(updated) => updateEquipment(i, updated)}
                onRemove={() => removeEquipment(i)}
              />
            ))}
            {data.equipment.length === 0 && (
              <p className="text-xs text-text-muted col-span-full text-center py-4">No equipment yet</p>
            )}
          </div>
          <div className="mt-3 pt-3 border-t border-border-theme">
            <CurrencyTracker
              currency={data.currency}
              onChange={(currency: Currency) => updateData({ currency })}
            />
          </div>
        </div>

        {/* Features & Traits */}
        <div className="mt-4 p-4 rounded-xl border border-border-theme bg-surface-elevated">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-text-muted">Features & Traits</h3>
            {editing && (
              <button
                onClick={addFeature}
                className="flex items-center gap-1 text-xs text-accent-purple-light hover:text-accent-purple transition-colors"
              >
                <Plus className="w-3.5 h-3.5" /> Add Feature
              </button>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {data.features.map((feature, i) => (
              <FeatureCard
                key={`${feature.name}-${i}`}
                feature={feature}
                editing={editing}
                onUpdate={(updated) => updateFeature(i, updated)}
                onRemove={() => removeFeature(i)}
              />
            ))}
            {data.features.length === 0 && (
              <p className="text-xs text-text-muted col-span-full text-center py-4">No features yet</p>
            )}
          </div>
        </div>

        {/* Spellcasting (if applicable) */}
        {(data.spellcasting || editing) && (
          <div className="mt-4 p-4 rounded-xl border border-border-theme bg-surface-elevated">
            {data.spellcasting ? (
              <SpellSection
                spellcasting={data.spellcasting}
                editing={editing}
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
                className="flex items-center gap-2 text-sm text-accent-purple-light hover:text-accent-purple transition-colors mx-auto py-4"
              >
                <Plus className="w-4 h-4" /> Add Spellcasting
              </button>
            ) : null}
          </div>
        )}

        {/* Notes */}
        <div className="mt-4 p-4 rounded-xl border border-border-theme bg-surface-elevated">
          <h3 className="text-xs font-bold uppercase tracking-wider text-text-muted mb-2">Notes</h3>
          <textarea
            value={data.notes}
            onChange={(e) => updateData({ notes: e.target.value })}
            rows={4}
            className="w-full text-sm text-text-secondary bg-transparent border border-border-theme rounded-lg p-3 focus:border-accent-purple focus:outline-none resize-y"
            placeholder="DM notes, session updates..."
          />
        </div>
      </div>
    </div>
  )
}

// Helper component for editable tag pills in the identity bar
function EditableTag({
  value,
  onChange,
  placeholder,
  small,
}: {
  value: string
  onChange: (v: string) => void
  placeholder: string
  small?: boolean
}) {
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={`${small ? 'w-12' : 'w-24'} text-xs px-2 py-0.5 rounded-full bg-white/5 border border-border-theme text-text-secondary focus:border-accent-purple focus:outline-none text-center`}
    />
  )
}
