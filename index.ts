import fs from 'fs'

type Factions = {
  byName: Record<string, Record<string, string> | undefined>
  byCulture: Record<string, Record<string, string>[] | undefined>
}

const missingSkills = new Set()

main()

async function main() {
  const f = factions('C:/Games/Rome - Total War/data/descr_sm_factions.txt')

  const ud = unitsWithEverything(
    'C:/Games/Rome - Total War/data/text/export_units.txt',
    'C:/Games/Rome - Total War/data/export_descr_unit.txt',
    'C:/Games/Rome - Total War/data/text/shared.txt',
    f
  )
  //

  fs.writeFileSync('./book/src/units.json', JSON.stringify(ud, null, 2), {
    encoding: 'utf-8'
  })

  fs.writeFileSync('./book/src/factions.json', JSON.stringify(f, null, 2), {
    encoding: 'utf-8'
  })

  console.log('end')
}

function factions(path: string): Factions {
  const factionsText = fs.readFileSync(path, {
    encoding: 'utf-8'
  })

  const factions: Record<string, Record<string, string>> = {}
  let currentFactionName = ''
  let currentFaction: Record<string, string> = {}

  for (const line of factionsText.split('\n')) {
    if (line.startsWith(';')) continue

    const lineData = line.split('\t').filter((e) => e !== '')
    if (lineData.length === 0) {
      continue
    }

    const key = lineData[0].trim()

    if (key == '') {
      continue
    }

    const value = lineData.slice(1).join(' ').trim()

    if (key === 'faction') {
      if (currentFactionName === '') {
        // initialize first faction
        currentFactionName = value
        currentFaction = { faction: value }
        continue
      }

      // finalize previous faction
      factions[currentFactionName] = currentFaction

      // start new
      currentFactionName = value
      currentFaction = { faction: value }

      continue
    }

    currentFaction[key] = value
  }
  // finalize last faction
  factions[currentFactionName] = currentFaction

  return {
    byName: factions,
    byCulture: groupBy(Object.values(factions), (f) => {
      return f.culture
    })
  }
}

function unitsWithEverything(
  unitsPath: string,
  unitDescrPath: string,
  skillsPath: string,
  f: Factions
) {
  const uMap = units(unitsPath)
  const udMap = unitDescrs(unitDescrPath)

  for (const [key, value] of uMap) {
    const unit = key.replace(/_descr(_short)?$/, '')

    const unitProps = udMap.get(unit)
    if (unitProps === undefined) {
      throw new Error(
        `not found unit descr for: '${key}' (searched for '${unit}')`
      )
    }

    if (key.endsWith('_descr_short')) {
      unitProps.set('text_descr_short', value)
    } else if (key.endsWith('_descr')) {
      unitProps.set(
        'text_descr',
        value
          .split('\\n')
          .filter((s) => !s.includes('code fix') && !s.includes('not required'))
      )
    } else {
      unitProps.set('text', value)
    }
  }

  const s = skills(skillsPath)

  return groupUnits(
    Array.from(udMap.values())
      .map(Object.fromEntries)
      .filter(filterUnit)
      .map((u) => patchUnit(u, s, f))
  )
}

function hashStrArr(arr: string[]): string {
  return arr.join('|')
}

function hashUnit(u: Record<string, string | string[] | undefined>): string {
  const statsHashes = [
    hashStrArr(u['stat_pri'] as string[]),
    hashStrArr(u['stat_pri_armour'] as string[]),
    hashStrArr(u['stat_sec'] as string[]),
    hashStrArr(u['stat_sec_armour'] as string[]),
    hashStrArr(u['stat_ground'] as string[])
  ]
  return `${u['text'] as string}_${statsHashes.join('_')}`
}

function groupUnits(units: Record<string, string | string[] | undefined>[]) {
  const groups = groupBy(units, hashUnit)

  const resultUnits: Record<string, string | string[] | undefined>[] = []
  for (const key in groups) {
    const units = groups[key]
    const firstUnit = units[0]

    if (units.length > 1) {
      const firstUnitOwners = firstUnit['ownership'] as string[]
      const firstUnitImgs = firstUnit['img'] as string[]
      for (const otherUnit of units.slice(1)) {
        for (const owner of otherUnit['ownership'] as string[]) {
          firstUnitOwners.push(owner)
        }
        for (const img of otherUnit['img'] as string[]) {
          firstUnitImgs.push(img)
        }
      }

      if (firstUnitImgs.length > 10) {
        console.log(
          `Too many images (${firstUnitImgs.length}): ${firstUnit['text']}`
        )
      }
    }

    resultUnits.push(firstUnit)
  }

  return resultUnits
}

