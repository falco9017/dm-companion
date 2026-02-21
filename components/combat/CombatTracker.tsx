'use client'

import { useState, useEffect, useRef } from 'react'
import {
  Plus, ChevronRight, ChevronLeft, RotateCcw, Swords,
  Skull, Minus, Shield, Trash2, Dices, GripVertical, Loader2, User,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import { getWikiEntry } from '@/actions/wiki'
import type { Combatant } from '@/types/combat'
import type { CharacterSheetData } from '@/types/character-sheet'
import AddCombatantDialog from './AddCombatantDialog'
import CombatantStatsPanel from './CombatantStatsPanel'

interface WikiTreeEntry {
  id: string
  title: string
  type: string
}

interface CombatTrackerProps {
  campaignId: string
  userId: string
  wikiEntries: WikiTreeEntry[]
}

let nextId = 1
function genId() {
  return `c-${nextId++}`
}

function rollD20() {
  return Math.floor(Math.random() * 20) + 1
}

function hpColor(current: number, max: number) {
  if (max === 0) return 'bg-muted'
  const pct = current / max
  if (current <= 0) return 'bg-gray-400'
  if (pct > 0.5) return 'bg-green-500'
  if (pct > 0.25) return 'bg-amber-500'
  return 'bg-red-500'
}

function hpTextColor(current: number, max: number) {
  if (current <= 0) return 'text-muted-foreground line-through'
  const pct = max > 0 ? current / max : 1
  if (pct <= 0.25) return 'text-red-600 dark:text-red-400 font-semibold'
  return ''
}

function typeBadge(type: Combatant['type']) {
  if (type === 'player') return { label: 'PC', variant: 'default' as const }
  if (type === 'npc') return { label: 'NPC', variant: 'secondary' as const }
  return { label: 'MON', variant: 'destructive' as const }
}

// Editable HP cell — click number to edit inline
function HpCell({
  current,
  max,
  temporary,
  onAdjust,
  onSetCurrent,
}: {
  current: number
  max: number
  temporary: number
  onAdjust: (delta: number) => void
  onSetCurrent: (val: number) => void
}) {
  const [editing, setEditing] = useState(false)
  const [editVal, setEditVal] = useState('')

  function startEdit() {
    setEditVal(String(current))
    setEditing(true)
  }

  function commitEdit() {
    const val = parseInt(editVal)
    if (!isNaN(val)) onSetCurrent(val)
    setEditing(false)
  }

  const pct = max > 0 ? Math.max(0, current) / max : 0

  return (
    <div className="flex items-center gap-1 min-w-0">
      <Button
        variant="ghost"
        size="icon"
        className="h-6 w-6 flex-shrink-0 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
        onClick={(e) => { e.stopPropagation(); onAdjust(-1) }}
        title="Damage (−1)"
      >
        <Minus className="w-3 h-3" />
      </Button>

      <div className="flex flex-col items-center min-w-[52px]">
        {editing ? (
          <Input
            autoFocus
            type="number"
            value={editVal}
            onChange={(e) => setEditVal(e.target.value)}
            onBlur={commitEdit}
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => {
              if (e.key === 'Enter') commitEdit()
              if (e.key === 'Escape') setEditing(false)
            }}
            className="h-6 w-14 text-center text-xs p-0"
          />
        ) : (
          <button
            onClick={(e) => { e.stopPropagation(); startEdit() }}
            className={cn('text-sm tabular-nums leading-none hover:underline cursor-pointer', hpTextColor(current, max))}
            title="Click to set HP"
          >
            {current}
            <span className="text-muted-foreground text-xs">/{max}</span>
          </button>
        )}
        <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden mt-0.5">
          <div
            className={cn('h-full rounded-full transition-all', hpColor(current, max))}
            style={{ width: `${pct * 100}%` }}
          />
        </div>
        {temporary > 0 && (
          <span className="text-xs text-blue-500">+{temporary}</span>
        )}
      </div>

      <Button
        variant="ghost"
        size="icon"
        className="h-6 w-6 flex-shrink-0 text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-950"
        onClick={(e) => { e.stopPropagation(); onAdjust(1) }}
        title="Heal (+1)"
      >
        <Plus className="w-3 h-3" />
      </Button>
    </div>
  )
}

