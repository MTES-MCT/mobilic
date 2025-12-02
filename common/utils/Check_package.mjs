#!/usr/bin/env ts-node/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */

/**
 * Checker Shai-Hulud "Second Coming"
 *
 * - Télécharge consolidated_iocs.csv de DataDog (format CSV:
 *   package_name,package_versions,sources)
 * - Modes :
 *   - Sans arguments -> scan du projet local (package.json + lockfiles)
 *   - --repos org1/repo1,org2/repo2 -> scan de ces dépôts GitHub
 *   - --org mon-orga -> scan de tous les repos publics de l'orga
 *
 * - Pour chaque projet / branche :
 *   - package.json -> "potentiellement vulnérable" si le range déclaré
 *     peut inclure au moins une des versions vulnérables.
 *   - package-lock.json / npm-shrinkwrap.json
 *   - yarn.lock (Yarn v1 & v2)
 *   - pnpm-lock.yaml
 */

import { promises as fs } from "fs"
import * as path from "path"
import semver from "semver"
import pkg from "yaml"
const { parse: parseYaml } = pkg

const AFFECTED_URL =
  "https://raw.githubusercontent.com/DataDog/indicators-of-compromise/refs/heads/main/shai-hulud-2.0/consolidated_iocs.csv"

const BRANCHES_TO_CHECK = ["main", "master", "dev", "develop", "prod"]

/* -------------------------------------------------------------------------- */
/*  Chargement de la liste Tenable                                            */
/* -------------------------------------------------------------------------- */

/**
 * Télécharge et parse la liste des paquets vulnérables
 * Format CSV: package_name,package_versions,sources
 */
async function loadAffectedPackages() {
  const res = await fetch(AFFECTED_URL)
  if (!res.ok) {
    throw new Error(
      `Impossible de récupérer la liste DataDog: ${res.status} ${res.statusText}`
    )
  }

  const csv = await res.text()
  const lines = csv.split(/\r?\n/).filter(line => line.trim().length > 0)
  const map = new Map()

  // Skip header line
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i]

    // Parse CSV: package_name,package_versions,sources
    // Handle quoted version strings with commas
    const match = line.match(/^([^,]+),"([^"]+)",(.+)$/) || line.match(/^([^,]+),([^,]+),(.+)$/)
    if (!match) continue

    const [, packageName, versionsStr] = match

    // Versions can be "1.2.3" or "1.2.3, 1.2.4"
    const versions = versionsStr
      .split(/\s*,\s*/)
      .map(v => v.trim())
      .filter(v => v.length > 0 && semver.valid(v))

    if (versions.length > 0) {
      if (map.has(packageName)) {
        // Merge versions if package already exists
        const existing = map.get(packageName)
        map.set(packageName, [...new Set([...existing, ...versions])])
      } else {
        map.set(packageName, versions)
      }
    }
  }

  return map
}

/* -------------------------------------------------------------------------- */
/*  Utilitaires                                                               */
/* -------------------------------------------------------------------------- */

function registerInstalledVersion(installed, name, version) {
  if (!semver.valid(version)) return // ignore les non-semver (file:, link:, etc.)

  const current = installed.get(name)
  if (!current) {
    installed.set(name, version)
    return
  }

  if (semver.gt(version, current)) {
    installed.set(name, version)
  }
}

function createScanResult(label, matches, analyzed) {
  return { label, matches, analyzed }
}

/**
 * Affichage d’un ScanResult
 * - Si analyzed === false -> rien n’est affiché
 * - Si analyzed === true && matches.length === 0 -> "rien de détecté"
 */
function printScanResult(result) {
  const { label, matches, analyzed } = result

  if (!analyzed) {
    return // fichier absent / non scanné -> pas de "rien de détecté"
  }

  if (!matches.length) {
    console.log(`\n${label}: ✅ rien de détecté`)
    return
  }

  console.log(
    `\n${label}: ⚠️ ${matches.length} paquet(s) affecté(s) / potentiellement affecté(s)`
  )
  for (const m of matches) {
    const vulnVers = m.vulnerableVersions.join(", ")
    if (m.installedVersion) {
      console.log(
        `  - [${m.source}] ${m.packageName}@${m.installedVersion} (versions vuln.: ${vulnVers})`
      )
    } else {
      console.log(
        `  - [${m.source}] ${m.packageName} (déclaré: ${m.declaredVersion}) (versions vuln.: ${vulnVers})`
      )
    }
  }
}