function filterUnit(
  unit: Record<string, string | string[] | undefined>
): boolean {
  if (unit['category'] === 'non_combatant') {
    return false
  }
  return true
}

function patchUnit(
  unit: Record<string, string | string[] | undefined>,
  skills: Record<string, string>,
  factions: Factions
): Record<string, string | string[] | undefined> {
  const name = unit['dictionary']
  if (!name || typeof name !== 'string') {
    throw new Error('no name')
  }

  // TODO: ownership
  if (typeof unit['ownership'] !== 'string') {
    throw new Error('no ownership')
  }
  const ownershipWithCultures = unit['ownership']
    .split(',')
    .map((o) => o.trim())

  const ownership: string[] = []
  for (const factionOrCulture of ownershipWithCultures) {
    const cultureFactions = factions.byCulture[factionOrCulture]
    if (cultureFactions) {
      ownership.push(...cultureFactions.map((f) => f.faction.trim()))
    } else {
      ownership.push(factionOrCulture.trim())
    }
  }

  unit['ownership'] = ownership

  // img
  const images: string[] = []
  for (const owner of ownership) {
    let prefix = owner.toUpperCase()
    const unitName = name.toUpperCase()
    if (unitName.startsWith('MERC')) {
      prefix = 'MERC'
    }
    const imgPath = `units/${prefix}___${unitName}_INFO.png`

    let invalidImg = false
    try {
      if (!fs.statSync(`./book/public/${imgPath}`).isFile()) {
        throw new Error('not a file')
      }
    } catch (e: unknown) {
      if (ownership.length > 1) {
        // console.log(`skipping img of ${imgPath}`)
        invalidImg = true
      } else {
        invalidImg = true
        console.log(`(!) skipping unit ${imgPath}`)
      }
      // console.log((e as Error).message)
    }

    if (!invalidImg && !images.includes(imgPath)) {
      images.push(imgPath)
    }
  }
  unit['img'] = images

  if (images.length > 6) {
    console.log(`Too many images (${images.length}): ${name}`)
  }

  // attributes
  const attrs = unit['attributes']
  if (!attrs || typeof attrs !== 'string') {
    throw new Error('no attrs')
  }
  const attrsArr = attrs.split(',').map((a) => a.trim())

  if (!attrsArr || attrsArr.length == 0) {
    throw new Error(`no attributes for '${name}'`)
  }

  const updatedSkills: Record<string, string> = {
    ...skills,
    frighten_foot: 'Пугают пехоту',
    frighten_mounted: 'Пугают кавалерию',
    general_unit: 'Могут охранять генерала',
    can_run_amok: 'Входят в ярость, когда всадник теряет контроль',
    command: 'Несут легендарного орла, дающего бонус ближайшим подразделениям',
    mercenary_unit: 'Наемники'
  }

  const resultAttrs: string[] = []
  if (!attrsArr.includes('sea_faring')) {
    resultAttrs.push('Не могут путешествовать на судне')
  }
  if (
    [
      'hide_forest',
      'hide_improved_forest',
      'hide_long_grass',
      'hide_anywhere'
    ].findIndex((e) => attrsArr.includes(e)) === -1
  ) {
    resultAttrs.push('Не могут спрятаться')
  }
  for (const a of attrsArr) {
    if (!updatedSkills[a]) {
      if (!missingSkills.has(a)) {
        // console.log(`no skill translation for '${a}'`)
        missingSkills.add(a)
      }
      continue
    }
    resultAttrs.push(updatedSkills[a])
  }
  unit['attributes'] = resultAttrs

  // stat_pri
  const statPri = unit['stat_pri']
  if (!statPri || typeof statPri !== 'string') {
    throw new Error('no stat_pri')
  }
  const statPriArr = statPri
    .split(',')
    .slice(0)
    .map((a) => a.trim())
  unit['stat_pri'] = statPriArr

  // stat_sec
  const statSec = unit['stat_sec']
  if (!statSec || typeof statSec !== 'string') {
    throw new Error('no stat_sec')
  }
  const statSecArr = statSec
    .split(',')
    .slice(0)
    .map((a) => a.trim())
  unit['stat_sec'] = statSecArr

  // stat_pri_armour
  const statPriArmour = unit['stat_pri_armour']
  if (!statPriArmour || typeof statPriArmour !== 'string') {
    throw new Error('no stat_pri_armour')
  }
  const statPriArmourArr = statPriArmour
    .split(',')
    .slice(0)
    .map((a) => a.trim())
  unit['stat_pri_armour'] = statPriArmourArr

  // stat_sec_armour
  const statSecArmour = unit['stat_sec_armour']
  if (!statSecArmour || typeof statSecArmour !== 'string') {
    throw new Error('no stat_sec_armour')
  }
  const statSecArmourArr = statSecArmour
    .split(',')
    .slice(0)
    .map((a) => a.trim())
  unit['stat_sec_armour'] = statSecArmourArr

  // stat_ground
  const statGround = unit['stat_ground']
  if (!statGround || typeof statGround !== 'string') {
    throw new Error('no stat_ground')
  }
  const statGroundArr = statGround
    .split(',')
    .slice(0)
    .map((a) => a.trim())
  unit['stat_ground'] = statGroundArr

  // synonyms
  unit['attributes'] = unit['attributes'].map((a) => {
    if (a == 'Отличная выносливость') return 'Выносливые'
    if (a == 'Очень хорошая выносливость') return 'Очень выносливые'
    if (a == 'Могут строиться в кантабрийский круг')
      return 'Умеют строиться кантабрийским кругом'
    return a
  })

  unit['text_descr'] = (unit['text_descr'] as string[]).map((a) => {
    a = a.trim()
    if (a == 'Могут выйти из-под контроля')
      return 'Входят в ярость, когда всадник теряет контроль'
    if (a == 'Выносливые\\Могут выйти из-под контроля')
      return 'Входят в ярость, когда всадник теряет контроль'
    if (a == 'Выносливые\\Прекрасно прячутся в лесах')
      return 'Прекрасно прячутся в лесах'
    if (a == 'Умеют образовывать кантабрийский круг')
      return 'Умеют строиться кантабрийским кругом'
    if (a == 'Способность прятаться в высокой траве')
      return 'Могут прятаться в высокой траве'
    if (a == 'Внушают ужас пехоте') return 'Пугают пехоту'
    return a
  })

  unit['text_descr'] = (unit['text_descr'] as string[]).filter((d) => d)

  // duplicates in text_descr
  unit['text_descr'] = (unit['text_descr'] as string[]).filter(
    (l) => !(unit['attributes'] as string[]).includes(l)
  )

  return unit
}

