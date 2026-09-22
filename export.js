const fs = require("fs");
const Database = require("better-sqlite3");

const DB_PATH = "./offline_save.db";
const USER_ID = "kpopdewapID";
const OUTPUT = "./heroes.json";

const db = new Database(DB_PATH, { readonly: true });

const heroes = db.prepare(`
    SELECT
        slot_index,
        char_index,
        level,
        exp
    FROM characters
    WHERE user_id = ?
    ORDER BY slot_index
`).all(USER_ID);

db.close();

fs.writeFileSync(
    OUTPUT,
    JSON.stringify(
        {
            user_id: USER_ID,
            heroes
        },
        null,
        2
    )
);

console.log(`Berhasil export ${heroes.length} Hero ke ${OUTPUT}`);