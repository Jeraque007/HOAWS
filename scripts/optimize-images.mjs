/**
 * Generates optimized WebP versions of every source image in src/assets.
 *
 * - Originals (.png/.jpg/.jpeg) are kept in the repo so the change is revertable.
 * - Imports in src/ point at the generated .webp files.
 * - Images wider than 1200px are downscaled (they are never displayed larger
 *   than ~400 CSS px, so this is invisible even on high-DPI screens).
 * - Quality falls back 90 -> 70 until the WebP is smaller than the source;
 *   if no quality wins, the original is kept (a stale .webp is removed).
 *
 * Usage: npm run optimize-images
 */
import { readdir, stat, rename, rm } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { join, extname, basename } from 'node:path'
import sharp from 'sharp'

const MAX_WIDTH = 1200
const QUALITIES = [90, 85, 80, 75, 70]
const SOURCE_EXTENSIONS = new Set(['.png', '.jpg', '.jpeg'])
const assetsDir = fileURLToPath(new URL('../src/assets/', import.meta.url))

const formatBytes = (bytes) =>
  bytes >= 1024 * 1024
    ? `${(bytes / (1024 * 1024)).toFixed(2)} MB`
    : `${Math.max(1, Math.round(bytes / 1024))} KB`

const entries = (await readdir(assetsDir))
  .filter((name) => SOURCE_EXTENSIONS.has(extname(name).toLowerCase()))
  .sort()

let totalBefore = 0
let totalAfter = 0

for (const name of entries) {
  const sourcePath = join(assetsDir, name)
  const outputPath = join(assetsDir, `${basename(name, extname(name))}.webp`)
  const tempPath = `${outputPath}.tmp`

  const metadata = await sharp(sourcePath).metadata()
  const inputStats = await stat(sourcePath)
  let acceptedQuality = null

  for (const quality of QUALITIES) {
    await sharp(sourcePath)
      .resize({ width: MAX_WIDTH, withoutEnlargement: true })
      .webp({ quality, effort: 6 })
      .toFile(tempPath)

    const tempStats = await stat(tempPath)
    if (tempStats.size < inputStats.size) {
      await rm(outputPath, { force: true })
      await rename(tempPath, outputPath)
      acceptedQuality = quality
      break
    }
    await rm(tempPath, { force: true })
  }

  const scale = metadata.width > MAX_WIDTH ? ` scaled ${metadata.width}px -> ${MAX_WIDTH}px` : ''

  if (acceptedQuality === null) {
    // WebP would not be smaller than the source - keep the original file.
    await rm(outputPath, { force: true })
    totalBefore += inputStats.size
    totalAfter += inputStats.size
    console.log(`${name}${scale}: kept original (${formatBytes(inputStats.size)}, WebP not smaller)`)
    continue
  }

  const outputStats = await stat(outputPath)
  totalBefore += inputStats.size
  totalAfter += outputStats.size

  console.log(
    `${name}${scale} [q${acceptedQuality}]: ${formatBytes(inputStats.size)} -> ${formatBytes(outputStats.size)}`,
  )
}

console.log('---')
console.log(`Total: ${formatBytes(totalBefore)} -> ${formatBytes(totalAfter)} (${Math.round((1 - totalAfter / totalBefore) * 100)}% smaller)`)
