import java, {java_instance_proxy, JavaClass} from "@markusjx/java";
import * as fs from "fs";
import path from "path";
import {getLogger} from "log4js";
import constants from "./util/constants";
import javaTypes from "./javaTypes";
import {createStore} from "../shared/Settings";
import {
    DatabaseInfoProxy,
    DatabaseManagerProxy,
    DateFilterProxy,
    DirectoryProxy,
    DocumentFilterProxy,
    DocumentProxy,
    FilenameFilterProxy,
    FileScannerProxy,
    JavaChainedHashMapProxy,
    LocalDateProxy,
    LoggerProxy,
    PersistenceProvider,
    PropertyFilterProxy,
    PropertyProxy,
    PropertyValueProxy,
    PropertyValueSetProxy,
    SQLiteProviderClass,
    TagFilterProxy,
    TagProxy
} from "./databaseTypes";


const JAR_NAME = 'dbLib-1.0-SNAPSHOT.jar';
const logger = getLogger();

const store = createStore();
java.ensureJVM(store.get('jvmPath'));

logger.info("Loading the java library");
if (fs.existsSync(path.join(__dirname, '..', '..', 'dbLib', 'build', 'libs', JAR_NAME))) {
    java.classpath.append(path.join(__dirname, '..', '..', 'dbLib', 'build', 'libs', JAR_NAME));
} else {
    java.classpath.append(path.join(__dirname, '..', '..', '..', 'dbLib', 'build', 'libs', JAR_NAME));
}

export class Arrays extends java.importClass<typeof javaTypes.Arrays>('java.util.Arrays') {
}

java.logging.setLogLevel(3);

/**
 * The hibernate creation action.
 * The following information is from the
 * org.hibernate.tool.schema.Action.java file.
 */
export class Action extends java.importClass("org.hibernate.tool.schema.Action") {
    // No action will be performed
    public static readonly NONE: Action;
    // Database creation will be generated
    public static readonly CREATE_ONLY: Action;
    // Database dropping will be generated
    public static readonly DROP: Action;
    // Database dropping will be generated followed by database creation
    public static readonly CREATE: Action;
    // Drop the schema and recreate it on SessionFactory startup.
    // Additionally, drop the schema on SessionFactory shutdown.
    public static readonly CREATE_DROP: Action;
    // Validate the database schema
    public static readonly VALIDATE: Action;
    // Update (alter) the database schema
    public static readonly UPDATE: Action;
}

class LocalDate extends java.importClass<typeof LocalDateProxy>('java.time.LocalDate') {
    /**
     * Convert a {@link Date} to a java.time.LocalDate
     *
     * @param date the date to convert
     * @return the java.time.LocalDate
     */
    public static dateToJavaLocalDate(date: Date): LocalDateProxy {
        return LocalDate.parseSync(date.toISOString().split('T')[0]);
    }

    public static toJSDate(date: LocalDateProxy): Date {
        return new Date(date.toStringSync());
    }
}

export class Logger extends java.importClass<typeof LoggerProxy>("io.github.markusjx.util.Logging") {
}

const MANAGED_CLASSES = [
    "io.github.markusjx.database.DatabaseInfo", "io.github.markusjx.database.types.Directory",
    "io.github.markusjx.database.types.Document", "io.github.markusjx.database.types.Property",
    "io.github.markusjx.database.types.PropertyValue", "io.github.markusjx.database.types.Tag"
];

const SQLITE_PROVIDER = "io.github.markusjx.database.persistence.SQLiteProvider";

export class SQLiteProvider extends java.importClass<typeof SQLiteProviderClass>(SQLITE_PROVIDER) {
}

/**
 * A MySQL persistence provider
 */
export declare class MySQLProvider extends PersistenceProvider {
    /**
     * Create a new persistence provider instance
     *
     * @param url the url of the database
     * @param user the username to use
     * @param password the password to use
     * @param action the sql action
     * @param showSQL whether to show the generated sql commands
     * @param classNames the names of the classes. Should be empty.
     * @return the created persistence provider
     */
    public static createInstance(url: string, user: string, password: string, action: Action, showSQL: boolean, classNames: string[]): Promise<MySQLProvider>;
}

/**
 * A MariaDB persistence provider
 */