/* -------------------------------------------------------------------------- */
/*  SCAN LOCAL (fichiers du cwd)                                             */
/* -------------------------------------------------------------------------- */

/**
 * Analyse package.json (local)
 * -> "potentiellement vulnérable" si le range déclaré peut inclure
 * au moins une des versions dans vuln_vers.
 */
async function scanPackageJsonLocal(affected) {
  const file = path.join(process.cwd(), "package.json")
  let raw
  try {
    raw = await fs.readFile(file, "utf8")
  } catch {
    console.log("ℹ️ package.json absent, skip.")
    return createScanResult(
      "package.json (déclarations de dépendances)",
      [],
      false
    )
  }

  const pkg = JSON.parse(raw)
  const sections = [
    "dependencies",
    "devDependencies",
    "optionalDependencies",
    "peerDependencies"
  ]

  const matches = []

  for (const section of sections) {
    const deps = pkg[section]
    if (!deps || typeof deps !== "object") continue

    for (const [name, rangeSpec] of Object.entries(deps)) {
      const vulnVersions = affected.get(name)
      if (!vulnVersions) {
        // bruit possible, à commenter si trop verbeux
        // console.log(`✅ ${name} ok.`);
        continue
      }

      const validRange = semver.validRange(rangeSpec)
      if (!validRange) {
        console.log(`⚠️  ${name} : range invalide (${rangeSpec}), skip.`)
        continue
      }

      const matchingVuln = vulnVersions.filter(v => {
        if (!semver.valid(v)) return false
        return semver.satisfies(v, validRange, { includePrerelease: true })
      })

      if (matchingVuln.length > 0) {
        matches.push({
          source: `package.json (${section})`,
          packageName: name,
          declaredVersion: rangeSpec,
          vulnerableVersions: matchingVuln
        })
      }
    }
  }

  return createScanResult(
    "package.json (déclarations de dépendances)",
    matches,
    true
  )
}

/**
 * Analyse package-lock.json / npm-shrinkwrap.json (local)
 */
async function scanNpmLockLocal(affected, filename) {
  const file = path.join(process.cwd(), filename)
  let raw
  try {
    raw = await fs.readFile(file, "utf8")
  } catch {
    console.log(`ℹ️ ${filename} absent, skip.`)
    return createScanResult(filename, [], false)
  }

  const lock = JSON.parse(raw)
  const installed = new Map()

  function walkDeps(deps) {
    if (!deps || typeof deps !== "object") return
    for (const [name, info] of Object.entries(deps)) {
      if (info && typeof info === "object") {
        if (typeof info.version === "string" && semver.valid(info.version)) {
          registerInstalledVersion(installed, name, info.version)
        }
        if (info.dependencies) {
          walkDeps(info.dependencies)
        }
      }
    }
  }

  if (lock.dependencies) {
    walkDeps(lock.dependencies)
  }

  if (lock.packages && typeof lock.packages === "object") {
    for (const [key, pkgInfo] of Object.entries(lock.packages)) {
      if (
        !pkgInfo ||
        typeof pkgInfo !== "object" ||
        typeof pkgInfo.version !== "string"
      )
        continue
      if (!key) continue
      const parts = key.split("node_modules/")
      const name = parts[parts.length - 1]
      if (!name) continue
      if (!semver.valid(pkgInfo.version)) continue
      registerInstalledVersion(installed, name, pkgInfo.version)
    }
  }

  const matches = []

  for (const [name, version] of installed.entries()) {
    const vulnVersions = affected.get(name)
    if (!vulnVersions) continue

    const matchingVuln = vulnVersions.filter(
      v => semver.valid(v) && semver.eq(v, version)
    )

    if (matchingVuln.length > 0) {
      matches.push({
        source: filename,
        packageName: name,
        installedVersion: version,
        vulnerableVersions: matchingVuln
      })
    }
  }

  return createScanResult(filename, matches, true)
}

