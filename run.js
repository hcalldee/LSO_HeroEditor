const fs = require("fs");
const path = require("path");
const readline = require("readline");
const Database = require("better-sqlite3");


// ======================================================
// APPLICATION DIRECTORY
// ======================================================
//
// Saat development:
//   node run.js
//   → gunakan folder run.js
//
// Saat sudah menjadi EXE:
//   HeroEditor.exe
//   → gunakan folder HeroEditor.exe
//

const APP_DIR = process.pkg
    ? path.dirname(process.execPath)
    : __dirname;


// ======================================================
// CONFIG
// ======================================================

const CONFIG_PATH = path.join(
    APP_DIR,
    "config.json"
);


if (!fs.existsSync(CONFIG_PATH)) {

    const defaultConfig = {
        database: "./offline_save.db",
        user_id: "GMZhaepID",
        backup: true,
        hero_cache: "./hero_cache.json"
    };

    fs.writeFileSync(
        CONFIG_PATH,
        JSON.stringify(defaultConfig, null, 4),
        "utf8"
    );

    console.log(
        "config.json dibuat:"
    );

    console.log(
        CONFIG_PATH
    );

    console.log(
        "\nSilakan edit config.json lalu jalankan kembali."
    );

    process.exit(0);
}


let config;

try {

    config = JSON.parse(
        fs.readFileSync(
            CONFIG_PATH,
            "utf8"
        )
    );

} catch (err) {

    console.error(
        "✗ config.json tidak valid."
    );

    console.error(
        err.message
    );

    process.exit(1);
}


// ======================================================
// CONFIG VALUES
// ======================================================

const DB_PATH = path.resolve(
    APP_DIR,
    config.database || "./offline_save.db"
);

const USER_ID = String(
    config.user_id || ""
);

const HERO_CACHE_PATH = path.resolve(
    APP_DIR,
    config.hero_cache || "./hero_cache.json"
);

const HERO_BASE_URL = "https://lostsaga.xyz/hero";


// ======================================================
// VALIDATION
// ======================================================

if (!USER_ID) {

    console.error(
        "✗ user_id belum diisi di config.json"
    );

    process.exit(1);
}


if (!fs.existsSync(DB_PATH)) {

    console.error(
        "✗ Database tidak ditemukan:"
    );

    console.error(
        DB_PATH
    );

    process.exit(1);
}


// ======================================================
// DATABASE
// ======================================================

console.log(
    "CONFIG:"
);

console.log(
    config
);

console.log(
    "\nDATABASE:"
);

console.log(
    DB_PATH
);

console.log(
    "\nUSER:"
);

console.log(
    USER_ID
);


const db = new Database(
    DB_PATH
);


// ======================================================
// READLINE
// ======================================================

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// ======================================================
// BASIC UTILITIES
// ======================================================

function ask(question) {
    return new Promise(resolve => {
        rl.question(question, answer => {
            resolve(answer.trim());
        });
    });
}

function clear() {
    console.clear();
}

function pause() {
    return ask("\nTekan ENTER untuk lanjut...");
}


// ======================================================
// HERO DATABASE
// ======================================================

function loadHeroCache() {
    try {
        if (!fs.existsSync(HERO_CACHE_PATH)) {
            return {};
        }

        const data = fs.readFileSync(
            HERO_CACHE_PATH,
            "utf8"
        );

        return JSON.parse(data);

    } catch (err) {
        console.log(
            "\n⚠ Gagal membaca hero_cache.json."
        );

        console.log(err.message);

        return {};
    }
}

function saveHeroCache(cache) {
    try {
        fs.writeFileSync(
            HERO_CACHE_PATH,
            JSON.stringify(cache, null, 4),
            "utf8"
        );

        return true;

    } catch (err) {
        console.log(
            "\n⚠ Gagal menyimpan hero_cache.json."
        );

        console.log(err.message);

        return false;
    }
}


