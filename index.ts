import fs from 'fs'

main()

async function main() {
  const ud = unitsWithDescrs()

  fs.writeFileSync('output.json', JSON.stringify(ud, null, 2), {
    encoding: 'utf-8'
  })

  console.log('end')
}

function unitsWithDescrs() {
  const uMap = units()
  const udMap = unitDescrs()

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
      unitProps.set('text_descr', value.split('\\n').join('<br />'))
    } else {
      unitProps.set('text', value)
    }
  }

  return mapToObject(udMap)
}

function units() {
  const unitsText = fs.readFileSync(
    'C:/Games/Rome - Total War/data/text/export_units.txt',
    {
      encoding: 'utf-16le'
    }
  )

  let units = new Map<string, string>()
  for (const m of unitsText.matchAll(/{(\w+)}(\s|\r\n)(.+)/gm)) {
    units.set(m[1], m[3])
  }
  return units
}

function unitDescrs() {
  const unitDescrs = new Map<string, Map<string, string>>()
  let currentUnit: Map<string, string> | null = null

  const descrUnitText = fs.readFileSync(
    'C:/Games/Rome - Total War/data/export_descr_unit.txt',
    {
      encoding: 'utf-8'
    }
  )
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

function mapToObject(map: Map<string, Map<string, string>>): object {
  // Step 1: Convert the inner maps to plain objects
  const outerObject: { [key: string]: { [key: string]: string } } = {}

  map.forEach((innerMap, key) => {
    outerObject[key] = Object.fromEntries(innerMap)
  })

  // Step 2: Convert the outer map to a plain object
  const resultObject = Object.fromEntries(
    Object.entries(outerObject).map(([key, value]) => [key, value])
  )

  // Step 3: Stringify the resulting plain object to JSON
  return resultObject
}