/**
 * Analyse pnpm-lock.yaml (local)
 */
async function scanPnpmLockLocal(affected) {
  const file = path.join(process.cwd(), "pnpm-lock.yaml")
  let raw
  try {
    raw = await fs.readFile(file, "utf8")
  } catch {
    console.log("ℹ️ pnpm-lock.yaml absent, skip.")
    return createScanResult("pnpm-lock.yaml", [], false)
  }

  const data = parseYaml(raw)
  const installed = new Map()

  const pkgs = data?.packages || data?.dependencies || {}
  for (const [key, info] of Object.entries(pkgs)) {
    const match = key.match(/^\/(.+?)@([^@]+)$/)
    if (!match) continue
    const [, name, version] = match
    if (!semver.valid(version)) continue
    registerInstalledVersion(installed, name, version)
  }

  const matches = []

  for (const [name, version] of installed.entries()) {
    const vulnVersions = affected.get(name)
    if (!vulnVersions) continue

    const matchingVuln = vulnVersions.filter(
      v => semver.valid(v) && semver.eq(v, version)
    )

    if (matchingVuln.length > 0) {
      matches.push({
        source: "pnpm-lock.yaml",
        packageName: name,
        installedVersion: version,
        vulnerableVersions: matchingVuln
      })
    }
  }

  return createScanResult("pnpm-lock.yaml", matches, true)
}

/**
 * Analyse yarn.lock (local)
 */
async function scanYarnLockLocal(affected) {
  const file = path.join(process.cwd(), "yarn.lock")
  let raw
  try {
    raw = await fs.readFile(file, "utf8")
  } catch {
    console.log("ℹ️ yarn.lock absent, skip.")
    return createScanResult("yarn.lock", [], false)
  }

  const lines = raw.split(/\r?\n/)
  const installed = new Map()

  let i = 0
  while (i < lines.length) {
    const line = lines[i]

    if (/^[^\s].*:$/.test(line)) {
      const keyLine = line.trim().replace(/:$/, "")
      const descriptor = keyLine.replace(/^"+|"+$/g, "")
      let pkgName

      if (descriptor.startsWith("@")) {
        const secondAt = descriptor.indexOf("@", 1)
        if (secondAt === -1) {
          pkgName = descriptor
        } else {
          pkgName = descriptor.substring(0, secondAt)
        }
      } else {
        const at = descriptor.indexOf("@")
        pkgName = at === -1 ? descriptor : descriptor.substring(0, at)
      }

      let j = i + 1
      let version
      while (j < lines.length && /^\s/.test(lines[j])) {
        const l = lines[j].trim()
        const m = l.match(/^version\s*[: ]\s*"?([^"\s]+)"?/)
        if (m) {
          version = m[1]
          break
        }
        j++
      }

      if (pkgName && version && semver.valid(version)) {
        registerInstalledVersion(installed, pkgName, version)
      }

      i = j
      continue
    }

    i++
  }

  const matches = []

  for (const [name, version] of installed.entries()) {
    const vulnVersions = affected.get(name)
    if (!vulnVersions) continue

    const matchingVuln = vulnVersions.filter(
      v => semver.valid(v) && semver.eq(v, version)
    )

    if (matchingVuln.length > 0) {
      matches.push({
        source: "yarn.lock",
        packageName: name,
        installedVersion: version,
        vulnerableVersions: matchingVuln
      })
    }
  }

  return createScanResult("yarn.lock", matches, true)
}

/* -------------------------------------------------------------------------- */
/*  SCAN REMOTE (GitHub)                                                     */
/* -------------------------------------------------------------------------- */

async function fetchTextIfExists(url) {
  const res = await fetch(url, {
    headers: {
      Accept: "application/vnd.github.v3.raw",
      "User-Agent": "shai-hulud-checker"
    }
  })

  if (!res.ok) return null
  return res.text()
}