// ======================================================
// FETCH HERO NAME
// ======================================================

async function fetchHeroName(charIndex) {

    const url = `${HERO_BASE_URL}/${charIndex}`;

    try {

        const response = await fetch(url);

        if (!response.ok) {
            return null;
        }

        const html = await response.text();

        /*
         * Struktur halaman LostSagaXYZ saat ini:
         *
         * <title>Gunner - LostsagaXYZ</title>
         *
         * Kita mengambil nama dari title.
         */

        const titleMatch = html.match(
            /<title>\s*(.*?)\s*-\s*LostsagaXYZ\s*<\/title>/i
        );

        if (titleMatch) {
            return decodeHtmlEntities(
                titleMatch[1].trim()
            );
        }

        /*
         * Fallback:
         * Cari heading # Hero
         */

        const headingMatch = html.match(
            /<h1[^>]*>\s*(.*?)\s*<\/h1>/i
        );

        if (headingMatch) {
            return decodeHtmlEntities(
                stripHtml(headingMatch[1]).trim()
            );
        }

        return null;

    } catch (err) {

        console.log(
            `\n⚠ Gagal mengambil Hero #${charIndex}`
        );

        console.log(err.message);

        return null;
    }
}

function stripHtml(text) {
    return text.replace(/<[^>]*>/g, "");
}

function decodeHtmlEntities(text) {
    return text
        .replace(/&amp;/g, "&")
        .replace(/&#39;/g, "'")
        .replace(/&quot;/g, '"')
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">");
}


// ======================================================
// HERO NAME
// ======================================================

function heroName(hero) {

    const cache = loadHeroCache();

    const id = String(hero.char_index);

    if (cache[id]) {
        return cache[id];
    }

    return `Hero #${hero.char_index}`;
}


// ======================================================
// UPDATE HERO CACHE
// ======================================================

async function updateHeroNames() {

    clear();

    console.log("╔══════════════════════════════════════════╗");
    console.log("║          UPDATE NAMA HERO                ║");
    console.log("╚══════════════════════════════════════════╝\n");

    const heroes = getHeroes();

    if (heroes.length === 0) {
        console.log("Tidak ada Hero.");
        await pause();
        return;
    }

    const cache = loadHeroCache();

    const uniqueIds = [
        ...new Set(
            heroes.map(hero =>
                String(hero.char_index)
            )
        )
    ];

    console.log(
        `Hero yang ditemukan : ${uniqueIds.length}`
    );

    console.log(
        "Sumber              : lostsaga.xyz"
    );

    console.log("\nMengambil nama Hero...\n");

    let updated = 0;
    let failed = 0;

    for (const id of uniqueIds) {

        if (cache[id]) {

            console.log(
                `✓ #${id} → ${cache[id]} (cache)`
            );

            continue;
        }

        process.stdout.write(
            `→ Mengambil #${id} ... `
        );

        const name = await fetchHeroName(id);

        if (name) {

            cache[id] = name;

            console.log(name);

            updated++;

        } else {

            console.log("GAGAL");

            failed++;
        }

        /*
         * Sedikit delay supaya tidak melakukan
         * request terlalu cepat.
         */
        await new Promise(resolve =>
            setTimeout(resolve, 300)
        );
    }

    saveHeroCache(cache);

    console.log("\n──────────────────────────────────────────");

    console.log(
        `✓ Nama baru      : ${updated}`
    );

    console.log(
        `✓ Dari cache     : ${uniqueIds.length - updated - failed}`
    );

    console.log(
        `✗ Gagal          : ${failed}`
    );

    console.log(
        `✓ Cache          : ${HERO_CACHE_PATH}`
    );

    await pause();
}


// ======================================================
// GET HEROES
// ======================================================

function getHeroes() {

    return db.prepare(`
        SELECT
            slot_index,
            char_index,
            level,
            exp
        FROM characters
        WHERE user_id = ?
        ORDER BY slot_index
    `).all(USER_ID);
}