export declare class MariaDBProvider extends PersistenceProvider {
    /**
     * Create a new persistence provider instance
     *
     * @param url the url of the database
     * @param user the username to use
     * @param password the password to use
     * @param action the sql action
     * @param showSQL whether to show the generated sql commands
     * @param classNames the names of the classes. Should be empty.
     * @return the created persistence provider
     */
    public static createInstance(url: string, user: string, password: string, action: Action, showSQL: boolean, classNames: string[]): Promise<MySQLProvider>;
}

/**
 * An entity manager
 */
export declare abstract class EntityManager extends java_instance_proxy {
}

declare abstract class EntityManagerFactory extends java_instance_proxy {
    public static createEntityManager(): Promise<EntityManager>;
}

declare class CustomPersistenceClass extends EntityManager {
    public static createEntityManagerFactory(persistenceUnitName: string, provider: PersistenceProvider): Promise<typeof EntityManagerFactory>;
}

/**
 * A custom hibernate persistence provider
 */
export class CustomPersistence {
    private static instance = java.importClass("io.github.markusjx.database.persistence.CustomPersistence") as typeof CustomPersistenceClass;

    /**
     * Create an entity manager
     *
     * @param persistenceUnitName the persistence unit name
     * @param provider the persistence provider
     * @return the created entity manager
     */
    public static async createEntityManager(persistenceUnitName: string, provider: PersistenceProvider): Promise<EntityManager> {
        const factory = await CustomPersistence.instance.createEntityManagerFactory(persistenceUnitName, provider);
        return factory.createEntityManager();
    }
}

export class JavaChainedHashMap extends java.importClass<typeof JavaChainedHashMapProxy>("io.github.markusjx.datatypes.ChainedHashMap") {
}

/**
 * A property map for storing {@link database.Property}s
 */
export class PropertyMap {
    /**
     * The key value array
     */
    public readonly values: Array<{ key: string, value: string }>;

    /**
     * Create a property map
     */
    public constructor() {
        this.values = [];
    }

    /**
     * Create a PropertyMap of an array of strings.
     * The number of elements must be an odd number,
     * with even indexes being keys and uneven ones being values.
     * So values[0] is a key and values[1] is a value.
     *
     * @param values the value array
     * @return the generated property map
     */
    public static of(...values: string[]): PropertyMap {
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

    /**
     * Convert this property map to a java {@link JavaChainedHashMap}
     *
     * @return the {@link JavaChainedHashMap}
     */
    public toJavaChainedHashMap(): Promise<JavaChainedHashMapProxy> {
        const arr: string[] = [];
        for (const el of this.values) {
            arr.push(el.key, el.value);
        }

        return JavaChainedHashMap.fromStringArray(arr);
    }
}

const FILE_SCANNER = "io.github.markusjx.scanning.FileScanner";

/**
 * A file scanner.
 * Basically a wrapper around io.github.markusjx.scanning.FileScanner.java
 */
export class FileScanner extends java.importClass<typeof FileScannerProxy>(FILE_SCANNER) {
    /**
     * The source directory
     */
    public readonly source: string;

    /**
     * Create a new {@link FileScanner}
     *
     * @param source the source directory
     */
    public constructor(source: string) {
        super(source);
        this.source = source;
    }

    /**
     * Scan through all directories to find all documents
     *
     * @return the scanned directory
     */
    public async startScan(): Promise<database.Directory> {
        const dir: DirectoryProxy = await this.scan();
        return new database.Directory(dir, this.source);
    }
}

/**
 * The database namespace
 */
export namespace database {
    /**
     * An interface for database-persist-able entities
     */
    export interface Persistable {
        /**
         * Persist this instance
         */
        persist(dbManager: database.DatabaseManager): Promise<void>;
    }

    /**
     * An interface for classes that can be converted into java values
     */
    export interface JavaConvertible {
        /**
         * Convert this instance to a java value
         *
         * @return the java class instance
         */
        javaValue(): JavaClass;
    }

    const PROPERTY_VALUE_SET = "io.github.markusjx.database.types.PropertyValueSet";

    /**
     * A property value set
     */
    export class PropertyValueSet extends java.importClass<typeof PropertyValueSetProxy>(PROPERTY_VALUE_SET) {
    }

    /**
     * A document property
     */
    export class Property extends java.importClass<typeof PropertyProxy>("io.github.markusjx.database.types.Property") {
    }

    /**
     * A property value for a {@link Property}
     */
    export class PropertyValue extends java.importClass<typeof PropertyValueProxy>("io.github.markusjx.database.types.PropertyValue") {
    }

