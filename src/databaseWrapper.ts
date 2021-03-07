import java from "java";
import {promisify} from "util";
import * as fs from "fs";

java.classpath.push('dbLib/build/libs/dbLib-1.0-SNAPSHOT.jar');

export enum Action {
    NONE,
    CREATE_ONLY,
    DROP,
    CREATE,
    CREATE_DROP,
    VALIDATE,
    UPDATE
}

function actionToJavaAction(action: Action): any {
    const _action = java.import("org.hibernate.tool.schema.Action");
    switch (action) {
        case Action.NONE:
            return _action.NONE;
        case Action.CREATE_ONLY:
            return _action.CREATE_ONLY;
        case Action.DROP:
            return _action.DROP;
        case Action.CREATE:
            return _action.DROP;
        case Action.CREATE_DROP:
            return _action.CREATE_DROP;
        case Action.VALIDATE:
            return _action.VALIDATE;
        case Action.UPDATE:
            return _action.UPDATE
        default:
            throw new Error();
    }
}

type java_call_method_t = (instance: any, methodName: string, ...args: any[]) => any;
const java_callMethod: java_call_method_t = promisify(java.callMethod.bind(java));

type java_call_static_method_t = (className: string, methodName: string, ...args: any[]) => any;
const java_callStaticMethod: java_call_static_method_t = promisify(java.callStaticMethod.bind(java));

type java_new_instance_t = (className: string, ...args: any[]) => any;
const java_newInstance: java_new_instance_t = promisify(java.newInstance.bind(java));

async function dateToJavaLocalDate(date: Date): Promise<any> {
    return java_callStaticMethod("java.time.LocalDate", "parse",
        date.toISOString().split('T')[0]);
}

function stringToJavaArray(arr: string[]): any {
    return java.newArray("java.lang.String", arr);
}

async function getListSize(list: any): Promise<any> {
    return new Promise((resolve, reject) => {
        list.size((err: Error, result: any) => {
            if (err) {
                reject(err);
            } else {
                resolve(result);
            }
        });
    });
}

async function getListElementAt(list: any, index: number): Promise<any> {
    return new Promise((resolve, reject) => {
        list.get(index, (err: Error, result: any) => {
            if (err) {
                reject(err);
            } else {
                resolve(result);
            }
        });
    });
}

async function javaDateToDate(date: any): Promise<Date> {
    type date_to_string_t = () => Promise<string>;
    const to_string: date_to_string_t = promisify(date.toString.bind(date));
    return new Date(await to_string());
}

export class PersistenceProvider {
    readonly impl: any;

    constructor(impl: any) {
        this.impl = impl;
    }
}

export class SQLiteProvider extends PersistenceProvider {
    constructor(impl: any) {
        super(impl);
    }

    static async create(databaseFile: string = "", action: Action = Action.CREATE_DROP, showSQL: boolean = true): Promise<SQLiteProvider> {
        const _action = actionToJavaAction(action);
        const arr = java.newArray("java.lang.String", []);
        const impl = await java_newInstance("io.github.markusjx.database.persistence.SQLiteProvider",
            databaseFile, _action, showSQL, arr);

        return new SQLiteProvider(impl);
    }
}

export class EntityManager {
    readonly impl: any;

    constructor(impl: any) {
        this.impl = impl;
    }
}

export class CustomPersistence {
    static async createEntityManager(persistenceUnitName: string, provider: PersistenceProvider): Promise<EntityManager> {
        const impl = await java_callStaticMethod("io.github.markusjx.database.persistence.CustomPersistence",
            "createEntityManagerFactory", persistenceUnitName, provider.impl);

        const em = await java_callMethod(impl, "createEntityManager");
        return new EntityManager(em);
    }
}

export class JavaChainedHashMap {
    readonly impl: any;

    constructor(impl: any) {
        this.impl = impl;
    }
}

export class PropertyMap {
    readonly values: Array<{ key: string, value: string }>;

    constructor() {
        this.values = [];
    }

    static of(...values: string[]): PropertyMap {
        if (values.length % 2 !== 0) {
            throw new Error("values.length must be a multiple of two");
        }

        const res = new PropertyMap();
        for (let i: number = 0; i < values.length; i += 2) {
            res.values.push({
                key: values[i],
                value: values[i + 1]
            });
        }

        return res;
    }

    async toJavaChainedHashMap(): Promise<JavaChainedHashMap> {
        const arr: string[] = [];
        for (let i: number = 0; i < this.values.length; i++) {
            arr.push(this.values[i].key, this.values[i].value);
        }

        const impl = await java_callStaticMethod("io.github.markusjx.datatypes.ChainedHashMap",
            "fromStringArray", java.newArray("java.lang.String", arr));

        return new JavaChainedHashMap(impl);
    }
}