function skills(path: string) {
  const skillsText = fs.readFileSync(path, {
    encoding: 'utf-16le'
  })
  let skills: Record<string, string> = {}
  for (const m of skillsText.matchAll(/^{UA_([^}]+)}\s*(.+)$/gm)) {
    skills[m[1].toLowerCase()] = m[2]
  }
  return skills
}

function units(path: string) {
  const unitsText = fs.readFileSync(path, {
    encoding: 'utf-16le'
  })

  let units = new Map<string, string>()
  for (const m of unitsText.matchAll(/{([a-zA-Z_-]+)}(\s|\r\n)(.+)/gm)) {
    units.set(m[1], m[3])
  }
  return units
}

function unitDescrs(path: string) {
  const unitDescrs = new Map<string, Map<string, string | string[]>>()
  let currentUnit: Map<string, string | string[]> | null = null

  const descrUnitText = fs.readFileSync(path, {
    encoding: 'utf-8'
  })
  for (let [_, name, value] of descrUnitText.matchAll(
    /^(\w+)\s+([^;\n]+)(;|$)/gm
  )) {
    value = value.trim()

    if (name == 'dictionary') {
      if (!unitDescrs.has(value)) {
        unitDescrs.set(value, new Map())
      }

      currentUnit = unitDescrs.get(value)!
    }

    currentUnit?.set(name, value)
  }
  return unitDescrs
}

function groupBy<T>(
  array: T[],
  keyFunction: (item: T) => string | number
): Record<string, T[]> {
  return array.reduce((result, item) => {
    const key = keyFunction(item)
    if (!result[key]) {
      result[key] = []
    }
    result[key].push(item)
    return result
  }, {} as Record<string, T[]>)
}
