import * as mupdf from 'mupdf'
import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

const __dirname = dirname(fileURLToPath(import.meta.url))
const PDF_DIR = join(__dirname, '..', 'public', 'newsletters')
const COVERS_DIR = join(PDF_DIR, 'covers')

if (!existsSync(COVERS_DIR)) mkdirSync(COVERS_DIR, { recursive: true })

const pdfFiles = readdirSync(PDF_DIR).filter(f => f.endsWith('.pdf'))
console.log(`Found ${pdfFiles.length} PDFs to process\n`)

const COVER_WIDTH = 400

for (const file of pdfFiles) {
  const slug = file.replace('.pdf', '')
  const outPath = join(COVERS_DIR, `${slug}.jpg`)

  if (existsSync(outPath)) {
    console.log(`  SKIP ${slug} (already exists)`)
    continue
  }

  try {
    const pdfPath = join(PDF_DIR, file)
    const buf = readFileSync(pdfPath)
    const doc = mupdf.Document.openDocument(buf, 'application/pdf')
    const page = doc.loadPage(0)
    const bounds = page.getBounds()
    const pageWidth = bounds[2] - bounds[0]
    const pageHeight = bounds[3] - bounds[1]
    const scale = COVER_WIDTH / pageWidth
    const width = Math.floor(pageWidth * scale)
    const height = Math.floor(pageHeight * scale)

    const pixmap = page.toPixmap(
      mupdf.Matrix.scale(scale, scale),
      mupdf.ColorSpace.DeviceRGB,
      false, // no alpha
      true   // white background
    )

    const pixels = pixmap.getPixels()

    await sharp(Buffer.from(pixels), {
      raw: { width, height, channels: 3 }
    })
      .jpeg({ quality: 80 })
      .toFile(outPath)

    console.log(`  OK ${slug} (${width}x${height})`)
  } catch (err) {
    console.log(`  FAIL ${slug}: ${err.message}`)
  }
}

console.log('\nDone!')
