import * as db from "./databaseWrapper";

async function main() {
    let provider = await db.SQLiteProvider.create("database.db", db.Action.CREATE_DROP, false);
    let entityManager = await db.CustomPersistence.createEntityManager("documents", provider);
    let dbManager = await db.database.DatabaseManager.create(entityManager);

    console.log(dbManager);
}

main().then(() => console.log("main finished"));