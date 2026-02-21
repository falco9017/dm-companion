'use client'

import { useState, useTransition, useEffect, useRef } from 'react'
import { Sword, User, Drama, Search, Dices, Loader2, BookOpen } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'
import { getWikiEntry } from '@/actions/wiki'
import type { Combatant, CombatantType } from '@/types/combat'
import type { CharacterSheetData } from '@/types/character-sheet'

interface WikiTreeEntry {
  id: string
  title: string
  type: string
}

interface AddCombatantDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  wikiEntries: WikiTreeEntry[]
  userId: string
  onAdd: (combatant: Omit<Combatant, 'id'>) => void
}

interface DndMonsterSummary {
  index: string
  name: string
}

interface DndMonsterDetail {
  name: string
  size: string
  type: string
  hit_points: number
  challenge_rating: number
  xp: number
  strength: number
  dexterity: number
  constitution: number
  intelligence: number
  wisdom: number
  charisma: number
  armor_class: { value: number; type: string }[]
  special_abilities?: { name: string; desc: string }[]
  actions?: { name: string; desc: string }[]
  legendary_actions?: { name: string; desc: string }[]
}

const DND5E_API = 'https://www.dnd5eapi.co/api/2014'

function abilityMod(score: number) {
  const mod = Math.floor((score - 10) / 2)
  return mod >= 0 ? `+${mod}` : String(mod)
}

function formatCr(cr: number) {
  if (cr === 0.125) return '1/8'
  if (cr === 0.25) return '1/4'
  if (cr === 0.5) return '1/2'
  return String(cr)
}

function buildMonsterWikiContent(m: DndMonsterDetail): string {
  const lines: string[] = []
  lines.push(`**${m.name}** · ${m.size} ${m.type}`)
  lines.push(`CR ${formatCr(m.challenge_rating)} · XP ${m.xp ?? '—'}`)
  lines.push('')
  lines.push(
    `STR ${m.strength} (${abilityMod(m.strength)}) | DEX ${m.dexterity} (${abilityMod(m.dexterity)}) | CON ${m.constitution} (${abilityMod(m.constitution)})`
  )
  lines.push(
    `INT ${m.intelligence} (${abilityMod(m.intelligence)}) | WIS ${m.wisdom} (${abilityMod(m.wisdom)}) | CHA ${m.charisma} (${abilityMod(m.charisma)})`
  )
  if (m.special_abilities?.length) {
    lines.push('')
    lines.push('**Special Abilities**')
    for (const sa of m.special_abilities.slice(0, 5)) {
      lines.push(`${sa.name}: ${sa.desc}`)
    }
  }
  if (m.actions?.length) {
    lines.push('')
    lines.push('**Actions**')
    for (const a of m.actions.slice(0, 6)) {
      lines.push(`${a.name}: ${a.desc}`)
    }
  }
  if (m.legendary_actions?.length) {
    lines.push('')
    lines.push('**Legendary Actions**')
    for (const la of m.legendary_actions.slice(0, 3)) {
      lines.push(`${la.name}: ${la.desc}`)
    }
  }
  return lines.join('\n')
}

function rollD20() {
  return Math.floor(Math.random() * 20) + 1
}