    /**
     * A document tag
     */
    export class Tag extends java.importClass<typeof TagProxy>("io.github.markusjx.database.types.Tag") {
    }

    /**
     * A document
     */
    export class Document implements Persistable, JavaConvertible {
        private readonly impl: DocumentProxy;

        /**
         * Create a document
         */
        public constructor(impl: DocumentProxy, baseDir: string) {
            this.impl = impl;
            this.exists = fs.existsSync(`${baseDir}/${this.absolutePath}`);
        }

        public get filename(): string {
            return this.impl.filename;
        }

        public get absolutePath(): string {
            return this.impl.absolutePath;
        }

        public get parentPath(): string {
            return this.impl.parentPath;
        }

        public get tags(): javaTypes.List<Tag> {
            return this.impl.tags;
        }

        public get properties(): javaTypes.List<PropertyValueSet> {
            return this.impl.properties;
        }

        public get creationDate(): Date {
            return LocalDate.toJSDate(this.impl.creationDate);
        }

        public readonly exists: boolean;

        public set creationDate(date: Date) {
            this.impl.creationDate = LocalDate.dateToJavaLocalDate(date);
        }

        /**
         * Set the tags
         *
         * @param tags the new tags
         * @param dbManager the database manager to use
         * @param persistThis whether to persist this document
         */
        public async setTags(tags: Tag[], dbManager: database.DatabaseManager, persistThis: boolean = true): Promise<void> {
            await this.tags.clear();
            await Promise.all(tags.map(t => this.tags.add(t)));
            await dbManager.persistTags(this.tags);

            if (persistThis) {
                await this.persist(dbManager);
            }
        }

        /**
         * Set the properties
         *
         * @param properties the new properties
         * @param dbManager the database manager to use
         * @param persistThis whether to persist this document
         */
        public async setProperties(properties: PropertyValueSet[], dbManager: database.DatabaseManager, persistThis: boolean = true): Promise<void> {
            await this.properties.clear();
            await Promise.all(properties.filter(v => v.property.name != null && v.property.name.length > 0 &&
                v.propertyValue.value != null && v.propertyValue.value.length > 0).map(v => this.properties.add(v)));

            await dbManager.persistPropertyValueSets(this.properties);

            if (persistThis) {
                await this.persist(dbManager);
            }
        }

        /**
         * Set the creation date
         *
         * @param date the new creation date
         * @param dbManager the database manager to use
         * @param persistThis whether to persist this document
         */
        public async setDate(date: Date, dbManager: database.DatabaseManager, persistThis: boolean = true): Promise<void> {
            this.creationDate = date;

            if (persistThis) {
                await this.persist(dbManager);
            }
        }

        public javaValue(): DocumentProxy {
            return this.impl;
        }

        public persist(dbManager: database.DatabaseManager): Promise<void> {
            return dbManager.persistDocument(this.impl);
        }
    }

    const DirectoryClass = java.importClass<typeof DirectoryProxy>("io.github.markusjx.database.types.Directory");

    /**
     * A directory
     */
    export class Directory implements JavaConvertible {
        public readonly baseDir: string;
        private readonly impl: DirectoryProxy;

        public readonly exists: boolean;

        public constructor(impl: DirectoryProxy | Document[], baseDir: string) {
            if (!Array.isArray(impl)) {
                this.impl = impl;
            } else {
                const tmp = impl.map(d => d.javaValue());
                this.impl = new DirectoryClass("", "");
                this.impl.documents.addAllSync(Arrays.asListSync(tmp));
            }
            this.baseDir = baseDir;
            this.exists = fs.existsSync(`${baseDir}/${this.path}`);
        }

        public get path(): string {
            return this.impl.path;
        }

        public get name(): string {
            return this.impl.name;
        }

        public get documents(): Document[] {
            const result: Document[] = [];
            for (let i = 0; i < this.impl.documents.sizeSync(); i++) {
                result.push(new Document(this.impl.documents.getSync(i), this.baseDir));
            }

            return result;
        }

        public get directories(): Directory[] {
            const result: Directory[] = [];
            for (let i = 0; i < this.impl.directories.sizeSync(); i++) {
                result.push(new Directory(this.impl.directories.getSync(i), this.baseDir));
            }

            return result;
        }

        public async getDocuments(): Promise<Document[]> {
            const result: Document[] = [];
            for (let i = 0; i < await this.impl.documents.size(); i++) {
                result.push(new Document(await this.impl.documents.get(i), this.baseDir));
            }

            return result;
        }