async function scanPackageJsonRemote(affected, owner, repo, branch) {
  const url = `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/package.json`
  const raw = await fetchTextIfExists(url)
  if (!raw) {
    return createScanResult(`package.json (${branch})`, [], false)
  }

  const pkg = JSON.parse(raw)
  const sections = [
    "dependencies",
    "devDependencies",
    "optionalDependencies",
    "peerDependencies"
  ]

  const matches = []

  for (const section of sections) {
    const deps = pkg[section]
    if (!deps || typeof deps !== "object") continue

    for (const [name, rangeSpec] of Object.entries(deps)) {
      const vulnVersions = affected.get(name)
      if (!vulnVersions) continue

      const validRange = semver.validRange(rangeSpec)
      if (!validRange) continue

      const matchingVuln = vulnVersions.filter(v => {
        if (!semver.valid(v)) return false
        return semver.satisfies(v, validRange, { includePrerelease: true })
      })

      if (matchingVuln.length > 0) {
        matches.push({
          source: `${owner}/${repo}@${branch} (package.json ${section})`,
          packageName: name,
          declaredVersion: rangeSpec,
          vulnerableVersions: matchingVuln
        })
      }
    }
  }

  return createScanResult(`package.json (${branch})`, matches, true)
}

async function scanNpmLockRemote(affected, owner, repo, branch, filename) {
  const url = `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${filename}`
  const raw = await fetchTextIfExists(url)
  if (!raw) {
    return createScanResult(`${filename} (${branch})`, [], false)
  }

  const lock = JSON.parse(raw)
  const installed = new Map()

  function walkDeps(deps) {
    if (!deps || typeof deps !== "object") return
    for (const [name, info] of Object.entries(deps)) {
      if (info && typeof info === "object") {
        if (typeof info.version === "string" && semver.valid(info.version)) {
          registerInstalledVersion(installed, name, info.version)
        }
        if (info.dependencies) {
          walkDeps(info.dependencies)
        }
      }
    }
  }

  if (lock.dependencies) {
    walkDeps(lock.dependencies)
  }

  if (lock.packages && typeof lock.packages === "object") {
    for (const [key, pkgInfo] of Object.entries(lock.packages)) {
      if (
        !pkgInfo ||
        typeof pkgInfo !== "object" ||
        typeof pkgInfo.version !== "string"
      )
        continue
      if (!key) continue
      const parts = key.split("node_modules/")
      const name = parts[parts.length - 1]
      if (!name) continue
      if (!semver.valid(pkgInfo.version)) continue
      registerInstalledVersion(installed, name, pkgInfo.version)
    }
  }

  const matches = []

  for (const [name, version] of installed.entries()) {
    const vulnVersions = affected.get(name)
    if (!vulnVersions) continue

    const matchingVuln = vulnVersions.filter(
      v => semver.valid(v) && semver.eq(v, version)
    )

    if (matchingVuln.length > 0) {
      matches.push({
        source: `${owner}/${repo}@${branch} (${filename})`,
        packageName: name,
        installedVersion: version,
        vulnerableVersions: matchingVuln
      })
    }
  }

  return createScanResult(`${filename} (${branch})`, matches, true)
}

async function scanPnpmLockRemote(affected, owner, repo, branch) {
  const url = `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/pnpm-lock.yaml`
  const raw = await fetchTextIfExists(url)
  if (!raw) {
    return createScanResult(`pnpm-lock.yaml (${branch})`, [], false)
  }

  const data = parseYaml(raw)
  const installed = new Map()

  const pkgs = data?.packages || data?.dependencies || {}
  for (const [key, info] of Object.entries(pkgs)) {
    const match = key.match(/^\/(.+?)@([^@]+)$/)
    if (!match) continue
    const [, name, version] = match
    if (!semver.valid(version)) continue
    registerInstalledVersion(installed, name, version)
  }

  const matches = []

  for (const [name, version] of installed.entries()) {
    const vulnVersions = affected.get(name)
    if (!vulnVersions) continue

    const matchingVuln = vulnVersions.filter(
      v => semver.valid(v) && semver.eq(v, version)
    )

    if (matchingVuln.length > 0) {
      matches.push({
        source: `${owner}/${repo}@${branch} (pnpm-lock.yaml)`,
        packageName: name,
        installedVersion: version,
        vulnerableVersions: matchingVuln
      })
    }
  }

  return createScanResult(`pnpm-lock.yaml (${branch})`, matches, true)
}