// ======================================================
// SHOW HEROES
// ======================================================

function showHeroes(heroes) {

    console.log(
        "┌─────┬────────────────────┬───────┬───────┬──────┐"
    );

    console.log(
        "│ No  │ Hero               │ Level │ EXP   │ Slot │"
    );

    console.log(
        "├─────┼────────────────────┼───────┼───────┼──────┤"
    );

    heroes.forEach((hero, i) => {

        const name = heroName(hero)
            .substring(0, 18)
            .padEnd(18);

        console.log(
            `│ ${String(i + 1).padStart(3)} │ ${name} │ ` +
            `${String(hero.level).padStart(5)} │ ` +
            `${String(hero.exp).padStart(5)} │ ` +
            `${String(hero.slot_index).padStart(4)} │`
        );
    });

    console.log(
        "└─────┴────────────────────┴───────┴───────┴──────┘"
    );
}


// ======================================================
// BACKUP
// ======================================================

function createBackup() {

    const timestamp = new Date()
        .toISOString()
        .replace(/[:.]/g, "-");

    const backupDir = path.join(
        path.dirname(DB_PATH),
        "backup"
    );

    if (!fs.existsSync(backupDir)) {

        fs.mkdirSync(
            backupDir,
            {
                recursive: true
            }
        );
    }

    const backupBase = path.join(
        backupDir,
        `offline_save_${timestamp}`
    );

    const files = [
        {
            source: DB_PATH,
            suffix: ".db"
        },
        {
            source: `${DB_PATH}-wal`,
            suffix: ".db-wal"
        },
        {
            source: `${DB_PATH}-shm`,
            suffix: ".db-shm"
        }
    ];

    for (const file of files) {

        if (fs.existsSync(file.source)) {

            fs.copyFileSync(
                file.source,
                `${backupBase}${file.suffix}`
            );
        }
    }

    return backupBase;
}


// ======================================================
// EDIT HERO LEVEL
// ======================================================

async function editHero() {

    const heroes = getHeroes();

    clear();

    console.log("=== EDIT HERO ===\n");

    if (heroes.length === 0) {

        console.log("Tidak ada Hero.");

        await pause();

        return;
    }

    showHeroes(heroes);

    const input = await ask(
        "\nPilih nomor Hero (0 = batal): "
    );

    if (input === "0") {
        return;
    }

    const index = Number(input) - 1;

    if (
        !Number.isInteger(index) ||
        index < 0 ||
        index >= heroes.length
    ) {

        console.log(
            "Pilihan tidak valid."
        );

        await pause();

        return;
    }

    const hero = heroes[index];

    console.log(
        `\nHero           : ${heroName(hero)}`
    );

    console.log(
        `Slot           : ${hero.slot_index}`
    );

    console.log(
        `Hero ID        : ${hero.char_index}`
    );

    console.log(
        `Level sekarang : ${hero.level}`
    );

    const levelInput = await ask(
        "Level baru (1-100, 0 = batal): "
    );

    if (levelInput === "0") {
        return;
    }

    const level = Number(levelInput);

    if (
        !Number.isInteger(level) ||
        level < 1 ||
        level > 100
    ) {

        console.log(
            "Level harus antara 1-100."
        );

        await pause();

        return;
    }

    /*
     * Untuk sementara:
     *
     * Level 100 = EXP 4500
     * Level lain = EXP 0
     *
     * Nanti bisa kita buat tabel EXP sebenarnya.
     */

    const exp = level === 100
        ? 4500
        : 0;

    const confirm = await ask(
        `\n${heroName(hero)} → Level ${level}. ` +
        `Lanjut? (y/n): `
    );

    if (confirm.toLowerCase() !== "y") {

        console.log(
            "Dibatalkan."
        );

        await pause();

        return;
    }

    try {

        const backup = createBackup();

        const result = db.prepare(`
            UPDATE characters
            SET
                level = ?,
                exp = ?
            WHERE
                user_id = ?
                AND slot_index = ?
        `).run(
            level,
            exp,
            USER_ID,
            hero.slot_index
        );

        if (result.changes === 1) {

            console.log(
                `\n✓ Backup dibuat:`
            );

            console.log(
                `  ${backup}`
            );

            console.log(
                `\n✓ ${heroName(hero)} berhasil diubah`
            );

            console.log(
                `  Level : ${level}`
            );

            console.log(
                `  EXP   : ${exp}`
            );

        } else {

            console.log(
                "\n✗ Hero tidak ditemukan."
            );
        }

    } catch (err) {

        console.log(
            "\n✗ Gagal mengubah Hero."
        );

        console.log(
            err.message
        );
    }

    await pause();
}


