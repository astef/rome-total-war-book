import fs from 'fs'

function units() {
  const unitsText = fs.readFileSync(
    'C:/Games/Rome - Total War/data/text/export_units.txt',
    {
      encoding: 'utf-16le'
    }
  )

  let units = new Map<string, string>()
  for (const m of unitsText.matchAll(/{(\w+)}(\s|\r\n)(.+)/gm)) {
    // console.log(``)
    // console.log(`Name: ${m[1]}`)
    // console.log(`Val: ${m[3]}`)
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

async function main() {
  const u = units()
  const ud = unitDescrs()

  for (const [key, value] of u) {
    const unit = key.replace(/_descr(_short)?$/, '')

    const unitProps = ud.get(unit)
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

  Array.from(ud.entries()).map(
    ([unitKey, unit]) =>
      `<img src="">
      <h1>${unit.get('text')}</h1> <p>${unit.get(
        'text_descr_short'
      )}</p><p>${unit.get('text_descr')}</p>`
  )

  //   console.log(
  //     JSON.stringify(
  //       Array.from(ud.get('carthaginian_generals_cavalry')!.entries()),
  //       null,
  //       2
  //     )
  //   )
  //   console.log('OK')
}

main()