// Initiative cell — click to edit
function InitiativeCell({
  value,
  onChange,
  onReroll,
  initiativeModifier,
}: {
  value: number
  onChange: (v: number) => void
  onReroll: () => void
  initiativeModifier: number
}) {
  const [editing, setEditing] = useState(false)
  const [editVal, setEditVal] = useState('')

  function startEdit() {
    setEditVal(String(value))
    setEditing(true)
  }

  function commit() {
    const v = parseInt(editVal)
    if (!isNaN(v)) onChange(v)
    setEditing(false)
  }

  return (
    <div className="flex items-center gap-0.5 min-w-[56px]">
      {editing ? (
        <Input
          autoFocus
          type="number"
          value={editVal}
          onChange={(e) => setEditVal(e.target.value)}
          onBlur={commit}
          onClick={(e) => e.stopPropagation()}
          onKeyDown={(e) => {
            if (e.key === 'Enter') commit()
            if (e.key === 'Escape') setEditing(false)
          }}
          className="h-6 w-12 text-center text-xs p-0"
        />
      ) : (
        <button
          onClick={(e) => { e.stopPropagation(); startEdit() }}
          className="text-sm font-bold tabular-nums hover:underline cursor-pointer"
          title="Click to edit initiative"
        >
          {value}
        </button>
      )}
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-5 w-5 opacity-50 hover:opacity-100"
            onClick={(e) => { e.stopPropagation(); onReroll() }}
          >
            <Dices className="w-3 h-3" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          Reroll (d20{initiativeModifier >= 0 ? `+${initiativeModifier}` : initiativeModifier})
        </TooltipContent>
      </Tooltip>
    </div>
  )
}