// ======================================================
// SET ALL HEROES
// ======================================================

async function setAll() {

    clear();

    console.log("=== SET SEMUA HERO ===\n");

    const heroes = getHeroes();

    if (heroes.length === 0) {

        console.log(
            "Tidak ada Hero."
        );

        await pause();

        return;
    }

    showHeroes(heroes);

    const levelInput = await ask(
        "\nMasukkan level untuk semua Hero " +
        "(1-100, 0 = batal): "
    );

    if (levelInput === "0") {
        return;
    }

    const level = Number(levelInput);

    if (
        !Number.isInteger(level) ||
        level < 1 ||
        level > 100
    ) {

        console.log(
            "Level harus antara 1-100."
        );

        await pause();

        return;
    }

    const confirm = await ask(
        `\nSemua ${heroes.length} Hero akan ` +
        `menjadi Level ${level}. Lanjut? (y/n): `
    );

    if (confirm.toLowerCase() !== "y") {

        console.log(
            "Dibatalkan."
        );

        await pause();

        return;
    }

    try {

        const backup = createBackup();

        const exp = level === 100
            ? 4500
            : 0;

        const result = db.prepare(`
            UPDATE characters
            SET
                level = ?,
                exp = ?
            WHERE user_id = ?
        `).run(
            level,
            exp,
            USER_ID
        );

        console.log(
            `\n✓ Backup dibuat:`
        );

        console.log(
            `  ${backup}`
        );

        console.log(
            `\n✓ ${result.changes} Hero berhasil diubah.`
        );

    } catch (err) {

        console.log(
            "\n✗ Gagal mengubah Hero."
        );

        console.log(
            err.message
        );
    }

    await pause();
}


// ======================================================
// DELETE HERO
// ======================================================

