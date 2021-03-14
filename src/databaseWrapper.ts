import java from "java";
import {promisify} from "util";
import * as fs from "fs";

java.classpath.push('dbLib/build/libs/dbLib-1.0-SNAPSHOT.jar');

const Arrays = java.import('java.util.Arrays');

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
    export interface Persistable {
        persist(): Promise<void>;
    }

    export interface JavaConvertible {
        toJavaValue(): any;
    }

    export class PropertyValueSet implements JavaConvertible {
        private static readonly PropertyValueSetImpl = java.import("io.github.markusjx.database.databaseTypes.PropertyValueSet");

        public readonly propertyName: string;
        public readonly propertyValue: string;
        public readonly impl: any;

        public constructor(name: string, value: string, impl?: any) {
            this.propertyName = name;
            this.propertyValue = value;

            if (impl) {
                this.impl = impl;
            } else {
                this.impl = new PropertyValueSet.PropertyValueSetImpl(new Property(name).toJavaValue(), new PropertyValue(value).toJavaValue());
            }
        }

        public toJavaValue(): any {
            return this.impl;
        }
    }

    export class Property implements JavaConvertible {
        private static readonly PropertyImpl = java.import("io.github.markusjx.database.databaseTypes.Property");

        public readonly name: string;
        private readonly impl: any;

        public constructor(name: string, impl?: any) {
            this.name = name;

            if (impl) {
                this.impl = impl;
            } else {
                this.impl = new Property.PropertyImpl(name);
            }
        }

        public toJavaValue(): any {
            return this.impl;
        }
    }

    export class PropertyValue implements JavaConvertible {
        private static readonly PropertyValueImpl = java.import("io.github.markusjx.database.databaseTypes.PropertyValue");

        public readonly value: string;
        private readonly impl: any;

        public constructor(value: string, impl?: any) {
            this.value = value;

            if (impl) {
                this.impl = impl;
            } else {
                this.impl = new PropertyValue.PropertyValueImpl(value);
            }
        }

        toJavaValue(): any {
            return this.impl;
        }
    }

    export class Tag implements JavaConvertible {
        private static readonly Tag_impl: any = java.import("io.github.markusjx.database.databaseTypes.Tag");

        public readonly name: string;

        public constructor(name: string) {
            this.name = name;
        }

        public toJavaValue(): any {
            return new Tag.Tag_impl(this.name);
        }
    }

    export class Document implements Persistable, JavaConvertible {
        public readonly absolutePath: string;
        public readonly parentPath: string;
        public readonly filename: string;
        public readonly exists: boolean;
        private readonly dbManager: DatabaseManager;
        private readonly impl: any;
        private propertyArray: PropertyValueSet[];
        private creationDate: Date;
        private tagArray: Tag[];

        public constructor(filename: string, absolutePath: string, tags: Tag[], properties: PropertyValueSet[],
                           creationDate: Date, baseDir: string, impl: any, dbManager: DatabaseManager, parentPath: string = null) {
            this.filename = filename;
            this.absolutePath = absolutePath;
            this.tagArray = tags;
            this.propertyArray = properties;
            this.creationDate = creationDate;
            this.exists = fs.existsSync(`${baseDir}/${this.absolutePath}`);
            this.dbManager = dbManager;
            this.impl = impl;
            if (parentPath === null) {
                this.parentPath = this.getParentPath();
            } else {
                this.parentPath = parentPath;
            }
        }

        get tags(): Tag[] {
            return this.tagArray;
        }

        async setTags(tags: Tag[]): Promise<void> {
            this.tagArray = tags;
            await this.dbManager.persistTags(this.tagArray);
            await this.persistArray(this.tagArray, this.impl.tags);
        }

        get properties(): PropertyValueSet[] {
            return this.propertyArray;
        }

        async setProperties(properties: PropertyValueSet[]): Promise<void> {
            this.propertyArray = properties.filter(v => v.propertyName != null && v.propertyName.length > 0 &&
                v.propertyValue != null && v.propertyValue.length > 0);

            await this.dbManager.persistPropertyValueSets(this.propertyArray);
            await this.persistArray(this.propertyArray, this.impl.properties);
        }

        static async fromJavaDocument(document: any, baseDir: string, dbManager: DatabaseManager): Promise<Document> {
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
                properties.push(new PropertyValueSet(set.property.name, set.propertyValue.value, set));
            }

            const date: Date = await javaDateToDate(document.creationDate);
            return new Document(filename, absolutePath, tags, properties, date, baseDir, document, dbManager, parentPath);
        }

        public toJavaValue(): any {
            return this.impl;
        }

        public persist(): Promise<void> {
            return this.dbManager.persistDocument(this);
        }

        private async persistArray<T extends JavaConvertible>(toPersist: T[], nativeArray: any): Promise<void> {
            await promisify(nativeArray.clear.bind(nativeArray))();

            const javaValues: any[] = toPersist.map(v => v.toJavaValue());
            const valueList: any = await promisify(Arrays.asList.bind(Arrays))(...javaValues);
            await promisify(nativeArray.addAll.bind(nativeArray))(valueList);

            await this.persist();
        }

        private getParentPath(): string {
            try {
                return this.absolutePath.substring(0, this.absolutePath.length - (this.filename.length + 1));
            } catch (e) {
                return "";
            }
        }
    }

    export class DirectoryImpl {
        public readonly impl: any;
        public readonly path: string;
        public readonly name: string;
        public readonly exists: boolean;

        public constructor(impl: any, baseDir: string) {
            this.impl = impl;
            this.path = impl.path;
            this.name = impl.name;
            this.exists = fs.existsSync(`${baseDir}/${this.path}`);
        }
    }

    export class Directory extends DirectoryImpl {
        public readonly documents: Document[];
        public readonly directories: DirectoryImpl[];

        public constructor(documents: Document[], directories: DirectoryImpl[], impl: any, baseDir: string) {
            super(impl, baseDir);
            this.documents = documents;
            this.directories = directories;
        }

        public static async fromImpl(impl: DirectoryImpl, baseDir: string, dbManager: DatabaseManager): Promise<Directory> {
            return await Directory.fromJavaDirectory(impl.impl, baseDir, dbManager);
        }

        public static async fromJavaDirectory(directory: any, baseDir: string, dbManager: DatabaseManager): Promise<Directory> {
            const jDocs: any = directory.documents;
            const jDirs: any = directory.directories;

            const documents: Document[] = [];
            for (let i: number = 0; i < await getListSize(jDocs); i++) {
                let el: any = await getListElementAt(jDocs, i);
                documents.push(await Document.fromJavaDocument(el, baseDir, dbManager));
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
            public readonly impl: any;

            protected constructor(impl: any) {
                this.impl = impl;
            }
        }

        export class FilenameFilter extends DocumentFilterBase {
            public constructor(impl: any) {
                super(impl);
            }

            public static async create(filename: string, exactMatch: boolean) {
                const impl = await java_newInstance(
                    "io.github.markusjx.database.filter.filters.FilenameFilter",
                    filename, exactMatch);

                return new FilenameFilter(impl);
            }
        }

        export class TagFilter extends DocumentFilterBase {
            public constructor(impl: any) {
                super(impl);
            }

            public static async create(...tags: string[]): Promise<TagFilter> {
                const impl = await java_newInstance(
                    "io.github.markusjx.database.filter.filters.TagFilter",
                    stringToJavaArray(tags));

                return new TagFilter(impl);
            }
        }

        export class PropertyFilter extends DocumentFilterBase {
            public constructor(impl: any) {
                super(impl);
            }

            public static async create(props: PropertyMap): Promise<PropertyFilter> {
                const impl = await java_newInstance(
                    "io.github.markusjx.database.filter.filters.PropertyFilter",
                    (await props.toJavaChainedHashMap()).impl);

                return new PropertyFilter(impl);
            }
        }

        export class DateFilter extends DocumentFilterBase {
            // TODO
        }
    }

    export class DocumentFilter {
        public readonly impl: any;

        public constructor(impl: any) {
            this.impl = impl;
        }

        public static async create(...filters: filters.DocumentFilterBase[]): Promise<DocumentFilter> {
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
        public readonly sourcePath: string;

        public constructor(impl: any) {
            this.sourcePath = impl.sourcePath;
        }
    }

    export class DatabaseManager {
        readonly #impl: any;
        databaseInfo: DatabaseInfo;

        constructor(impl: any) {
            this.#impl = impl;
            this.databaseInfo = null;

            this.setDatabaseInfo().then();
        }

        static async create(entityManager: EntityManager): Promise<DatabaseManager> {
            const impl = await java_newInstance(
                "io.github.markusjx.database.DatabaseManager",
                entityManager.impl);

            return new DatabaseManager(impl);
        }

        async setDatabaseInfo(): Promise<boolean> {
            const info: DatabaseInfo = await this.getDatabaseInfo();
            if (info != null) {
                this.databaseInfo = info;
                return true;
            } else {
                return false;
            }
        }

        async createDocument(filename: string, path: string, properties: PropertyMap, creationDate: Date, ...tagNames: string[]): Promise<void> {
            await java_callMethod(this.#impl, "createDocument", filename, path,
                (await properties.toJavaChainedHashMap()).impl,
                await dateToJavaLocalDate(creationDate),
                stringToJavaArray(tagNames));
        }

        async getDocumentsBy(filter: DocumentFilter): Promise<Document[]> {
            const docList: any = await java_callMethod(this.#impl, "getDocumentsBy", filter.impl);

            const documents: Document[] = [];
            for (let i: number = 0; i < await getListSize(docList); i++) {
                const listEl: any = await getListElementAt(docList, i);
                documents.push(await Document.fromJavaDocument(listEl, this.databaseInfo.sourcePath, this));
            }

            return documents;
        }

        async persistDirectory(directory: DirectoryImpl, sourcePath: string): Promise<boolean> {
            return await java_callMethod(this.#impl, "persistDirectory", directory.impl, sourcePath) &&
                await this.setDatabaseInfo();
        }

        async getDirectory(path: string): Promise<Directory> {
            const impl: any = await java_callMethod(this.#impl, "getDirectory", path);

            if (impl != null) {
                return Directory.fromJavaDirectory(impl, (await this.getDatabaseInfo()).sourcePath, this);
            } else {
                return null;
            }
        }

        async getDatabaseInfo(): Promise<DatabaseInfo> {
            const impl: any = await java_callMethod(this.#impl, "getDatabaseInfo");

            if (impl != null) {
                return new DatabaseInfo(impl);
            } else {
                return null;
            }
        }

        tagExists(name: string): boolean {
            return this.#impl.tagExistsSync(name);
        }

        getTagsLike(name: string): Tag[] {
            const tagList: any = this.#impl.getTagsLikeSync(name);

            const result: Tag[] = [];
            for (let i: number = 0; i < tagList.sizeSync(); i++) {
                result.push(new Tag(tagList.getSync(i).name));
            }

            return result;
        }

        public getPropertiesLike(name: string): Property[] {
            const propertyList: any = this.#impl.getPropertiesLikeSync(name);

            const result: Property[] = [];
            for (let i: number = 0; i < propertyList.sizeSync(); i++) {
                const impl: any = propertyList.getSync(i);
                result.push(new Property(impl.name, impl));
            }

            return result;
        }

        public getPropertyValuesLike(value: string): PropertyValue[] {
            const valueList: any = this.#impl.getPropertyValuesLikeSync(value);

            const result: PropertyValue[] = [];
            for (let i: number = 0; i < valueList.sizeSync(); i++) {
                const impl: any = valueList.getSync(i);
                result.push(new PropertyValue(impl.value, impl));
            }

            return result;
        }

        public async persistTags(tags: Tag[]): Promise<void> {
            const javaTags: any[] = tags.map(t => t.toJavaValue());
            const tagList = await promisify(Arrays.asList.bind(Arrays))(...javaTags);

            await java_callMethod(this.#impl, "persistTags", tagList);
        }

        public async persistPropertyValueSets(propertyValues: PropertyValueSet[]): Promise<void> {
            const javaValues: any[] = propertyValues.map(p => p.toJavaValue());
            const valueList = await promisify(Arrays.asList.bind(Arrays))(...javaValues);

            await java_callMethod(this.#impl, "persistPropertyValueSets", valueList);
        }

        public async persistDocument(document: Document): Promise<void> {
            const javaDocument = document.toJavaValue();
            await java_callMethod(this.#impl, "persistDocument", javaDocument);
        }

        public async close(): Promise<void> {
            await java_callMethod(this.#impl, "close");
        }
    }

    export async function createSQLiteDatabaseManager(databaseFile: string, action: Action, showSQL: boolean = false): Promise<DatabaseManager> {
        const provider = await SQLiteProvider.create(databaseFile, action, showSQL);
        const em = await CustomPersistence.createEntityManager("documents", provider);
        return await database.DatabaseManager.create(em);
    }
}