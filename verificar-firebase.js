// Script para verificar la configuración de Firebase
// Ejecuta con: node verificar-firebase.js

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔍 Verificando configuración de Firebase...\n');

// 1. Verificar firebase-applet-config.json
console.log('1️⃣ Verificando firebase-applet-config.json...');
try {
  const configPath = path.join(__dirname, 'firebase-applet-config.json');
  const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
  
  console.log('   ✅ Archivo encontrado');
  console.log(`   - projectId: ${config.projectId || '❌ FALTA'}`);
  console.log(`   - apiKey: ${config.apiKey?.includes('PENDIENTE') || !config.apiKey ? '❌ PENDIENTE/FALTA' : '✅ Configurado'}`);
  console.log(`   - appId: ${config.appId?.includes('PENDIENTE') || !config.appId ? '❌ PENDIENTE/FALTA' : '✅ Configurado'}`);
  console.log(`   - authDomain: ${config.authDomain || '❌ FALTA'}`);
  console.log(`   - storageBucket: ${config.storageBucket || '❌ FALTA'}`);
  console.log(`   - messagingSenderId: ${config.messagingSenderId?.includes('PENDIENTE') || !config.messagingSenderId ? '❌ PENDIENTE/FALTA' : '✅ Configurado'}`);
  
  const hasAllCredentials = 
    config.projectId && 
    config.apiKey && !config.apiKey.includes('PENDIENTE') &&
    config.appId && !config.appId.includes('PENDIENTE') &&
    config.authDomain &&
    config.storageBucket &&
    config.messagingSenderId && !config.messagingSenderId.includes('PENDIENTE');
  
  if (!hasAllCredentials) {
    console.log('\n   ⚠️  FALTAN CREDENCIALES DE FIREBASE');
    console.log('   📖 Sigue la guía: GUIA_FIREBASE_PASO_A_PASO.md');
  } else {
    console.log('\n   ✅ Todas las credenciales están configuradas');
  }
} catch (error) {
  console.log('   ❌ Error al leer firebase-applet-config.json');
  console.log(`   Error: ${error.message}`);
}

console.log('\n');

// 2. Verificar archivo .env
console.log('2️⃣ Verificando archivo .env...');
const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
  console.log('   ✅ Archivo .env encontrado');
  const envContent = fs.readFileSync(envPath, 'utf-8');
  
  const checks = {
    'VITE_FIREBASE_API_KEY': envContent.includes('VITE_FIREBASE_API_KEY'),
    'VITE_FIREBASE_AUTH_DOMAIN': envContent.includes('VITE_FIREBASE_AUTH_DOMAIN'),
    'VITE_FIREBASE_PROJECT_ID': envContent.includes('VITE_FIREBASE_PROJECT_ID'),
    'VITE_FIREBASE_APP_ID': envContent.includes('VITE_FIREBASE_APP_ID'),
    'VITE_GOOGLE_SPREADSHEET_ID': envContent.includes('VITE_GOOGLE_SPREADSHEET_ID')
  };
  
  Object.entries(checks).forEach(([key, value]) => {
    console.log(`   ${value ? '✅' : '❌'} ${key}`);
  });
  
  const hasPendingValues = envContent.includes('OBTENER_DE_FIREBASE_CONSOLE') || 
                           envContent.includes('PENDIENTE');
  
  if (hasPendingValues) {
    console.log('\n   ⚠️  Algunos valores aún están pendientes de configurar');
  }
} else {
  console.log('   ⚠️  Archivo .env NO encontrado');
  console.log('   💡 Puedes crear uno copiando .env.example');
  console.log('   O usar firebase-applet-config.json directamente');
}

console.log('\n');

// 3. Verificar node_modules
console.log('3️⃣ Verificando dependencias instaladas...');
if (fs.existsSync(path.join(__dirname, 'node_modules'))) {
  console.log('   ✅ node_modules encontrado');
  
  const requiredPackages = ['firebase', 'vite', 'react', 'react-dom'];
  const packageJsonPath = path.join(__dirname, 'package.json');
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
  const installedDeps = { ...packageJson.dependencies, ...packageJson.devDependencies };
  
  requiredPackages.forEach(pkg => {
    const installed = installedDeps[pkg];
    console.log(`   ${installed ? '✅' : '❌'} ${pkg} ${installed ? `(${installed})` : ''}`);
  });
} else {
  console.log('   ❌ node_modules NO encontrado');
  console.log('   💡 Ejecuta: npm install');
}

console.log('\n');

// 4. Resumen final
console.log('📊 RESUMEN:\n');
console.log('Para solucionar el error "auth/internal-error", necesitas:');
console.log('');
console.log('1. 🔥 Obtener credenciales de Firebase Console');
console.log('   → https://console.firebase.google.com/');
console.log('   → Proyecto: superpuntos');
console.log('   → Email: supergestionesintegrales@gmail.com');
console.log('');
console.log('2. 📝 Actualizar credenciales en:');
console.log('   → firebase-applet-config.json (recomendado)');
console.log('   O en .env');
console.log('');
console.log('3. 🔄 Reiniciar la aplicación:');
console.log('   → Ctrl+C para detener');
console.log('   → npm run dev para reiniciar');
console.log('');
console.log('📖 Guía completa: GUIA_FIREBASE_PASO_A_PASO.md');
console.log('');