export class FileScanner {
    readonly #impl: any;
    readonly source: string;

    constructor(source: string) {
        this.#impl = java.newInstanceSync("io.github.markusjx.scanning.FileScanner", source);
        this.source = source;
    }

    async scan(): Promise<database.DirectoryImpl> {
        const dir: any = await java_callMethod(this.#impl, "scan");
        return new database.DirectoryImpl(dir, this.source);
    }
}

export namespace database {
    export class PropertyValueSet {
        readonly propertyName: string;
        readonly propertyValue: string;

        constructor(name: string, value: string) {
            this.propertyName = name;
            this.propertyValue = value;
        }
    }

    export class Tag {
        readonly name: string;

        constructor(name: string) {
            this.name = name;
        }
    }

    export class Document {
        readonly filename: string;
        readonly absolutePath: string;
        readonly parentPath: string;
        readonly tags: Tag[];
        readonly properties: PropertyValueSet[];
        readonly creationDate: Date;
        readonly exists: boolean;

        constructor(filename: string, absolutePath: string, tags: Tag[], properties: PropertyValueSet[], creationDate: Date, baseDir: string, parentPath: string = null) {
            this.filename = filename;
            this.absolutePath = absolutePath;
            this.tags = tags;
            this.properties = properties;
            this.creationDate = creationDate;
            this.exists = fs.existsSync(`${baseDir}/${this.absolutePath}`);
            if (parentPath === null) {
                this.parentPath = this.getParentPath();
            } else {
                this.parentPath = parentPath;
            }
        }

        static async fromJavaDocument(document: any, baseDir: string): Promise<Document> {
            const filename: string = document.filename;
            const absolutePath: string = document.absolutePath;
            const parentPath: string = document.parentPath;

            const jTags: any = document.tags;
            const tags: Tag[] = [];
            for (let i: number = 0; i < await getListSize(jTags); i++) {
                tags.push(new Tag((await getListElementAt(jTags, i)).name));
            }

            const jProperties: any = document.properties;
            const properties: PropertyValueSet[] = [];
            for (let i: number = 0; i < await getListSize(jProperties); i++) {
                let set: any = await getListElementAt(jProperties, i);
                properties.push(new PropertyValueSet(set.property.name, set.propertyValue.value));
            }

            const date: Date = await javaDateToDate(document.creationDate);
            return new Document(filename, absolutePath, tags, properties, date, baseDir, parentPath);
        }

        getParentPath(): string {
            try {
                return this.absolutePath.substring(0, this.absolutePath.length - (this.filename.length + 1));
            } catch (e) {
                return "";
            }
        }
    }

    export class DirectoryImpl {
        readonly impl: any;
        readonly path: string;
        readonly name: string;
        readonly exists: boolean;

        constructor(impl: any, baseDir: string) {
            this.impl = impl;
            this.path = impl.path;
            this.name = impl.name;
            this.exists = fs.existsSync(`${baseDir}/${this.path}`);
        }
    }

    export class Directory extends DirectoryImpl {
        readonly documents: Document[];
        readonly directories: DirectoryImpl[];

        constructor(documents: Document[], directories: DirectoryImpl[], impl: any, baseDir: string) {
            super(impl, baseDir);
            this.documents = documents;
            this.directories = directories;
        }

        static async fromImpl(impl: DirectoryImpl, baseDir: string): Promise<Directory> {
            return await Directory.fromJavaDirectory(impl.impl, baseDir);
        }

        static async fromJavaDirectory(directory: any, baseDir: string): Promise<Directory> {
            const jDocs: any = directory.documents;
            const jDirs: any = directory.directories;

            const documents: Document[] = [];
            for (let i: number = 0; i < await getListSize(jDocs); i++) {
                let el: any = await getListElementAt(jDocs, i);
                documents.push(await Document.fromJavaDocument(el, baseDir));
            }

            const directories: DirectoryImpl[] = [];
            for (let i: number = 0; i < await getListSize(jDirs); i++) {
                let el: any = await getListElementAt(jDirs, i);
                directories.push(new DirectoryImpl(el, baseDir));
            }

            return new Directory(documents, directories, directory, baseDir);
        }
    }

    export namespace filters {
        export class DocumentFilterBase {
            readonly impl: any;

            constructor(impl: any) {
                this.impl = impl;
            }
        }