export default function AddCombatantDialog({
  open,
  onOpenChange,
  wikiEntries,
  userId,
  onAdd,
}: AddCombatantDialogProps) {
  const [isPending, startTransition] = useTransition()
  const [wikiSearch, setWikiSearch] = useState('')

  // Wiki tab state
  const [selectedEntry, setSelectedEntry] = useState<WikiTreeEntry | null>(null)
  const [wikiInitMod, setWikiInitMod] = useState(0)
  const [wikiInitiative, setWikiInitiative] = useState('')
  const [wikiHpCurrent, setWikiHpCurrent] = useState('')
  const [wikiHpMax, setWikiHpMax] = useState('')
  const [wikiAc, setWikiAc] = useState('')

  // Monster tab state
  const [dndMonsters, setDndMonsters] = useState<DndMonsterSummary[]>([])
  const [isLoadingList, setIsLoadingList] = useState(false)
  const [isLoadingDetail, setIsLoadingDetail] = useState(false)
  const [monsterSearch, setMonsterSearch] = useState('')
  const [selectedDndMonster, setSelectedDndMonster] = useState<DndMonsterSummary | null>(null)
  const [monsterName, setMonsterName] = useState('')
  const [monsterHp, setMonsterHp] = useState('')
  const [monsterAc, setMonsterAc] = useState('')
  const [monsterInitMod, setMonsterInitMod] = useState('0')
  const [monsterInitiative, setMonsterInitiative] = useState('')
  const [monsterCount, setMonsterCount] = useState('1')
  const [dndMonsterDetail, setDndMonsterDetail] = useState<DndMonsterDetail | null>(null)
  const hasFetchedList = useRef(false)

  // Load D&D monster list the first time the dialog opens
  useEffect(() => {
    if (!open || hasFetchedList.current || dndMonsters.length > 0) return
    hasFetchedList.current = true
    setIsLoadingList(true)
    fetch(`${DND5E_API}/monsters`)
      .then((r) => r.json())
      .then((data) => {
        setDndMonsters(data.results ?? [])
      })
      .catch(() => {})
      .finally(() => setIsLoadingList(false))
  }, [open, dndMonsters.length])

  // When a D&D monster is selected, fetch its details
  useEffect(() => {
    if (!selectedDndMonster) return
    setIsLoadingDetail(true)
    setDndMonsterDetail(null)
    fetch(`${DND5E_API}/monsters/${selectedDndMonster.index}`)
      .then((r) => r.json())
      .then((data: DndMonsterDetail) => {
        setDndMonsterDetail(data)
        setMonsterName(data.name)
        setMonsterHp(String(data.hit_points))
        setMonsterAc(String(data.armor_class?.[0]?.value ?? 10))
        const dexMod = Math.floor((data.dexterity - 10) / 2)
        setMonsterInitMod(String(dexMod))
        setMonsterInitiative('')
      })
      .catch(() => {})
      .finally(() => setIsLoadingDetail(false))
  }, [selectedDndMonster])

  const wikiCharacters = wikiEntries.filter((e) => e.type === 'CHARACTER')
  const wikiNpcs = wikiEntries.filter((e) => e.type === 'NPC')
  const filteredWiki = [...wikiCharacters, ...wikiNpcs].filter((e) =>
    e.title.toLowerCase().includes(wikiSearch.toLowerCase())
  )

  const filteredMonsters = dndMonsters.filter((m) =>
    m.name.toLowerCase().includes(monsterSearch.toLowerCase())
  )

  function resetWikiForm() {
    setSelectedEntry(null)
    setWikiInitMod(0)
    setWikiInitiative('')
    setWikiHpCurrent('')
    setWikiHpMax('')
    setWikiAc('')
    setWikiSearch('')
  }

  function resetMonsterForm() {
    setSelectedDndMonster(null)
    setDndMonsterDetail(null)
    setMonsterName('')
    setMonsterHp('')
    setMonsterAc('')
    setMonsterInitMod('0')
    setMonsterInitiative('')
    setMonsterCount('1')
    setMonsterSearch('')
  }

  function handleSelectWikiEntry(entry: WikiTreeEntry) {
    setSelectedEntry(entry)
    if (entry.type === 'CHARACTER') {
      startTransition(async () => {
        try {
          const fullEntry = await getWikiEntry(entry.id, userId)
          const sheet = fullEntry.characterSheet?.data as unknown as CharacterSheetData | undefined
          if (sheet) {
            setWikiInitMod(sheet.initiative)
            setWikiHpMax(String(sheet.hitPoints.maximum))
            setWikiHpCurrent(String(sheet.hitPoints.current))
            setWikiAc(String(sheet.armorClass))
          }
        } catch {
          // user can fill manually
        }
      })
    } else {
      setWikiInitMod(0)
      setWikiHpCurrent('')
      setWikiHpMax('')
      setWikiAc('')
    }
    setWikiInitiative('')
  }

  function handleAddFromWiki() {
    if (!selectedEntry) return
    const type: CombatantType = selectedEntry.type === 'CHARACTER' ? 'player' : 'npc'
    const maxHp = parseInt(wikiHpMax) || 0
    const currentHp = parseInt(wikiHpCurrent) || maxHp
    const ac = parseInt(wikiAc) || 10
    const initiative = parseInt(wikiInitiative) || rollD20() + wikiInitMod

    startTransition(async () => {
      let wikiContent: string | undefined
      let characterSheet: CharacterSheetData | undefined
      try {
        const fullEntry = await getWikiEntry(selectedEntry.id, userId)
        wikiContent = fullEntry.content
        if (fullEntry.characterSheet?.data) {
          characterSheet = fullEntry.characterSheet.data as unknown as CharacterSheetData
        }
      } catch {
        // ignore
      }

      onAdd({
        name: selectedEntry.title,
        type,
        initiative,
        initiativeModifier: wikiInitMod,
        currentHp,
        maxHp,
        temporaryHp: 0,
        ac,
        notes: '',
        wikiEntryId: selectedEntry.id,
        wikiContent,
        characterSheet,
      })
      resetWikiForm()
      onOpenChange(false)
    })
  }

  function handleAddMonster() {
    const name = monsterName.trim()
    if (!name || !monsterHp) return
    const maxHp = parseInt(monsterHp) || 1
    const ac = parseInt(monsterAc) || 10
    const initMod = parseInt(monsterInitMod) || 0
    const count = Math.max(1, Math.min(20, parseInt(monsterCount) || 1))

    const wikiContent = dndMonsterDetail ? buildMonsterWikiContent(dndMonsterDetail) : undefined

    for (let i = 0; i < count; i++) {
      const suffix = count > 1 ? ` ${i + 1}` : ''
      onAdd({
        name: name + suffix,
        type: 'monster',
        initiative: rollD20() + initMod,
        initiativeModifier: initMod,
        currentHp: maxHp,
        maxHp,
        temporaryHp: 0,
        ac,
        notes: '',
        wikiContent,
      })
    }
    resetMonsterForm()
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sword className="w-4 h-4" /> Add Combatant
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="wiki">
          <TabsList className="w-full">
            <TabsTrigger value="wiki" className="flex-1">From Campaign</TabsTrigger>
            <TabsTrigger value="monster" className="flex-1">Monster</TabsTrigger>
          </TabsList>

          {/* ── From Wiki ── */}
          <TabsContent value="wiki" className="space-y-3 mt-3">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-muted-foreground" />
              <Input
                placeholder="Search characters & NPCs..."
                value={wikiSearch}
                onChange={(e) => setWikiSearch(e.target.value)}
                className="pl-8"
              />
            </div>
            <ScrollArea className="h-40 border rounded-md">
              {filteredWiki.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-6">No characters or NPCs found</p>
              ) : (
                <div className="p-1">
                  {filteredWiki.map((entry) => (
                    <button
                      key={entry.id}
                      onClick={() => handleSelectWikiEntry(entry)}
                      className={cn(
                        'w-full flex items-center gap-2 px-2 py-1.5 rounded text-sm text-left transition-colors',
                        selectedEntry?.id === entry.id
                          ? 'bg-primary text-primary-foreground'
                          : 'hover:bg-muted'
                      )}
                    >
                      {entry.type === 'CHARACTER' ? (
                        <User className="w-3.5 h-3.5 flex-shrink-0" />
                      ) : (
                        <Drama className="w-3.5 h-3.5 flex-shrink-0" />
                      )}
                      <span className="flex-1 truncate">{entry.title}</span>
                      <Badge variant="secondary" className="text-xs">
                        {entry.type === 'CHARACTER' ? 'PC' : 'NPC'}
                      </Badge>
                    </button>
                  ))}
                </div>
              )}
            </ScrollArea>

            {selectedEntry && (
              <div className="grid grid-cols-4 gap-2">
                <div className="space-y-1">
                  <Label className="text-xs">Initiative</Label>
                  <div className="flex gap-1">
                    <Input
                      type="number"
                      placeholder="Roll"
                      value={wikiInitiative}
                      onChange={(e) => setWikiInitiative(e.target.value)}
                      className="h-8 text-sm"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="h-8 w-8 flex-shrink-0"
                      onClick={() => setWikiInitiative(String(rollD20() + wikiInitMod))}
                    >
                      <Dices className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Max HP</Label>
                  <Input type="number" placeholder="HP" value={wikiHpMax} onChange={(e) => setWikiHpMax(e.target.value)} className="h-8 text-sm" />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Current HP</Label>
                  <Input type="number" placeholder="HP" value={wikiHpCurrent} onChange={(e) => setWikiHpCurrent(e.target.value)} className="h-8 text-sm" />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">AC</Label>
                  <Input type="number" placeholder="AC" value={wikiAc} onChange={(e) => setWikiAc(e.target.value)} className="h-8 text-sm" />
                </div>
              </div>
            )}

            <DialogFooter>
              <Button onClick={handleAddFromWiki} disabled={!selectedEntry || isPending}>
                {isPending ? 'Loading...' : 'Add to Combat'}
              </Button>
            </DialogFooter>
          </TabsContent>

          {/* ── Monster ── */}
          <TabsContent value="monster" className="space-y-3 mt-3">
            {/* D&D SRD search */}
            <div className="space-y-1.5">
              <Label className="text-xs flex items-center gap-1.5">
                <BookOpen className="w-3 h-3" /> Search D&amp;D SRD Monsters
              </Label>
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-muted-foreground" />
                {isLoadingList && (
                  <Loader2 className="absolute right-2.5 top-2.5 w-3.5 h-3.5 text-muted-foreground animate-spin" />
                )}
                <Input
                  placeholder="Search 334 official monsters..."
                  value={monsterSearch}
                  onChange={(e) => setMonsterSearch(e.target.value)}
                  className="pl-8"
                  disabled={isLoadingList}
                />
              </div>

              {monsterSearch.trim().length > 0 && (
                <ScrollArea className="h-36 border rounded-md">
                  {filteredMonsters.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">No monsters found</p>
                  ) : (
                    <div className="p-1">
                      {filteredMonsters.slice(0, 50).map((m) => (
                        <button
                          key={m.index}
                          onClick={() => {
                            setSelectedDndMonster(m)
                            setMonsterSearch(m.name)
                          }}
                          className={cn(
                            'w-full text-left px-2 py-1.5 rounded text-sm transition-colors',
                            selectedDndMonster?.index === m.index
                              ? 'bg-primary text-primary-foreground'
                              : 'hover:bg-muted'
                          )}
                        >
                          {m.name}
                        </button>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              )}

              {isLoadingDetail && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" /> Loading stats...
                </div>
              )}
            </div>

            {/* Manual / auto-filled fields */}
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2 space-y-1">
                <Label className="text-xs">Monster Name *</Label>
                <Input
                  placeholder="e.g. Goblin Warrior"
                  value={monsterName}
                  onChange={(e) => setMonsterName(e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Max HP *</Label>
                <Input
                  type="number"
                  min={1}
                  placeholder="e.g. 15"
                  value={monsterHp}
                  onChange={(e) => setMonsterHp(e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Armor Class</Label>
                <Input
                  type="number"
                  min={1}
                  placeholder="e.g. 13"
                  value={monsterAc}
                  onChange={(e) => setMonsterAc(e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Initiative Modifier</Label>
                <Input
                  type="number"
                  placeholder="e.g. 2"
                  value={monsterInitMod}
                  onChange={(e) => setMonsterInitMod(e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Count (1–20)</Label>
                <Input
                  type="number"
                  min={1}
                  max={20}
                  placeholder="1"
                  value={monsterCount}
                  onChange={(e) => setMonsterCount(e.target.value)}
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                onClick={handleAddMonster}
                disabled={!monsterName.trim() || !monsterHp}
              >
                Add to Combat
              </Button>
            </DialogFooter>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
