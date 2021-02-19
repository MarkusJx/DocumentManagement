import {Action, CustomPersistence, database, PropertyMap, SQLiteProvider} from "./databaseWrapper";

async function main() {
    const provider = await SQLiteProvider.create("database.db", Action.CREATE_DROP, false);
    const em = await CustomPersistence.createEntityManager("documents", provider);
    const manager = await database.DatabaseManager.create(em);

    await manager.createDocument("n1", "p/n1",
        PropertyMap.of("p1", "v1", "p2", "v2"),
        new Date(), "t1", "t2");

    const tagFilter = await database.filters.TagFilter.create("t1", "t2");
    const docs = await manager.getDocumentsBy(await database.DocumentFilter.create(tagFilter));

    console.log(docs);
}

main().then(console.log);