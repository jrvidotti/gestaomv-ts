#!/usr/bin/env tsx

/**
 * Script para migrar URLs completas de imagens para apenas chaves do storage
 *
 * Converte URLs como:
 * "https://s3.modaverao.com.br/gestaomv/materiais/uuid.jpg"
 *
 * Para chaves como:
 * "materiais/uuid.jpg"
 */

import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import { materiais } from '../shared/schemas/almoxarifado';
import { eq, and, isNotNull, ne } from 'drizzle-orm';

const DB_PATH = './data/database.sqlite';

async function migrateImageUrls() {
  console.log('🔄 Iniciando migração de URLs de imagens...');

  try {
    // Conectar ao banco
    const sqlite = new Database(DB_PATH);
    const db = drizzle(sqlite);

    // Buscar todos os materiais com foto não vazia
    const materiaisComFoto = await db
      .select({
        id: materiais.id,
        nome: materiais.nome,
        foto: materiais.foto,
      })
      .from(materiais)
      .where(and(isNotNull(materiais.foto), ne(materiais.foto, '')));

    console.log(`📋 Encontrados ${materiaisComFoto.length} materiais com fotos`);

    if (materiaisComFoto.length === 0) {
      console.log('✅ Nenhuma migração necessária');
      return;
    }

    let migrated = 0;
    let skipped = 0;

    for (const material of materiaisComFoto) {
      const { id, nome, foto } = material;

      if (!foto) continue;

      // Verificar se já é uma chave (não começa com http)
      if (!foto.startsWith('http')) {
        console.log(`⏭️  Material "${nome}" (ID: ${id}): já migrado`);
        skipped++;
        continue;
      }

      try {
        // Extrair chave da URL
        // URL: https://s3.modaverao.com.br/gestaomv/materiais/uuid.jpg
        // Chave: materiais/uuid.jpg
        const url = new URL(foto);
        const pathname = url.pathname; // /gestaomv/materiais/uuid.jpg
        const chave = pathname.substring(1).replace('gestaomv/', ''); // materiais/uuid.jpg

        if (!chave || chave === pathname) {
          console.log(`⚠️  Material "${nome}" (ID: ${id}): não foi possível extrair chave da URL: ${foto}`);
          continue;
        }

        // Atualizar no banco
        await db.update(materiais).set({ foto: chave }).where(eq(materiais.id, id));

        console.log(`✅ Material "${nome}" (ID: ${id}): ${foto} → ${chave}`);
        migrated++;
      } catch (error) {
        console.error(`❌ Erro ao migrar material "${nome}" (ID: ${id}):`, error);
      }
    }

    sqlite.close();

    console.log('\n📊 Resumo da migração:');
    console.log(`   ✅ Migrados: ${migrated}`);
    console.log(`   ⏭️  Já migrados: ${skipped}`);
    console.log(`   📋 Total processados: ${materiaisComFoto.length}`);
    console.log('\n🎉 Migração concluída!');
  } catch (error) {
    console.error('❌ Erro durante a migração:', error);
    process.exit(1);
  }
}

// Executar migração
migrateImageUrls();
