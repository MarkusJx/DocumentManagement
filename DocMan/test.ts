import {Action, CustomPersistence, database, EntityManager, PropertyMap, SQLiteProvider} from "./databaseWrapper";
import DatabaseManager = database.DatabaseManager;
import DocumentFilter = database.DocumentFilter;
import FilenameFilter = database.filters.FilenameFilter;

function getRandomInt(max: number): number {
    return Math.floor(Math.random() * Math.floor(max));
}

function generateTagNames(): string[] {
    const res: string[] = [];
    for (let i: number = 0; i < getRandomInt(30); i++) {
        res.push('t' + getRandomInt(10000));
    }

    return res;
}

function generateRandomProperties(): PropertyMap {
    const values: string[] = [];
    for (let i: number = 0; i < getRandomInt(50); i++) {
        values.push('prop' + getRandomInt(1000), 'val' + getRandomInt(1000));
    }

    return PropertyMap.of(...values);
}

describe('Database test', function () {
    let provider: SQLiteProvider = null;
    let em: EntityManager = null;
    let manager: DatabaseManager = null;

    it('should create the SQLiteProvider', async function () {
        provider = await SQLiteProvider.create("database.db", Action.CREATE_DROP, true);
    });

    it('should create the EntityManager', async function () {
        em = await CustomPersistence.createEntityManager("documents", provider);
    });

    it('should create the DatabaseManager', async function () {
        manager = await DatabaseManager.create(em);
    });

    it('should create new Documents', async function () {
        await manager.createDocument("n1", "p/n1",
            PropertyMap.of("p1", "v1", "p2", "v2"),
            new Date(), "t1", "t2");

        for (let i: number = 2; i < 1000; i++) {
            await manager.createDocument("n" + i, "p/n" + i,
                generateRandomProperties(),
                new Date(),
                ...generateTagNames());
        }
    }).timeout(60000);

    let filter: DocumentFilter = null;
    it('should create a DocumentFilter', async function () {
        //let tagFilter = await TagFilter.create("t1", "t2");
        let filename = await FilenameFilter.create("n", false);
        filter = await DocumentFilter.create(filename);
    });

    it('should return one Document', async function () {
        let documents = await manager.getDocumentsBy(filter);
        //assert.strictEqual(documents.length, 1);

        console.log(documents.length);
    }).timeout(10000);
});