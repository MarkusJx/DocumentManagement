import java, {java_instance_proxy, JavaClass} from "@markusjx/java";
import * as fs from "fs";
import path from "path";
import {getLogger} from "log4js";
import constants from "./util/constants";
import javaTypes from "./javaTypes";
import {createStore} from "../shared/Settings";
import {
    ActionProxy,
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
    MariaDBProviderProxy,
    MySQLProviderProxy,
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
if (fs.existsSync(path.join(__dirname, '..', 'dbLib', 'build', 'libs', JAR_NAME))) {
    java.classpath.append(path.join(__dirname, '..', 'dbLib', 'build', 'libs', JAR_NAME));
} else {
    java.classpath.append(path.join(__dirname, '..', '..', 'dbLib', 'build', 'libs', JAR_NAME));
}

export class Arrays extends java.importClass<typeof javaTypes.Arrays>('java.util.Arrays') {
}

java.logging.setLogLevel(3);

/**
 * The hibernate creation action.
 * See {@link ActionProxy} for further information.
 */
export class Action extends java.importClass<typeof ActionProxy>('org.hibernate.tool.schema.Action') {
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

    /**
     * Convert a LocalDateProxy to a javascript date
     *
     * @param date the date to convert
     * @return the converted date
     */
    public static toJSDate(date: LocalDateProxy): Date {
        return new Date(date.toStringSync());
    }
}

/**
 * The java logger class
 */
export class Logger extends java.importClass<typeof LoggerProxy>("io.github.markusjx.util.Logging") {
}

/**
 * The java managed classes
 */
export const MANAGED_CLASSES = [
    "io.github.markusjx.database.DatabaseInfo", "io.github.markusjx.database.types.Directory",
    "io.github.markusjx.database.types.Document", "io.github.markusjx.database.types.Property",
    "io.github.markusjx.database.types.PropertyValue", "io.github.markusjx.database.types.Tag"
];

const SQLITE_PROVIDER = "io.github.markusjx.database.persistence.SQLiteProvider";

/**
 * The sqlite provider
 */
export class SQLiteProvider extends java.importClass<typeof SQLiteProviderClass>(SQLITE_PROVIDER) {
}

const MYSQL_PROVIDER = "io.github.markusjx.database.persistence.MySQLProvider";

/**
 * The MySQL provider
 */
export class MySQLProvider extends java.importClass<typeof MySQLProviderProxy>(MYSQL_PROVIDER) {
}

const MARIADB_PROVIDER = "io.github.markusjx.database.persistence.MariaDBProvider";

/**
 * The mariadb provider
 */
export class MariaDBProvider extends java.importClass<typeof MariaDBProviderProxy>(MARIADB_PROVIDER) {
}

/**
 * An entity manager
 */
export declare abstract class EntityManager extends java_instance_proxy {
}

/**
 * The java entity manager factory
 */
declare abstract class EntityManagerFactory extends java_instance_proxy {
    /**
     * Create an entity manager
     *
     * @return the created entity manager
     */
    public static createEntityManager(): Promise<EntityManager>;
}

/**
 * The java custom persistence class
 */
declare class CustomPersistenceClass extends EntityManager {
    /**
     * Create a entity manager factory
     *
     * @param persistenceUnitName the persistence unit name
     * @param provider the persistence provider
     * @return the created entity manager factory
     */
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

/**
 * A Chained hash map
 */
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
        /**
         * Is set to true if the document was found on the hard drive
         */
        public readonly exists: boolean;

        /**
         * Create a document
         */
        public constructor(impl: DocumentProxy, baseDir: string) {
            this.impl = impl;
            this.exists = fs.existsSync(`${baseDir}/${this.absolutePath}`);
        }

        /**
         * The document proxy
         * @private
         */
        private readonly impl: DocumentProxy;

        /**
         * Get the file name
         */
        public get filename(): string {
            return this.impl.filename;
        }

        /**
         * Get the absolute path
         */
        public get absolutePath(): string {
            return this.impl.absolutePath;
        }

        /**
         * Get the parent path
         */
        public get parentPath(): string {
            return this.impl.parentPath;
        }

        /**
         * Get the tags
         */
        public get tags(): javaTypes.List<Tag> {
            return this.impl.tags;
        }

        /**
         * Get the properties
         */
        public get properties(): javaTypes.List<PropertyValueSet> {
            return this.impl.properties;
        }

        /**
         * Get the creation date
         */
        public get creationDate(): Date {
            return LocalDate.toJSDate(this.impl.creationDate);
        }

        /**
         * Set the creation date
         *
         * @param date the new creation date
         */
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
        /**
         * The base directory
         */
        public readonly baseDir: string;
        /**
         * Is set to true if the directory exists
         */
        public readonly exists: boolean;
        /**
         * The directory proxy
         * @private
         */
        private readonly impl: DirectoryProxy;

        /**
         * Create á new directory
         *
         * @param impl the proxy to copy or documents to store
         * @param baseDir the base directory
         */
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

        /**
         * Get the directory path
         */
        public get path(): string {
            return this.impl.path;
        }

        /**
         * Get the directory's name
         */
        public get name(): string {
            return this.impl.name;
        }

        /**
         * Get the documents in this directory
         */
        public get documents(): Document[] {
            const result: Document[] = [];
            for (let i = 0; i < this.impl.documents.sizeSync(); i++) {
                result.push(new Document(this.impl.documents.getSync(i), this.baseDir));
            }

            return result;
        }

        /**
         * Get the directories in this directory
         */
        public get directories(): Directory[] {
            const result: Directory[] = [];
            for (let i = 0; i < this.impl.directories.sizeSync(); i++) {
                result.push(new Directory(this.impl.directories.getSync(i), this.baseDir));
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
}