async function scanYarnLockRemote(affected, owner, repo, branch) {
  const url = `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/yarn.lock`
  const raw = await fetchTextIfExists(url)
  if (!raw) {
    return createScanResult(`yarn.lock (${branch})`, [], false)
  }

  const lines = raw.split(/\r?\n/)
  const installed = new Map()

  let i = 0
  while (i < lines.length) {
    const line = lines[i]

    if (/^[^\s].*:$/.test(line)) {
      const keyLine = line.trim().replace(/:$/, "")
      const descriptor = keyLine.replace(/^"+|"+$/g, "")
      let pkgName

      if (descriptor.startsWith("@")) {
        const secondAt = descriptor.indexOf("@", 1)
        if (secondAt === -1) {
          pkgName = descriptor
        } else {
          pkgName = descriptor.substring(0, secondAt)
        }
      } else {
        const at = descriptor.indexOf("@")
        pkgName = at === -1 ? descriptor : descriptor.substring(0, at)
      }

      let j = i + 1
      let version
      while (j < lines.length && /^\s/.test(lines[j])) {
        const l = lines[j].trim()
        const m = l.match(/^version\s*[: ]\s*"?([^"\s]+)"?/)
        if (m) {
          version = m[1]
          break
        }
        j++
      }

      if (pkgName && version && semver.valid(version)) {
        registerInstalledVersion(installed, pkgName, version)
      }

      i = j
      continue
    }

    i++
  }

  const matches = []

  for (const [name, version] of installed.entries()) {
    const vulnVersions = affected.get(name)
    if (!vulnVersions) continue

    const matchingVuln = vulnVersions.filter(
      v => semver.valid(v) && semver.eq(v, version)
    )

    if (matchingVuln.length > 0) {
      matches.push({
        source: `${owner}/${repo}@${branch} (yarn.lock)`,
        packageName: name,
        installedVersion: version,
        vulnerableVersions: matchingVuln
      })
    }
  }

  return createScanResult(`yarn.lock (${branch})`, matches, true)
}

/**
 * Scan d’un repo remote pour une branche donnée
 */
async function scanRemoteRepoBranch(affected, owner, repo, branch) {
  console.log(`\n--- Branch ${branch} ---`)

  const pkgJsonResult = await scanPackageJsonRemote(
    affected,
    owner,
    repo,
    branch
  )
  const npmLockResult = await scanNpmLockRemote(
    affected,
    owner,
    repo,
    branch,
    "package-lock.json"
  )
  const shrinkwrapResult = await scanNpmLockRemote(
    affected,
    owner,
    repo,
    branch,
    "npm-shrinkwrap.json"
  )
  const pnpmResult = await scanPnpmLockRemote(affected, owner, repo, branch)
  const yarnResult = await scanYarnLockRemote(affected, owner, repo, branch)

  const results = [
    pkgJsonResult,
    npmLockResult,
    shrinkwrapResult,
    pnpmResult,
    yarnResult
  ]
  const anyAnalyzed = results.some(r => r.analyzed)

  if (!anyAnalyzed) {
    console.log(`(aucun package.json / lockfile trouvé sur ${branch})`)
    return
  }

  for (const r of results) {
    printScanResult(r)
  }

  const allMatches = results.flatMap(r => r.matches)
  if (allMatches.length === 0) {
    console.log(`Branch ${branch}: ✅ aucun package vulnérable détecté.`)
  } else {
    console.log(
      `Branch ${branch}: ⚠️ ${allMatches.length} correspondance(s) au total.`
    )
  }
}

/**
 * Scan d’un repo remote sur plusieurs branches
 */
async function scanRemoteRepo(affected, owner, repo) {
  console.log(`\n=================================`)
  console.log(`📦 Scan GitHub repo: ${owner}/${repo}`)
  console.log(`=================================`)

  for (const branch of BRANCHES_TO_CHECK) {
    await scanRemoteRepoBranch(affected, owner, repo, branch)
  }
}