export default function CombatTracker({ campaignId: _campaignId, userId, wikiEntries }: CombatTrackerProps) {
  const [combatants, setCombatants] = useState<Combatant[]>([])
  const [isLoadingParty, setIsLoadingParty] = useState(false)
  const [round, setRound] = useState(1)
  const [currentTurnIdx, setCurrentTurnIdx] = useState(0)
  const [isCombatActive, setIsCombatActive] = useState(false)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [selectedCombatantId, setSelectedCombatantId] = useState<string | null>(null)
  const hasAutoLoaded = useRef(false)

  // Auto-add all CHARACTER party members on first mount
  useEffect(() => {
    if (hasAutoLoaded.current) return
    hasAutoLoaded.current = true

    const characters = wikiEntries.filter((e) => e.type === 'CHARACTER')
    if (characters.length === 0) return

    setIsLoadingParty(true)
    Promise.all(
      characters.map(async (entry) => {
        try {
          const fullEntry = await getWikiEntry(entry.id, userId)
          const sheet = fullEntry.characterSheet?.data as unknown as CharacterSheetData | undefined
          return {
            id: genId(),
            name: entry.title,
            type: 'player' as const,
            initiative: 0,
            initiativeModifier: sheet?.initiative ?? 0,
            currentHp: sheet?.hitPoints.current ?? sheet?.hitPoints.maximum ?? 0,
            maxHp: sheet?.hitPoints.maximum ?? 0,
            temporaryHp: sheet?.hitPoints.temporary ?? 0,
            ac: sheet?.armorClass ?? 10,
            notes: '',
            wikiEntryId: entry.id,
            wikiContent: fullEntry.content,
            characterSheet: sheet,
          } satisfies Combatant
        } catch {
          return {
            id: genId(),
            name: entry.title,
            type: 'player' as const,
            initiative: 0,
            initiativeModifier: 0,
            currentHp: 0,
            maxHp: 0,
            temporaryHp: 0,
            ac: 10,
            notes: '',
            wikiEntryId: entry.id,
          } satisfies Combatant
        }
      })
    ).then((loaded) => {
      setCombatants(loaded)
      setIsLoadingParty(false)
    })
  }, [wikiEntries, userId])

  // Sort combatants by initiative descending
  const sorted = [...combatants].sort((a, b) => b.initiative - a.initiative)
  const currentCombatant = isCombatActive ? sorted[currentTurnIdx] : null

  // Auto-select first combatant when list becomes non-empty
  useEffect(() => {
    if (combatants.length > 0 && !selectedCombatantId) {
      setSelectedCombatantId(sorted[0]?.id ?? null)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [combatants.length])

  // Auto-select active turn combatant during combat
  useEffect(() => {
    if (isCombatActive && sorted[currentTurnIdx]) {
      setSelectedCombatantId(sorted[currentTurnIdx].id)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentTurnIdx, isCombatActive])

  // Resolve selected combatant from live state (so HP updates are reflected)
  const selectedCombatant =
    (selectedCombatantId ? combatants.find((c) => c.id === selectedCombatantId) : null) ??
    sorted[0] ??
    null

  function addCombatant(data: Omit<Combatant, 'id'>) {
    const newCombatant = { ...data, id: genId() }
    setCombatants((prev) => [...prev, newCombatant])
    setSelectedCombatantId(newCombatant.id)
  }

  function removeCombatant(id: string) {
    setCombatants((prev) => {
      const next = prev.filter((c) => c.id !== id)
      // If we removed the selected one, pick first remaining
      if (id === selectedCombatantId) {
        setSelectedCombatantId(next[0]?.id ?? null)
      }
      return next
    })
    setCurrentTurnIdx((prev) => Math.max(0, Math.min(prev, sorted.length - 2)))
  }

  function updateCombatant(id: string, patch: Partial<Combatant>) {
    setCombatants((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...patch } : c))
    )
  }

  function adjustHp(id: string, delta: number) {
    setCombatants((prev) =>
      prev.map((c) =>
        c.id === id
          ? { ...c, currentHp: Math.min(c.maxHp, Math.max(-99, c.currentHp + delta)) }
          : c
      )
    )
  }

  function setCurrentHp(id: string, val: number) {
    setCombatants((prev) =>
      prev.map((c) =>
        c.id === id ? { ...c, currentHp: Math.min(c.maxHp, val) } : c
      )
    )
  }

  function startCombat() {
    setIsCombatActive(true)
    setRound(1)
    setCurrentTurnIdx(0)
    if (sorted[0]) setSelectedCombatantId(sorted[0].id)
  }

  function endCombat() {
    setIsCombatActive(false)
    setRound(1)
    setCurrentTurnIdx(0)
  }

  function resetCombat() {
    setCombatants([])
    setIsCombatActive(false)
    setRound(1)
    setCurrentTurnIdx(0)
    setSelectedCombatantId(null)
    hasAutoLoaded.current = false
  }

  function nextTurn() {
    setCurrentTurnIdx((prev) => {
      const next = prev + 1
      if (next >= sorted.length) {
        setRound((r) => r + 1)
        return 0
      }
      return next
    })
  }

  function prevTurn() {
    setCurrentTurnIdx((prev) => {
      if (prev === 0) {
        if (round > 1) {
          setRound((r) => r - 1)
          return sorted.length - 1
        }
        return 0
      }
      return prev - 1
    })
  }

  function rollAllInitiative() {
    setCombatants((prev) =>
      prev.map((c) => ({
        ...c,
        initiative: rollD20() + c.initiativeModifier,
      }))
    )
  }

  const isEmpty = combatants.length === 0

  return (
    <div className="flex flex-col h-full">
      {/* Header / Controls */}
      <div className="flex-shrink-0 flex flex-wrap items-center gap-2 px-4 py-2 border-b bg-muted/30">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 rounded-md border bg-background px-2 py-1">
            <Swords className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="text-sm font-semibold">Round {round}</span>
          </div>
          {isCombatActive && currentCombatant && (
            <span className="text-sm text-muted-foreground">
              → <span className="font-medium text-foreground">{currentCombatant.name}</span>
            </span>
          )}
        </div>

        <div className="flex items-center gap-1 ml-auto">
          {isCombatActive && (
            <>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="icon" className="h-7 w-7" onClick={prevTurn} disabled={sorted.length === 0}>
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Previous turn</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="default" size="sm" className="h-7 gap-1.5" onClick={nextTurn} disabled={sorted.length === 0}>
                    Next <ChevronRight className="w-3.5 h-3.5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Next turn</TooltipContent>
              </Tooltip>
            </>
          )}

          {!isCombatActive && combatants.length > 0 && (
            <Button variant="default" size="sm" className="h-7" onClick={startCombat}>
              Start Combat
            </Button>
          )}

          {isCombatActive && (
            <Button variant="outline" size="sm" className="h-7" onClick={endCombat}>
              End Combat
            </Button>
          )}

          {combatants.length > 0 && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={rollAllInitiative}>
                  <Dices className="w-3.5 h-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Roll initiative for all</TooltipContent>
            </Tooltip>
          )}

          {combatants.length > 0 && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={resetCombat}>
                  <RotateCcw className="w-3.5 h-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Reset combat</TooltipContent>
            </Tooltip>
          )}

          <Button variant="outline" size="sm" className="h-7 gap-1" onClick={() => setShowAddDialog(true)}>
            <Plus className="w-3.5 h-3.5" /> Add
          </Button>
        </div>
      </div>

      {/* Main area — split pane */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left: Initiative order list */}
        <div className="w-[360px] flex-shrink-0 border-r flex flex-col overflow-hidden">
          <ScrollArea className="flex-1">
            {isLoadingParty ? (
              <div className="flex items-center justify-center gap-2 h-40 text-muted-foreground">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-sm">Loading party...</span>
              </div>
            ) : isEmpty ? (
              <div className="flex flex-col items-center justify-center h-64 gap-3 text-muted-foreground">
                <Swords className="w-10 h-10 opacity-20" />
                <p className="text-sm">No combatants yet</p>
                <Button variant="outline" size="sm" onClick={() => setShowAddDialog(true)}>
                  <Plus className="w-3.5 h-3.5 mr-1.5" /> Add Combatant
                </Button>
              </div>
            ) : (
              <div className="p-2 space-y-1">
                <div className="grid grid-cols-[20px_48px_1fr_130px_44px_28px] items-center gap-1.5 px-2 py-1 text-xs text-muted-foreground uppercase tracking-wide">
                  <span />
                  <span>Init</span>
                  <span>Name</span>
                  <span className="text-center">HP</span>
                  <span className="text-center">AC</span>
                  <span />
                </div>
                <Separator />

                {sorted.map((combatant, idx) => {
                  const isCurrentTurn = isCombatActive && idx === currentTurnIdx
                  const isSelected = combatant.id === selectedCombatant?.id
                  const isDead = combatant.currentHp <= 0
                  const { label, variant } = typeBadge(combatant.type)

                  return (
                    <div
                      key={combatant.id}
                      onClick={() => setSelectedCombatantId(combatant.id)}
                      className={cn(
                        'grid grid-cols-[20px_48px_1fr_130px_44px_28px] items-center gap-1.5 px-2 py-2 rounded-lg transition-colors cursor-pointer',
                        isCurrentTurn
                          ? 'bg-primary/10 border border-primary/30 ring-1 ring-primary/20'
                          : isSelected
                          ? 'bg-muted/70 border border-muted-foreground/20'
                          : 'hover:bg-muted/40 border border-transparent',
                        isDead && 'opacity-50'
                      )}
                    >
                      <div className="flex items-center justify-center">
                        {isCurrentTurn ? (
                          <ChevronRight className="w-3.5 h-3.5 text-primary" />
                        ) : (
                          <GripVertical className="w-3.5 h-3.5 text-muted-foreground/30" />
                        )}
                      </div>

                      <InitiativeCell
                        value={combatant.initiative}
                        onChange={(v) => updateCombatant(combatant.id, { initiative: v })}
                        onReroll={() =>
                          updateCombatant(combatant.id, {
                            initiative: rollD20() + combatant.initiativeModifier,
                          })
                        }
                        initiativeModifier={combatant.initiativeModifier}
                      />

                      <div className="flex items-center gap-1 min-w-0">
                        {isDead && <Skull className="w-3 h-3 text-muted-foreground flex-shrink-0" />}
                        <span className={cn('text-sm font-medium truncate', isDead && 'line-through text-muted-foreground')}>
                          {combatant.name}
                        </span>
                        <Badge variant={variant} className="text-xs flex-shrink-0 h-4 px-1">
                          {label}
                        </Badge>
                      </div>

                      <HpCell
                        current={combatant.currentHp}
                        max={combatant.maxHp}
                        temporary={combatant.temporaryHp}
                        onAdjust={(delta) => adjustHp(combatant.id, delta)}
                        onSetCurrent={(val) => setCurrentHp(combatant.id, val)}
                      />

                      <div className="flex items-center justify-center gap-0.5">
                        <Shield className="w-3 h-3 text-muted-foreground" />
                        <span className="text-sm font-medium tabular-nums">{combatant.ac}</span>
                      </div>

                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 text-destructive hover:text-destructive"
                            onClick={(e) => { e.stopPropagation(); removeCombatant(combatant.id) }}
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Remove from combat</TooltipContent>
                      </Tooltip>
                    </div>
                  )
                })}
              </div>
            )}
          </ScrollArea>
        </div>

        {/* Right: Always-visible stats panel */}
        <div className="flex-1 min-w-0 overflow-hidden">
          {selectedCombatant ? (
            <CombatantStatsPanel combatant={selectedCombatant} />
          ) : (
            <div className="flex flex-col items-center justify-center h-full gap-2 text-muted-foreground">
              <User className="w-8 h-8 opacity-20" />
              <p className="text-sm">Select a combatant to view stats</p>
            </div>
          )}
        </div>
      </div>

      <AddCombatantDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        wikiEntries={wikiEntries}
        userId={userId}
        onAdd={addCombatant}
      />
    </div>
  )
}
