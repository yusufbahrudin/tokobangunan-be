'use strict';
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

module.exports = {
  async up(queryInterface) {
    const now = new Date();

    // ── Admin user ────────────────────────────────────────────────────────
    const adminId = uuidv4();
    await queryInterface.bulkInsert('users', [
      {
        id: adminId,
        name: 'Admin Galangan Rizal',
        email: 'admin@galaganrizal.com',
        password: await bcrypt.hash('Admin123!', 12),
        role: 'admin',
        phone: '08123456789',
        is_active: true,
        refresh_token: null,
        created_at: now,
        updated_at: now,
      },
    ]);

    // ── Kategori utama (parent) ───────────────────────────────────────────
    const catIds = {
      bahan_bangunan: uuidv4(),
      cat: uuidv4(),
      perkakas: uuidv4(),
      kamar_mandi: uuidv4(),
      keramik: uuidv4(),
      elektronik: uuidv4(),
      pipa: uuidv4(),
      pintu_jendela: uuidv4(),
    };

    const categories = [
      { id: catIds.bahan_bangunan, name: 'Bahan Bangunan', slug: 'bahan-bangunan', sort_order: 1 },
      { id: catIds.cat, name: 'Cat & Kimia', slug: 'cat-kimia', sort_order: 2 },
      { id: catIds.perkakas, name: 'Perkakas & Alat', slug: 'perkakas-alat', sort_order: 3 },
      { id: catIds.kamar_mandi, name: 'Kamar Mandi', slug: 'kamar-mandi', sort_order: 4 },
      { id: catIds.keramik, name: 'Keramik & Granit', slug: 'keramik-granit', sort_order: 5 },
      { id: catIds.elektronik, name: 'Elektronik & Lampu', slug: 'elektronik-lampu', sort_order: 6 },
      { id: catIds.pipa, name: 'Pipa & Plumbing', slug: 'pipa-plumbing', sort_order: 7 },
      { id: catIds.pintu_jendela, name: 'Pintu & Jendela', slug: 'pintu-jendela', sort_order: 8 },
    ].map((c) => ({
      ...c,
      description: null,
      image: null,
      parent_id: null,
      is_active: true,
      created_at: now,
      updated_at: now,
    }));

    await queryInterface.bulkInsert('categories', categories);

    // ── Sub-kategori ──────────────────────────────────────────────────────
    const subCategories = [
      { name: 'Semen', slug: 'semen', parent_id: catIds.bahan_bangunan, sort_order: 1 },
      { name: 'Bata Ringan', slug: 'bata-ringan', parent_id: catIds.bahan_bangunan, sort_order: 2 },
      { name: 'Waterproofing', slug: 'waterproofing', parent_id: catIds.bahan_bangunan, sort_order: 3 },
      { name: 'Plafon', slug: 'plafon', parent_id: catIds.bahan_bangunan, sort_order: 4 },
      { name: 'Atap', slug: 'atap', parent_id: catIds.bahan_bangunan, sort_order: 5 },
      { name: 'Cat Dinding', slug: 'cat-dinding', parent_id: catIds.cat, sort_order: 1 },
      { name: 'Cat Kayu & Besi', slug: 'cat-kayu-besi', parent_id: catIds.cat, sort_order: 2 },
      { name: 'Cat Lantai', slug: 'cat-lantai', parent_id: catIds.cat, sort_order: 3 },
      { name: 'Bor & Gerinda', slug: 'bor-gerinda', parent_id: catIds.perkakas, sort_order: 1 },
      { name: 'Obeng & Kunci', slug: 'obeng-kunci', parent_id: catIds.perkakas, sort_order: 2 },
      { name: 'Palu & Pahat', slug: 'palu-pahat', parent_id: catIds.perkakas, sort_order: 3 },
      { name: 'Kloset', slug: 'kloset', parent_id: catIds.kamar_mandi, sort_order: 1 },
      { name: 'Shower & Keran', slug: 'shower-keran', parent_id: catIds.kamar_mandi, sort_order: 2 },
      { name: 'Wastafel', slug: 'wastafel', parent_id: catIds.kamar_mandi, sort_order: 3 },
      { name: 'Keramik Lantai', slug: 'keramik-lantai', parent_id: catIds.keramik, sort_order: 1 },
      { name: 'Keramik Dinding', slug: 'keramik-dinding', parent_id: catIds.keramik, sort_order: 2 },
      { name: 'Granit', slug: 'granit', parent_id: catIds.keramik, sort_order: 3 },
      { name: 'Lampu LED', slug: 'lampu-led', parent_id: catIds.elektronik, sort_order: 1 },
      { name: 'Saklar & Stop Kontak', slug: 'saklar-stop-kontak', parent_id: catIds.elektronik, sort_order: 2 },
      { name: 'Pipa PVC', slug: 'pipa-pvc', parent_id: catIds.pipa, sort_order: 1 },
      { name: 'Water Heater', slug: 'water-heater', parent_id: catIds.pipa, sort_order: 2 },
      { name: 'Pintu Kayu', slug: 'pintu-kayu', parent_id: catIds.pintu_jendela, sort_order: 1 },
      { name: 'Pintu PVC', slug: 'pintu-pvc', parent_id: catIds.pintu_jendela, sort_order: 2 },
    ].map((c) => ({
      id: uuidv4(),
      description: null,
      image: null,
      is_active: true,
      created_at: now,
      updated_at: now,
      ...c,
    }));

    await queryInterface.bulkInsert('categories', subCategories);

    // ── Brand ─────────────────────────────────────────────────────────────
    const brands = [
      { name: 'Toto', slug: 'toto' },
      { name: 'Bosch', slug: 'bosch' },
      { name: 'Semen Tiga Roda', slug: 'semen-tiga-roda' },
      { name: 'Dulux', slug: 'dulux' },
      { name: 'Ceramax', slug: 'ceramax' },
      { name: 'Tidy', slug: 'tidy' },
      { name: 'Zehn', slug: 'zehn' },
      { name: 'Aquaproof', slug: 'aquaproof' },
      { name: 'Panasonic', slug: 'panasonic' },
      { name: 'Rucika', slug: 'rucika' },
    ].map((b) => ({
      id: uuidv4(),
      description: null,
      logo: null,
      is_active: true,
      created_at: now,
      updated_at: now,
      ...b,
    }));

    await queryInterface.bulkInsert('brands', brands);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('users', null, {});
    await queryInterface.bulkDelete('categories', null, {});
    await queryInterface.bulkDelete('brands', null, {});
  },
};
