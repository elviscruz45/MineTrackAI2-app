#!/usr/bin/env node

/**
 * Script para copiar las fuentes de iconos de node_modules a dist/fonts
 * Se ejecuta automáticamente después del build
 */

const fs = require("fs");
const path = require("path");

const DIST_DIR = path.join(__dirname, "..", "dist");
const FONTS_DIR = path.join(DIST_DIR, "fonts");
const SOURCE_FONTS_DIR = path.join(
  DIST_DIR,
  "assets",
  "node_modules",
  "@expo",
  "vector-icons",
  "build",
  "vendor",
  "react-native-vector-icons",
  "Fonts"
);

const ICON_FONTS = [
  "Ionicons",
  "MaterialIcons",
  "MaterialCommunityIcons",
  "Feather",
];

console.log("📦 Copiando fuentes de iconos...");

// Crear directorio fonts si no existe
if (!fs.existsSync(FONTS_DIR)) {
  fs.mkdirSync(FONTS_DIR, { recursive: true });
  console.log("✅ Creada carpeta dist/fonts/");
}

// Verificar que existe el directorio fuente
if (!fs.existsSync(SOURCE_FONTS_DIR)) {
  console.error(
    "❌ No se encontró el directorio de fuentes:",
    SOURCE_FONTS_DIR
  );
  process.exit(1);
}

// Buscar y copiar cada fuente de icono
let copiedCount = 0;
const sourceFiles = fs.readdirSync(SOURCE_FONTS_DIR);

ICON_FONTS.forEach((fontFamily) => {
  // Buscar archivo que empiece con el nombre de la fuente
  const fontFile = sourceFiles.find((file) => file.startsWith(fontFamily));

  if (fontFile) {
    const sourcePath = path.join(SOURCE_FONTS_DIR, fontFile);
    const destPath = path.join(FONTS_DIR, fontFile);

    try {
      fs.copyFileSync(sourcePath, destPath);
      const stats = fs.statSync(destPath);
      const sizeKB = (stats.size / 1024).toFixed(1);
      console.log(`✅ ${fontFamily}: ${fontFile} (${sizeKB} KB)`);
      copiedCount++;
    } catch (error) {
      console.error(`❌ Error copiando ${fontFamily}:`, error.message);
    }
  } else {
    console.warn(`⚠️  No se encontró fuente para ${fontFamily}`);
  }
});

console.log(
  `\n✅ Copiadas ${copiedCount}/${ICON_FONTS.length} fuentes de iconos`
);

// Verificar archivos finales
const finalFiles = fs.readdirSync(FONTS_DIR);
console.log("\n📁 Archivos en dist/fonts/:");
finalFiles.forEach((file) => {
  const stats = fs.statSync(path.join(FONTS_DIR, file));
  const sizeKB = (stats.size / 1024).toFixed(1);
  console.log(`   - ${file} (${sizeKB} KB)`);
});