async function deleteHero() {

    clear();

    console.log(
        "╔══════════════════════════════════════════╗"
    );

    console.log(
        "║              DELETE HERO                 ║"
    );

    console.log(
        "╚══════════════════════════════════════════╝\n"
    );

    const heroes = getHeroes();

    if (heroes.length === 0) {

        console.log(
            "Tidak ada Hero yang bisa dihapus."
        );

        await pause();

        return;
    }

    showHeroes(heroes);

    const input = await ask(
        "\nPilih nomor Hero yang ingin dihapus " +
        "(0 = batal): "
    );

    if (input === "0") {
        return;
    }

    const index = Number(input) - 1;

    if (
        !Number.isInteger(index) ||
        index < 0 ||
        index >= heroes.length
    ) {

        console.log(
            "Pilihan tidak valid."
        );

        await pause();

        return;
    }

    const hero = heroes[index];

    clear();

    console.log(
        "╔══════════════════════════════════════════╗"
    );

    console.log(
        "║          KONFIRMASI HAPUS HERO           ║"
    );

    console.log(
        "╚══════════════════════════════════════════╝\n"
    );

    console.log(
        `Nama       : ${heroName(hero)}`
    );

    console.log(
        `Slot       : ${hero.slot_index}`
    );

    console.log(
        `Hero ID    : ${hero.char_index}`
    );

    console.log(
        `Level      : ${hero.level}`
    );

    console.log(
        `EXP        : ${hero.exp}`
    );

    console.log(
        "\n──────────────────────────────────────────"
    );

    console.log(
        "PERINGATAN:"
    );

    console.log(
        "Hero ini akan dihapus dari database."
    );

    console.log(
        "──────────────────────────────────────────"
    );

    const confirm = await ask(
        '\nKetik "DELETE" untuk melanjutkan: '
    );

    if (confirm !== "DELETE") {

        console.log(
            "\n✓ Penghapusan dibatalkan."
        );

        await pause();

        return;
    }

    try {

        const backup = createBackup();

        /*
         * characters memiliki PRIMARY KEY:
         *
         * user_id + slot_index
         *
         * Jadi delete menggunakan kedua field
         * tersebut.
         */

        const result = db.prepare(`
            DELETE FROM characters
            WHERE
                user_id = ?
                AND slot_index = ?
        `).run(
            USER_ID,
            hero.slot_index
        );

        if (result.changes === 1) {

            console.log(
                "\n✓ Backup dibuat:"
            );

            console.log(
                `  ${backup}`
            );

            console.log(
                `\n✓ ${heroName(hero)} berhasil dihapus.`
            );

            console.log(
                `✓ Slot ${hero.slot_index} sekarang kosong.`
            );

        } else {

            console.log(
                "\n✗ Hero tidak ditemukan di database."
            );
        }

    } catch (err) {

        console.log(
            "\n✗ Gagal menghapus Hero."
        );

        console.log(
            err.message
        );
    }

    await pause();
}


// ======================================================
// PREVIEW
// ======================================================

async function preview() {

    clear();

    console.log(
        "=== HERO SAAT INI ===\n"
    );

    const heroes = getHeroes();

    if (heroes.length === 0) {

        console.log(
            "Tidak ada Hero."
        );

    } else {

        showHeroes(heroes);
    }

    await pause();
}


// ======================================================
// MAIN MENU
// ======================================================

async function mainMenu() {

    while (true) {

        clear();

        const heroes = getHeroes();

        console.log(`
╔══════════════════════════════════════════╗
║          LOST SAGA HERO EDITOR           ║
╠══════════════════════════════════════════╣
║ Account : ${USER_ID.padEnd(29)}║
║ Heroes  : ${String(heroes.length).padEnd(29)}║
╚══════════════════════════════════════════╝

  1. Lihat Hero
  2. Edit Level Hero
  3. Set Semua Hero
  4. Hapus Hero
  5. Update Nama Hero
  6. Refresh Database
  0. Keluar
`);

        const choice = await ask(
            "Pilih menu: "
        );

        switch (choice) {

            case "1":

                await preview();

                break;


            case "2":

                await editHero();

                break;


            case "3":

                await setAll();

                break;


            case "4":

                await deleteHero();

                break;


            case "5":

                await updateHeroNames();

                break;


            case "6":

                console.log(
                    "\n✓ Database di-refresh."
                );

                await pause();

                break;


            case "0":

                db.close();

                rl.close();

                console.log(
                    "\nKeluar."
                );

                return;


            default:

                console.log(
                    "\n✗ Pilihan tidak valid."
                );

                await pause();
        }
    }
}


// ======================================================
// START
// ======================================================

mainMenu();

process.on("uncaughtException", (err) => {
    console.error("\n=================================");
    console.error("ERROR");
    console.error("=================================");
    console.error(err.stack || err);

    rl.question("\nTekan ENTER untuk keluar...", () => {
        process.exit(1);
    });
});

process.on("unhandledRejection", (err) => {
    console.error("\n=================================");
    console.error("UNHANDLED ERROR");
    console.error("=================================");
    console.error(err);

    rl.question("\nTekan ENTER untuk keluar...", () => {
        process.exit(1);
    });
});