/**
 * Récupère tous les repos publics d’une orga
 */
async function fetchOrgRepos(org) {
  const repos = []
  let page = 1

  while (true) {
    const url = `https://api.github.com/orgs/${org}/repos?per_page=100&page=${page}`
    const res = await fetch(url, {
      headers: {
        Accept: "application/vnd.github.v3+json",
        "User-Agent": "shai-hulud-checker"
      }
    })

    if (!res.ok) {
      throw new Error(
        `Erreur API GitHub pour org ${org}: ${res.status} ${res.statusText}`
      )
    }

    const batch = await res.json()
    if (!batch.length) break

    repos.push(...batch)

    if (batch.length < 100) break
    page++
  }

  return repos
}

/* -------------------------------------------------------------------------- */
/*  MAIN                                                                      */
/* -------------------------------------------------------------------------- */

async function main() {
  console.log('🔍 Chargement de la liste DataDog Shai-Hulud "Second Coming"...')
  const affected = await loadAffectedPackages()
  console.log(`➡️  ${affected.size} paquets présents dans consolidated_iocs.csv.`)

  const args = process.argv.slice(2)
  let org = null
  const repos = []

  for (let i = 0; i < args.length; i++) {
    const arg = args[i]
    if (arg === "--org" && args[i + 1]) {
      org = args[i + 1]
      i++
    } else if (arg === "--repos" && args[i + 1]) {
      repos.push(
        ...args[i + 1]
          .split(",")
          .map(s => s.trim())
          .filter(Boolean)
      )
      i++
    }
  }

  // MODE 1: Scan local (par défaut)
  if (!org && repos.length === 0) {
    console.log("\n🖥  Mode: scan du projet local (cwd)\n")

    const pkgJsonResult = await scanPackageJsonLocal(affected)
    const npmLockResult = await scanNpmLockLocal(affected, "package-lock.json")
    const shrinkwrapResult = await scanNpmLockLocal(
      affected,
      "npm-shrinkwrap.json"
    )
    const pnpmResult = await scanPnpmLockLocal(affected)
    const yarnResult = await scanYarnLockLocal(affected)

    const results = [
      pkgJsonResult,
      npmLockResult,
      shrinkwrapResult,
      pnpmResult,
      yarnResult
    ]

    for (const r of results) {
      printScanResult(r)
    }

    const allMatches = results.flatMap(r => r.matches)

    console.log("\n============================")
    if (allMatches.length === 0) {
      console.log(
        "✅ Aucun package de ton projet ne correspond aux versions vulnérables listées."
      )
    } else {
      console.log(
        "⚠️ Attention : ton projet utilise des packages affectés / potentiellement affectés.\n" +
          "   - Mets à jour vers une version NON listée dans `vuln_vers`.\n" +
          "   - Vérifie aussi la chaîne CI/CD et les artefacts générés."
      )
    }
    console.log("============================\n")

    return
  }

  // MODE 2: Scan d’une liste de repos explicites
  if (repos.length > 0) {
    console.log("\n🌐 Mode: scan de dépôts GitHub (--repos)\n")

    for (const spec of repos) {
      const [owner, repo] = spec.split("/")
      if (!owner || !repo) {
        console.error(`⚠️ Repo invalide "${spec}", attendu: owner/repo`)
        continue
      }
      await scanRemoteRepo(affected, owner, repo)
    }

    return
  }

  // MODE 3: Scan de tous les repos publics d’une org
  if (org) {
    console.log(
      `\n🏢 Mode: scan de tous les repos publics de l’orga "${org}"\n`
    )
    const orgRepos = await fetchOrgRepos(org)
    console.log(
      `➡️ ${orgRepos.length} repo(s) public(s) trouvés pour ${org}.\n`
    )

    for (const r of orgRepos) {
      await scanRemoteRepo(affected, r.owner.login, r.name)
    }
  }
}

main().catch(err => {
  console.error("Erreur pendant le scan:", err)
  process.exit(1)
})