        public async getDirectories(): Promise<Directory[]> {
            const result: Directory[] = [];
            for (let i = 0; i < await this.impl.directories.size(); i++) {
                result.push(new Directory(await this.impl.directories.get(i), this.baseDir));
            }

            return result;
        }

        public javaValue(): DirectoryProxy {
            return this.impl;
        }
    }

    /**
     * A namespace for database filters
     */
    export namespace filters {
        export interface DocumentFilter {
        }

        const FILENAME_FILTER = "io.github.markusjx.database.filter.filters.FilenameFilter";

        /**
         * A filename filter
         */
        export class FilenameFilter extends java.importClass<typeof FilenameFilterProxy>(FILENAME_FILTER) implements DocumentFilter {
            /**
             * Create a filename filter
             *
             * @param impl the java instance
             * @private
             */
            private constructor(impl: FilenameFilterProxy) {
                super(impl);
            }

            /**
             * Create a filename filter
             *
             * @param filename the file name
             * @param exactMatch whether this should be an exact match
             * @return the filename filter
             */
            public static async create(filename: string, exactMatch: boolean): Promise<FilenameFilter> {
                const impl = await FilenameFilter.newInstance(filename, exactMatch);
                return new FilenameFilter(impl);
            }
        }

        const TAG_FILTER = "io.github.markusjx.database.filter.filters.TagFilter";

        /**
         * A tag filter
         */
        export class TagFilter extends java.importClass<typeof TagFilterProxy>(TAG_FILTER) implements DocumentFilter {
            /**
             * Create a tag filter
             *
             * @param impl the java instance
             * @private
             */
            private constructor(impl: TagFilterProxy) {
                super(impl);
            }

            /**
             * Create a tag filter
             *
             * @param tags the tags to filter by
             * @return the created tag filter
             */
            public static async create(...tags: string[]): Promise<TagFilter> {
                const impl = await TagFilter.newInstance(tags);
                return new TagFilter(impl);
            }
        }

        const PROPERTY_FILTER = "io.github.markusjx.database.filter.filters.PropertyFilter";

        /**
         * A property filter
         */
        export class PropertyFilter extends java.importClass<typeof PropertyFilterProxy>(PROPERTY_FILTER) implements DocumentFilter {
            /**
             * Create a property filter
             *
             * @param impl the java instance
             * @private
             */
            private constructor(impl: PropertyFilterProxy) {
                super(impl);
            }

            /**
             * Create a property filter
             *
             * @param props the properties
             * @return the property filter
             */
            public static async create(props: PropertyMap): Promise<PropertyFilter> {
                const impl = await PropertyFilter.newInstance(await props.toJavaChainedHashMap());
                return new PropertyFilter(impl);
            }
        }

        const DATE_FILTER = "io.github.markusjx.database.filter.filters.dates.DateFilter";

        /**
         * A date filter
         */
        export class DateFilter extends java.importClass<typeof DateFilterProxy>(DATE_FILTER) implements DocumentFilter {
            /**
             * Create a date filter
             *
             * @param impl the java instance
             * @private
             */
            private constructor(impl: DateFilterProxy) {
                super(impl);
            }

            /**
             * Get a date filter by a begin and end date
             *
             * @param begin the begin date
             * @param end the end date
             * @return the date filter
             */
            public static async getByDates(begin: Date, end: Date): Promise<DateFilter> {
                const d1: LocalDateProxy = LocalDate.dateToJavaLocalDate(begin);
                const d2: LocalDateProxy = LocalDate.dateToJavaLocalDate(end);

                const impl = await DateFilter.getByDate(d1, d2);
                return new DateFilter(impl);
            }
        }
    }

    const DOCUMENT_FILTER = "io.github.markusjx.database.filter.DocumentFilter";

    /**
     * A document filter
     */
    export class DocumentFilter extends java.importClass<typeof DocumentFilterProxy>(DOCUMENT_FILTER) {
        /**
         * Create a document filter
         *
         * @param impl the java instance
         * @private
         */
        private constructor(impl: DocumentFilterProxy) {
            super(impl);
        }

        /**
         * Create a document filter from filters
         *
         * @param filterList the filters to create the {@link DocumentFilter} from
         * @return the created DocumentFilter
         */
        public static async create(...filterList: filters.DocumentFilter[]): Promise<DocumentFilter> {
            const impl = await DocumentFilter.createFilter(filterList);
            return new DocumentFilter(impl);
        }
    }

