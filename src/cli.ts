import { fileURLToPath } from 'url'
import consola from 'consola'
import { execa } from 'execa'
import { readUser, writeUser } from 'rc9'
import globalDirs from 'global-dirs'
import { resolve } from 'pathe'
import { name as moduleName } from '../package.json'

const RC_PATH = '.nuxtrc'

async function run() {
  const args = process.argv.slice(2)
  const command = args[0]
  const cwd = process.cwd()
  const dir = fileURLToPath(import.meta.url)

  console.log(moduleName, 'dir', dir)

  if (command === 'enable') {
    consola.info('Installed Nuxt Devtools...')
    await execa('npm', ['install', '-g', `${moduleName}@latest`])
    const modulePath = resolve(globalDirs.npm.packages, moduleName)
    console.log(moduleName, 'modulePath', modulePath)
    enable(cwd, modulePath)
    consola.info('Nuxt Devtools enabled! Restart your Nuxt app to start using it.')
  }
  else if (command === 'disable') {
    if (disable(cwd))
      consola.success('Nuxt Devtools disabled for this project.')
    else
      consola.warn('Nuxt Devtools is not enabled for this project.')
  }
  else {
    consola.log(`Unknown command "${command}"`)
  }
}

function enable(path: string, modulePath: string) {
  const rc = readUser(RC_PATH)
  let changed = false
  if (rc.modules?.includes(modulePath)) {
    rc.modules = [...rc.modules || [], modulePath]
    changed = true
  }

  if (!rc.devtools)
    rc.devtools = {}
  if (!rc.devtools.enabledProjects)
    rc.devtools.enabledProjects = []
  if (!rc.devtools.enabledProjects.includes(path)) {
    rc.devtools.enabledProjects.push(path)
    changed = true
  }
  if (changed)
    writeUser(rc, RC_PATH)
  return changed
}

function disable(path: string) {
  const rc = readUser(RC_PATH)
  if (rc.devtools?.enabledProjects?.includes(path)) {
    rc.devtools.enabledProjects = rc.devtools.enabledProjects.filter((p: string) => p !== path)
    writeUser(rc, RC_PATH)
    return true
  }
  return false
}

run()
  .catch((err) => {
    consola.error(err)
    process.exit(1)
  })