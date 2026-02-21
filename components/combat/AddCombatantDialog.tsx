'use client'

import { useState, useTransition } from 'react'
import { Sword, User, Drama, Search, Dices } from 'lucide-react'
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
  const [search, setSearch] = useState('')

  // Wiki tab state
  const [selectedEntry, setSelectedEntry] = useState<WikiTreeEntry | null>(null)
  const [wikiInitMod, setWikiInitMod] = useState(0)
  const [wikiInitiative, setWikiInitiative] = useState('')
  const [wikiHpCurrent, setWikiHpCurrent] = useState('')
  const [wikiHpMax, setWikiHpMax] = useState('')
  const [wikiAc, setWikiAc] = useState('')

  // Custom monster tab state
  const [monsterName, setMonsterName] = useState('')
  const [monsterHp, setMonsterHp] = useState('')
  const [monsterAc, setMonsterAc] = useState('')
  const [monsterInitMod, setMonsterInitMod] = useState('0')
  const [monsterInitiative, setMonsterInitiative] = useState('')
  const [monsterCount, setMonsterCount] = useState('1')

  const wikiCharacters = wikiEntries.filter((e) => e.type === 'CHARACTER')
  const wikiNpcs = wikiEntries.filter((e) => e.type === 'NPC')
  const filteredWiki = [...wikiCharacters, ...wikiNpcs].filter((e) =>
    e.title.toLowerCase().includes(search.toLowerCase())
  )

  function resetWikiForm() {
    setSelectedEntry(null)
    setWikiInitMod(0)
    setWikiInitiative('')
    setWikiHpCurrent('')
    setWikiHpMax('')
    setWikiAc('')
    setSearch('')
  }

  function resetMonsterForm() {
    setMonsterName('')
    setMonsterHp('')
    setMonsterAc('')
    setMonsterInitMod('0')
    setMonsterInitiative('')
    setMonsterCount('1')
  }

  function handleSelectEntry(entry: WikiTreeEntry) {
    setSelectedEntry(entry)
    // Fetch character sheet data if it's a CHARACTER
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
          // ignore — user can fill manually
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
    if (!name) return
    const maxHp = parseInt(monsterHp) || 1
    const ac = parseInt(monsterAc) || 10
    const initMod = parseInt(monsterInitMod) || 0
    const count = Math.max(1, Math.min(20, parseInt(monsterCount) || 1))

    for (let i = 0; i < count; i++) {
      const initiative = parseInt(monsterInitiative) || rollD20() + initMod
      const suffix = count > 1 ? ` ${i + 1}` : ''
      onAdd({
        name: name + suffix,
        type: 'monster',
        initiative: count > 1 ? rollD20() + initMod : initiative,
        initiativeModifier: initMod,
        currentHp: maxHp,
        maxHp,
        temporaryHp: 0,
        ac,
        notes: '',
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
            <TabsTrigger value="monster" className="flex-1">Custom Monster</TabsTrigger>
          </TabsList>

          {/* From Wiki */}
          <TabsContent value="wiki" className="space-y-3 mt-3">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-muted-foreground" />
              <Input
                placeholder="Search characters & NPCs..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
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
                      onClick={() => handleSelectEntry(entry)}
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
                      title="Roll d20"
                      onClick={() => setWikiInitiative(String(rollD20() + wikiInitMod))}
                    >
                      <Dices className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Max HP</Label>
                  <Input
                    type="number"
                    placeholder="HP"
                    value={wikiHpMax}
                    onChange={(e) => setWikiHpMax(e.target.value)}
                    className="h-8 text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Current HP</Label>
                  <Input
                    type="number"
                    placeholder="HP"
                    value={wikiHpCurrent}
                    onChange={(e) => setWikiHpCurrent(e.target.value)}
                    className="h-8 text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">AC</Label>
                  <Input
                    type="number"
                    placeholder="AC"
                    value={wikiAc}
                    onChange={(e) => setWikiAc(e.target.value)}
                    className="h-8 text-sm"
                  />
                </div>
              </div>
            )}

            <DialogFooter>
              <Button
                onClick={handleAddFromWiki}
                disabled={!selectedEntry || isPending}
              >
                {isPending ? 'Loading...' : 'Add to Combat'}
              </Button>
            </DialogFooter>
          </TabsContent>

          {/* Custom Monster */}
          <TabsContent value="monster" className="space-y-3 mt-3">
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
                <Label className="text-xs">Initiative (blank = roll)</Label>
                <div className="flex gap-1">
                  <Input
                    type="number"
                    placeholder="Roll"
                    value={monsterInitiative}
                    onChange={(e) => setMonsterInitiative(e.target.value)}
                    className="h-9"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="flex-shrink-0"
                    title="Roll d20"
                    onClick={() =>
                      setMonsterInitiative(String(rollD20() + (parseInt(monsterInitMod) || 0)))
                    }
                  >
                    <Dices className="w-3.5 h-3.5" />
                  </Button>
                </div>
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