    const DATABASE_INFO = "io.github.markusjx.database.DatabaseInfo";

    /**
     * The database information
     */
    export class DatabaseInfo extends java.importClass<typeof DatabaseInfoProxy>(DATABASE_INFO) {
    }

    const DATABASE_MANAGER = "io.github.markusjx.database.DatabaseManager";

    /**
     * The database manager
     */
    export class DatabaseManager extends java.importClass<typeof DatabaseManagerProxy>(DATABASE_MANAGER) {
        /**
         * The database info
         */
        public databaseInfo: DatabaseInfo;

        /**
         * Create the database manager
         *
         * @param impl the java instance
         * @private
         */
        private constructor(impl: DatabaseManagerProxy) {
            super(impl);
            this.databaseInfo = null;

            this.updateDatabaseInfo().then();
        }

        /**
         * Get the database's source path
         *
         * @return the source path
         */
        public getSourcePath(): string {
            if (constants.activeSetting != null && constants.activeSetting.localPath != null) {
                return constants.activeSetting.localPath;
            } else {
                return this.databaseInfo.sourcePath;
            }
        }

        /**
         * Create the database manager from an {@link EntityManager}
         *
         * @param entityManager the entity manager
         * @return the database manager
         */
        public static async create(entityManager: EntityManager): Promise<DatabaseManager> {
            const impl = await DatabaseManager.newInstance(entityManager);
            return new DatabaseManager(impl);
        }

        /**
         * Get documents by a filter
         *
         * @param filter the document filter
         * @param offset the offset in the search
         * @return the documents filtered by the filter
         */
        public async getDocumentsByFilter(filter: DocumentFilter, offset: number): Promise<Document[]> {
            const docList = await this.getDocumentsBy(filter, offset);
            let sourcePath: string;
            if (constants.activeSetting != null && constants.activeSetting.localPath != null) {
                sourcePath = constants.activeSetting.localPath;
            } else {
                sourcePath = this.databaseInfo.sourcePath;
            }

            const documents: Document[] = [];
            for (let i: number = 0; i < await docList.size(); i++) {
                const listEl = await docList.get(i);
                documents.push(new Document(listEl, sourcePath));
            }

            return documents;
        }

        /**
         * Persist a directory
         *
         * @param directory the directory to persist
         * @param sourcePath the source path
         * @return whether the operation was successful
         */
        public async persistDirectoryProxy(directory: DirectoryProxy, sourcePath: string): Promise<boolean> {
            if (await this.persistDirectory(directory, sourcePath)) {
                return this.updateDatabaseInfo();
            } else {
                return false;
            }
        }

        /**
         * Get a directory by its path
         *
         * @param _path the path to the directory
         * @return the directory or null if not found
         */
        public async getDirectoryBy(_path: string): Promise<Directory> {
            const proxy = await this.getDirectory(_path);
            let sourcePath: string;
            if (constants.activeSetting != null && constants.activeSetting.localPath != null) {
                sourcePath = constants.activeSetting.localPath;
            } else {
                sourcePath = (await this.getDatabaseInfo()).sourcePath;
            }

            if (proxy != null) {
                return new Directory(proxy, sourcePath);
            } else {
                return null;
            }
        }

        /**
         * Get the root directory
         *
         * @return the root directory or null if not found
         */
        public getRootDirectory(): Promise<Directory> {
            return this.getDirectoryBy("");
        }

        /**
         * Set the database info
         *
         * @return whether the operation was successful
         * @private
         */
        private async updateDatabaseInfo(): Promise<boolean> {
            const info: DatabaseInfo = await this.getDatabaseInfo();
            if (info != null) {
                this.databaseInfo = info;
                return true;
            } else {
                return false;
            }
        }
    }

    /**
     * Create a database manager from a SQLite database
     *
     * @param databaseFile the database file
     * @param action the database action
     * @param showSQL whether to show the generated sql commands
     * @return the created database manager
     */
    export async function createSQLiteDatabaseManager(databaseFile: string, action: Action, showSQL: boolean = false): Promise<DatabaseManager> {
        const provider = await SQLiteProvider.newInstance(databaseFile, action, showSQL, MANAGED_CLASSES);
        const em = await CustomPersistence.createEntityManager("documents", provider);
        return database.DatabaseManager.create(em);
    }
}