        export class FilenameFilter extends DocumentFilterBase {
            constructor(impl: any) {
                super(impl);
            }

            static async create(filename: string, exactMatch: boolean) {
                const impl = await java_newInstance(
                    "io.github.markusjx.database.filter.filters.FilenameFilter",
                    filename, exactMatch);

                return new FilenameFilter(impl);
            }
        }

        export class TagFilter extends DocumentFilterBase {
            constructor(impl: any) {
                super(impl);
            }

            static async create(...tags: string[]): Promise<TagFilter> {
                const impl = await java_newInstance(
                    "io.github.markusjx.database.filter.filters.TagFilter",
                    stringToJavaArray(tags));

                return new TagFilter(impl);
            }
        }

        export class PropertyFilter extends DocumentFilterBase {
            constructor(impl: any) {
                super(impl);
            }

            static async create(props: PropertyMap): Promise<PropertyFilter> {
                const impl = await java_newInstance(
                    "io.github.markusjx.database.filter.filters.PropertyFilter",
                    (await props.toJavaChainedHashMap()).impl);

                return new PropertyFilter(impl);
            }
        }

        export class DateFilter extends DocumentFilterBase {

        }
    }

    export class DocumentFilter {
        readonly impl: any;

        constructor(impl: any) {
            this.impl = impl;
        }

        static async create(...filters: filters.DocumentFilterBase[]): Promise<DocumentFilter> {
            const filterImpls = [];
            for (let i = 0; i < filters.length; i++) {
                filterImpls.push(filters[i].impl);
            }

            const impl = await java_callStaticMethod("io.github.markusjx.database.filter.DocumentFilter",
                "createFilter", java.newArray("io.github.markusjx.database.filter.DocumentFilterBase",
                    filterImpls));

            return new DocumentFilter(impl);
        }
    }

    export class DatabaseInfo {
        readonly sourcePath: string;

        constructor(impl: any) {
            this.sourcePath = impl.sourcePath;
        }
    }

    export class DatabaseManager {
        readonly #impl: any;
        databaseInfo: DatabaseInfo;

        constructor(impl: any) {
            this.#impl = impl;
            this.databaseInfo = null;

            this.setDatabaseInfo();
        }

        static async create(entityManager: EntityManager): Promise<DatabaseManager> {
            const impl = await java_newInstance(
                "io.github.markusjx.database.DatabaseManager",
                entityManager.impl);

            return new DatabaseManager(impl);
        }

        async setDatabaseInfo(): Promise<boolean> {
            const info = await this.getDatabaseInfo();
            if (info != null) {
                this.databaseInfo = info;
                return true;
            } else {
                return false;
            }
        }

        createTag(name: string): void {
            java.callMethodSync(this.#impl, "createTag", name);
        }

        async createDocument(filename: string, path: string, properties: PropertyMap, creationDate: Date, ...tagNames: string[]): Promise<void> {
            await java_callMethod(this.#impl, "createDocument", filename, path,
                (await properties.toJavaChainedHashMap()).impl,
                await dateToJavaLocalDate(creationDate),
                stringToJavaArray(tagNames));
        }

        async getDocumentsBy(filter: DocumentFilter): Promise<Document[]> {
            const docList = await java_callMethod(this.#impl, "getDocumentsBy", filter.impl);

            const documents: Document[] = [];
            for (let i: number = 0; i < await getListSize(docList); i++) {
                const listEl: any = await getListElementAt(docList, i);
                documents.push(await Document.fromJavaDocument(listEl, this.databaseInfo.sourcePath));
            }

            return documents;
        }

        async persistDirectory(directory: DirectoryImpl, sourcePath: string): Promise<boolean> {
            return await java_callMethod(this.#impl, "persistDirectory", directory.impl, sourcePath) &&
                await this.setDatabaseInfo();
        }

        async getDirectory(path: string): Promise<Directory> {
            const impl = await java_callMethod(this.#impl, "getDirectory", path);

            if (impl != null) {
                return Directory.fromJavaDirectory(impl, this.databaseInfo.sourcePath);
            } else {
                return null;
            }
        }

        async getDatabaseInfo(): Promise<DatabaseInfo> {
            return new DatabaseInfo(await java_callMethod(this.#impl, "getDatabaseInfo"));
        }
    }

    export async function createSQLiteDatabaseManager(databaseFile: string, action: Action, showSQL: boolean = false): Promise<DatabaseManager> {
        const provider = await SQLiteProvider.create(databaseFile, action, showSQL);
        const em = await CustomPersistence.createEntityManager("documents", provider);
        return await database.DatabaseManager.create(em);
    }
}