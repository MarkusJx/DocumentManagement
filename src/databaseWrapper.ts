import java from "java";
import {promisify} from "util";
import * as fs from "fs";
import path from "path";
import {getLogger} from "log4js";

const JAR_NAME = 'dbLib-1.0-SNAPSHOT.jar';
const logger = getLogger();

logger.info("Loading the java library");
if (fs.existsSync(path.join(__dirname, '..', '..', 'dbLib', 'build', 'libs', JAR_NAME))) {
    java.classpath.push(path.join(__dirname, '..', '..', 'dbLib', 'build', 'libs', JAR_NAME));
} else {
    java.classpath.push(path.join(__dirname, '..', '..', '..', 'dbLib', 'build', 'libs', JAR_NAME));
}

const Arrays = java.import('java.util.Arrays');

/**
 * The hibernate creation action.
 * The following information is from the
 * org.hibernate.tool.schema.Action.java file.
 */
export enum Action {
    // No action will be performed
    NONE,
    // Database creation will be generated
    CREATE_ONLY,
    // Database dropping will be generated
    DROP,
    // Database dropping will be generated followed by database creation
    CREATE,
    // Drop the schema and recreate it on SessionFactory startup.
    // Additionally, drop the schema on SessionFactory shutdown.
    CREATE_DROP,
    // Validate the database schema
    VALIDATE,
    // Update (alter) the database schema
    UPDATE
}

/**
 * Convert an {@link Action} to a org.hibernate.tool.schema.Action
 *
 * @param action the action to convert
 * @return the converted action
 */
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
            throw new Error("An invalid action was specified");
    }
}

type java_call_method_t = (instance: any, methodName: string, ...args: any[]) => Promise<any>;
// Call a java member method
const java_callMethod: java_call_method_t = promisify(java.callMethod.bind(java));

type java_call_static_method_t = (className: string, methodName: string, ...args: any[]) => Promise<any>;
// Call a java static method
const java_callStaticMethod: java_call_static_method_t = promisify(java.callStaticMethod.bind(java));

type java_new_instance_t = (className: string, ...args: any[]) => Promise<any>;
// Create a new java class instance
const java_newInstance: java_new_instance_t = promisify(java.newInstance.bind(java));

/**
 * Convert a {@link Date} to a java.time.LocalDate
 *
 * @param date the date to convert
 * @return the java.time.LocalDate
 */
async function dateToJavaLocalDate(date: Date): Promise<any> {
    return java_callStaticMethod("java.time.LocalDate", "parse",
        date.toISOString().split('T')[0]);
}

/**
 * Convert a string array to a java string array
 *
 * @param arr the array to convert
 * @return the converted java array
 */
function stringToJavaArray(arr: string[]): any {
    return java.newArray("java.lang.String", arr);
}

/**
 * Get the size of a java.util.List
 *
 * @param list the list to get the size of
 * @return the list size
 */
async function getListSize(list: any): Promise<number> {
    return new Promise<number>((resolve, reject) => {
        list.size((err: Error, result: number) => {
            if (err) {
                reject(err);
            } else {
                resolve(result);
            }
        });
    });
}

/**
 * Get a list element at an index
 *
 * @param list the list
 * @param index the index of the element
 * @return the element at index in list
 */
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

/**
 * Convert a java.time.LocalDate to a {@link Date}
 *
 * @param date the date to convert
 * @return the converted date
 */
async function javaDateToDate(date: any): Promise<Date> {
    type date_to_string_t = () => Promise<string>;
    const to_string: date_to_string_t = promisify(date.toString.bind(date));
    return new Date(await to_string());
}

/**
 * A persistence provider
 */
export class PersistenceProvider {
    /**
     * The java implementation
     */
    public readonly impl: any;

    /**
     * Create a {@link PersistenceProvider}
     *
     * @param impl the java implementation
     */
    public constructor(impl: any) {
        this.impl = impl;
    }
}

/**
 * A SQLite persistence provider
 */
export class SQLiteProvider extends PersistenceProvider {
    /**
     * Create a SQLiteProvider instance
     *
     * @param impl the java implementation instance
     * @private
     */
    private constructor(impl: any) {
        super(impl);
    }

    /**
     * Create a {@link SQLiteProvider}
     *
     * @param databaseFile the database file
     * @param action the database creation action
     * @param showSQL whether to show the generated sql commands
     */
    public static async create(databaseFile: string = "", action: Action = Action.CREATE_DROP, showSQL: boolean = true): Promise<SQLiteProvider> {
        logger.info("Creating a new SQLite provider");
        const _action = actionToJavaAction(action);
        const arr = java.newArray("java.lang.String", []);
        const impl = await java_newInstance("io.github.markusjx.database.persistence.SQLiteProvider",
            databaseFile, _action, showSQL, arr);

        return new SQLiteProvider(impl);
    }
}

/**
 * A MySQL persistence provider
 */
export class MySQLProvider extends PersistenceProvider {
    /**
     * Create a MySQLProvider instance
     *
     * @param impl the java implementation instance
     * @private
     */
    private constructor(impl: any) {
        super(impl);
    }

    /**
     * Create a new persistence provider instance
     *
     * @param url the url of the database
     * @param user the username to use
     * @param password the password to use
     * @param action the sql action
     * @param showSQL whether to show the generated sql commands
     * @return the created persistence provider
     */
    public static async create(url: string, user: string, password: string, action: Action = Action.CREATE_DROP, showSQL: boolean = true): Promise<MySQLProvider> {
        logger.info("Creating a new MySQL provider");
        const _action = actionToJavaAction(action);
        const arr = java.newArray("java.lang.String", []);
        const impl = await java_newInstance("io.github.markusjx.database.persistence.MySQLProvider",
            url, user, password, _action, showSQL, arr);

        return new MySQLProvider(impl);
    }
}

/**
 * A MariaDB persistence provider
 */
export class MariaDBProvider extends PersistenceProvider {
    /**
     * Create a MySQLProvider instance
     *
     * @param impl the java implementation instance
     * @private
     */
    private constructor(impl: any) {
        super(impl);
    }

    /**
     * Create a new persistence provider instance
     *
     * @param url the url of the database
     * @param user the username to use
     * @param password the password to use
     * @param action the sql action
     * @param showSQL whether to show the generated sql commands
     * @return the created persistence provider
     */
    public static async create(url: string, user: string, password: string, action: Action = Action.CREATE_DROP, showSQL: boolean = true): Promise<MySQLProvider> {
        logger.info("Creating a new Maria DB provider");
        const _action = actionToJavaAction(action);
        const arr = java.newArray("java.lang.String", []);
        const impl = await java_newInstance("io.github.markusjx.database.persistence.MariaDBProvider",
            url, user, password, _action, showSQL, arr);

        return new MariaDBProvider(impl);
    }
}

/**
 * An entity manager
 */
export class EntityManager {
    /**
     * The java implementation instance
     */
    public readonly impl: any;

    /**
     * Create an {@link EntityManager} instance
     *
     * @param impl the java instance
     */
    public constructor(impl: any) {
        this.impl = impl;
    }
}

/**
 * A custom hibernate persistence provider
 */
export class CustomPersistence {
    /**
     * Create an entity manager
     *
     * @param persistenceUnitName the persistence unit name
     * @param provider the persistence provider
     * @return the created entity manager
     */
    public static async createEntityManager(persistenceUnitName: string, provider: PersistenceProvider): Promise<EntityManager> {
        const impl = await java_callStaticMethod("io.github.markusjx.database.persistence.CustomPersistence",
            "createEntityManagerFactory", persistenceUnitName, provider.impl);

        const em = await java_callMethod(impl, "createEntityManager");
        return new EntityManager(em);
    }
}

/**
 * A wrapper around io.github.markusjx.datatypes.ChainedHashMap
 */
export class JavaChainedHashMap {
    /**
     * The java instance
     */
    public readonly impl: any;

    /**
     * Create a java chained hashMap
     *
     * @param impl the java instance
     */
    public constructor(impl: any) {
        this.impl = impl;
    }
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
    public async toJavaChainedHashMap(): Promise<JavaChainedHashMap> {
        const arr: string[] = [];
        for (let i: number = 0; i < this.values.length; i++) {
            arr.push(this.values[i].key, this.values[i].value);
        }

        const impl = await java_callStaticMethod("io.github.markusjx.datatypes.ChainedHashMap",
            "fromStringArray", java.newArray("java.lang.String", arr));

        return new JavaChainedHashMap(impl);
    }
}

/**
 * A file scanner.
 * Basically a wrapper around io.github.markusjx.scanning.FileScanner.java
 */
export class FileScanner {
    /**
     * The source directory
     */
    public readonly source: string;
    /**
     * The java instance
     * @private
     */
    private readonly impl: any;

    /**
     * Create a new {@link FileScanner}
     *
     * @param source the source directory
     */
    public constructor(source: string) {
        this.impl = java.newInstanceSync("io.github.markusjx.scanning.FileScanner", source);
        this.source = source;
    }

    /**
     * Scan through all directories to find all documents
     *
     * @return the scanned directory
     */
    public async scan(): Promise<database.DirectoryProxy> {
        const dir: any = await java_callMethod(this.impl, "scan");
        return new database.DirectoryProxy(dir, this.source);
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
        persist(): Promise<void>;
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
        toJavaValue(): any;
    }

    /**
     * A property value set
     */
    export class PropertyValueSet implements JavaConvertible {
        /**
         * The java equivalent class
         * @private
         */
        private static readonly PropertyValueSetImpl = java.import("io.github.markusjx.database.types.PropertyValueSet");

        /**
         * The property name
         */
        public readonly propertyName: string;

        /**
         * The property value
         */
        public readonly propertyValue: string;

        /**
         * The java PropertyValueSet instance
         */
        public readonly impl: any;

        /**
         * Create a {@link PropertyValueSet}
         *
         * @param name the property name
         * @param value the property value
         * @param impl the java instance. Will be created if unset.
         */
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

    /**
     * A document property
     */
    export class Property implements JavaConvertible {
        /**
         * The java class
         * @private
         */
        private static readonly PropertyImpl = java.import("io.github.markusjx.database.types.Property");

        /**
         * The property name
         */
        public readonly name: string;

        /**
         * The java instance
         * @private
         */
        private readonly impl: any;

        /**
         * Create a {@link Property}
         *
         * @param name the property name
         * @param impl the java instance. Will be created if unset.
         */
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

    /**
     * A property value for a {@link Property}
     */
    export class PropertyValue implements JavaConvertible {
        /**
         * The java class
         * @private
         */
        private static readonly PropertyValueImpl = java.import("io.github.markusjx.database.types.PropertyValue");

        /**
         * The property value
         */
        public readonly value: string;

        /**
         * The java instance
         * @private
         */
        private readonly impl: any;

        /**
         * Create a {@link PropertyValue}
         *
         * @param value the property value
         * @param impl the java instance. Will be created if unset.
         */
        public constructor(value: string, impl?: any) {
            this.value = value;

            if (impl) {
                this.impl = impl;
            } else {
                this.impl = new PropertyValue.PropertyValueImpl(value);
            }
        }

        public toJavaValue(): any {
            return this.impl;
        }
    }

    /**
     * A document tag
     */
    export class Tag implements JavaConvertible {
        /**
         * The java class
         * @private
         */
        private static readonly Tag_impl: any = java.import("io.github.markusjx.database.types.Tag");

        /**
         * The tag name
         */
        public readonly name: string;

        /**
         * Create a {@link Tag}
         *
         * @param name the tag name
         */
        public constructor(name: string) {
            this.name = name;
        }

        public toJavaValue(): any {
            return new Tag.Tag_impl(this.name);
        }
    }

    /**
     * A document
     */
    export class Document implements Persistable, JavaConvertible {
        /**
         * The absolute path to the document
         */
        public readonly absolutePath: string;

        /**
         * The parent path of the document
         */
        public readonly parentPath: string;

        /**
         * The file name
         */
        public readonly filename: string;

        /**
         * Whether the document exists on this system
         */
        public readonly exists: boolean;

        /**
         * The database manager this is associated with
         * @private
         */
        private readonly dbManager: DatabaseManager;

        /**
         * The java instance
         * @private
         */
        private readonly impl: any;

        /**
         * The properties of the document
         * @private
         */
        private propertyArray: PropertyValueSet[];

        /**
         * The document creation date
         * @private
         */
        private creationDate: Date;

        /**
         * The document tags
         * @private
         */
        private tagArray: Tag[];

        /**
         * Create a document
         *
         * @param filename the file name
         * @param absolutePath the absolute path to the document
         * @param tags the document tags
         * @param properties the document properties
         * @param creationDate the document creation date
         * @param baseDir the base directory
         * @param impl the java instance
         * @param dbManager the database manager this is associated with
         * @param parentPath the parent path. Will be created if unset.
         */
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

        /**
         * Get the document tags
         *
         * @return the tags
         */
        public get tags(): Tag[] {
            return this.tagArray;
        }

        /**
         * Get the document properties
         *
         * @return the properties
         */
        public get properties(): PropertyValueSet[] {
            return this.propertyArray;
        }

        /**
         * Get the creation date
         *
         * @return the creation date
         */
        public get date(): Date {
            return this.creationDate;
        }

        /**
         * Create a document from a java document
         *
         * @param document the java document
         * @param baseDir the base directory
         * @param dbManager the database manager the document is associated with
         * @return the created document
         */
        public static async fromJavaDocument(document: any, baseDir: string, dbManager: DatabaseManager): Promise<Document> {
            const filename: string = document.filename;
            const absolutePath: string = document.absolutePath;
            const parentPath: string = document.parentPath;

            // Convert the tags
            const jTags: any = document.tags;
            const tags: Tag[] = [];
            for (let i: number = 0; i < await getListSize(jTags); i++) {
                tags.push(new Tag((await getListElementAt(jTags, i)).name));
            }

            // Convert the properties
            const jProperties: any = document.properties;
            const properties: PropertyValueSet[] = [];
            for (let i: number = 0; i < await getListSize(jProperties); i++) {
                let set: any = await getListElementAt(jProperties, i);
                properties.push(new PropertyValueSet(set.property.name, set.propertyValue.value, set));
            }

            // Get the date
            const date: Date = await javaDateToDate(document.creationDate);
            return new Document(filename, absolutePath, tags, properties, date, baseDir, document, dbManager, parentPath);
        }

        /**
         * Set the tags
         *
         * @param tags the new tags
         * @param persistThis whether to persist this document
         */
        public async setTags(tags: Tag[], persistThis: boolean = true): Promise<void> {
            this.tagArray = tags;
            await this.dbManager.persistTags(this.tagArray);
            await this.persistArray(this.tagArray, this.impl.tags, persistThis);
        }

        /**
         * Set the properties
         *
         * @param properties the new properties
         * @param persistThis whether to persist this document
         */
        public async setProperties(properties: PropertyValueSet[], persistThis: boolean = true): Promise<void> {
            this.propertyArray = properties.filter(v => v.propertyName != null && v.propertyName.length > 0 &&
                v.propertyValue != null && v.propertyValue.length > 0);

            await this.dbManager.persistPropertyValueSets(this.propertyArray);
            await this.persistArray(this.propertyArray, this.impl.properties, persistThis);
        }

        /**
         * Set the creation date
         *
         * @param date the new creation date
         * @param persistThis whether to persist this document
         */
        public async setDate(date: Date, persistThis: boolean = true): Promise<void> {
            this.creationDate = date;
            this.impl.creationDate = await dateToJavaLocalDate(date);

            if (persistThis) {
                await this.persist();
            }
        }

        public toJavaValue(): any {
            return this.impl;
        }

        public persist(): Promise<void> {
            return this.dbManager.persistDocument(this);
        }

        /**
         * Persist an array
         *
         * @param toPersist the array to persist
         * @param nativeArray the java list
         * @param persistThis whether to persist this document
         * @private
         */
        private async persistArray<T extends JavaConvertible>(toPersist: T[], nativeArray: any, persistThis: boolean): Promise<void> {
            await promisify(nativeArray.clear.bind(nativeArray))();

            const javaValues: any[] = toPersist.map(v => v.toJavaValue());
            const valueList: any = await promisify(Arrays.asList.bind(Arrays))(...javaValues);
            await promisify(nativeArray.addAll.bind(nativeArray))(valueList);

            if (persistThis) {
                await this.persist();
            }
        }

        /**
         * Get the parent path
         *
         * @return the calculated parent path
         * @private
         */
        private getParentPath(): string {
            try {
                return this.absolutePath.substring(0, this.absolutePath.length - (this.filename.length + 1));
            } catch (e) {
                return "";
            }
        }
    }

    /**
     * A directory proxy class.
     * Basically a proxy class to prevent hibernate from fetching
     * all documents and directories from the database.
     * May be converted to a {@link Directory} using
     * {@link Directory#fromImpl}
     */
    export class DirectoryProxy {
        /**
         * The java instance
         */
        public readonly impl: any;

        /**
         * The path to the directory
         */
        public readonly path: string;

        /**
         * The directory name
         */
        public readonly name: string;

        /**
         * Whether the directory exists
         */
        public readonly exists: boolean;

        /**
         * Create a {@link DirectoryProxy}
         *
         * @param impl the java instance
         * @param baseDir the base directory
         */
        public constructor(impl: any, baseDir: string) {
            this.impl = impl;
            this.path = impl.path;
            this.name = impl.name;
            this.exists = fs.existsSync(`${baseDir}/${this.path}`);
        }
    }

    /**
     * A directory
     */
    export class Directory extends DirectoryProxy {
        /**
         * The java class
         * @private
         */
        private static readonly Directory_impl = java.import("io.github.markusjx.database.types.Directory");

        /**
         * The documents in this directory
         */
        public readonly documents: Document[];

        /**
         * The directories in this directory
         */
        public readonly directories: DirectoryProxy[];

        /**
         * Create a {@link Directory}
         *
         * @param documents the documents in this directory
         * @param directories the directories in this directory
         * @param impl the java instance. Will be created if null
         * @param baseDir the base directory
         */
        public constructor(documents: Document[], directories: DirectoryProxy[], impl: any, baseDir: string) {
            if (impl == null) {
                impl = new Directory.Directory_impl(baseDir + "/tmp", "tmp");
            }

            super(impl, baseDir);
            this.documents = documents;
            this.directories = directories;
        }

        /**
         * Create a {@link Directory} from a {@link DirectoryProxy}
         *
         * @param impl the proxy to create this from
         * @param baseDir the base directory
         * @param dbManager the database manager this is associated with
         * @return the directory
         */
        public static async fromImpl(impl: DirectoryProxy, baseDir: string, dbManager: DatabaseManager): Promise<Directory> {
            return await Directory.fromJavaDirectory(impl.impl, baseDir, dbManager);
        }

        /**
         * Create a {@link Directory} from the java instance
         *
         * @param directory the directory to create the {@link Directory} from
         * @param baseDir the base directory
         * @param dbManager the database manager this is associated with
         * @return the directory
         */
        public static async fromJavaDirectory(directory: any, baseDir: string, dbManager: DatabaseManager): Promise<Directory> {
            const jDocs: any = directory.documents;
            const jDirs: any = directory.directories;

            // The documents
            const documents: Document[] = [];
            for (let i: number = 0; i < await getListSize(jDocs); i++) {
                let el: any = await getListElementAt(jDocs, i);
                documents.push(await Document.fromJavaDocument(el, baseDir, dbManager));
            }

            // The directories
            const directories: DirectoryProxy[] = [];
            for (let i: number = 0; i < await getListSize(jDirs); i++) {
                let el: any = await getListElementAt(jDirs, i);
                directories.push(new DirectoryProxy(el, baseDir));
            }

            return new Directory(documents, directories, directory, baseDir);
        }
    }

    /**
     * A namespace for database filters
     */
    export namespace filters {
        /**
         * The document filter base
         */
        export class DocumentFilterBase {
            /**
             * The java instance
             */
            public readonly impl: any;

            /**
             * Create a {@link DocumentFilterBase}
             *
             * @param impl the java instance
             * @protected
             */
            protected constructor(impl: any) {
                this.impl = impl;
            }
        }

        /**
         * A filename filter
         */
        export class FilenameFilter extends DocumentFilterBase {
            /**
             * Create a filename filter
             *
             * @param impl the java instance
             * @private
             */
            private constructor(impl: any) {
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
                const impl = await java_newInstance(
                    "io.github.markusjx.database.filter.filters.FilenameFilter",
                    filename, exactMatch);

                return new FilenameFilter(impl);
            }
        }

        /**
         * A tag filter
         */
        export class TagFilter extends DocumentFilterBase {
            /**
             * Create a tag filter
             *
             * @param impl the java instance
             * @private
             */
            private constructor(impl: any) {
                super(impl);
            }

            /**
             * Create a tag filter
             *
             * @param tags the tags to filter by
             * @return the created tag filter
             */
            public static async create(...tags: string[]): Promise<TagFilter> {
                const impl = await java_newInstance(
                    "io.github.markusjx.database.filter.filters.TagFilter",
                    stringToJavaArray(tags));

                return new TagFilter(impl);
            }
        }

        /**
         * A property filter
         */
        export class PropertyFilter extends DocumentFilterBase {
            /**
             * Create a property filter
             *
             * @param impl the java instance
             * @private
             */
            private constructor(impl: any) {
                super(impl);
            }

            /**
             * Create a property filter
             *
             * @param props the properties
             * @return the property filter
             */
            public static async create(props: PropertyMap): Promise<PropertyFilter> {
                const impl = await java_newInstance(
                    "io.github.markusjx.database.filter.filters.PropertyFilter",
                    (await props.toJavaChainedHashMap()).impl);

                return new PropertyFilter(impl);
            }
        }

        /**
         * A date filter
         */
        export class DateFilter extends DocumentFilterBase {
            /**
             * The java DateFilter class
             * @private
             */
            private static readonly DateFilter_impl = java.import("io.github.markusjx.database.filter.filters.dates.DateFilter");

            /**
             * Create a date filter
             *
             * @param impl the java instance
             * @private
             */
            private constructor(impl: any) {
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
                const d1: any = await dateToJavaLocalDate(begin);
                const d2: any = await dateToJavaLocalDate(end);

                const getByDate = promisify(DateFilter.DateFilter_impl.getByDate.bind(DateFilter.DateFilter_impl));
                const impl = await getByDate(d1, d2);

                return new DateFilter(impl);
            }
        }
    }

    /**
     * A document filter
     */
    export class DocumentFilter {
        /**
         * The java instance
         */
        public readonly impl: any;

        /**
         * Create a document filter
         *
         * @param impl the java instance
         * @private
         */
        private constructor(impl: any) {
            this.impl = impl;
        }

        /**
         * Create a document filter from filters
         *
         * @param filterList the filters to create the {@link DocumentFilter} from
         * @return the created DocumentFilter
         */
        public static async create(...filterList: filters.DocumentFilterBase[]): Promise<DocumentFilter> {
            const filterImpls: any[] = [];
            for (let i = 0; i < filterList.length; i++) {
                filterImpls.push(filterList[i].impl);
            }

            const impl = await java_callStaticMethod("io.github.markusjx.database.filter.DocumentFilter",
                "createFilter", java.newArray("io.github.markusjx.database.filter.DocumentFilterBase",
                    filterImpls));

            return new DocumentFilter(impl);
        }
    }

    /**
     * The database information
     */
    export class DatabaseInfo {
        /**
         * The source path
         */
        public readonly sourcePath: string;

        /**
         * Create the database info
         *
         * @param impl the java instance
         */
        public constructor(impl: any) {
            this.sourcePath = impl.sourcePath;
        }
    }

    /**
     * The database manager
     */
    export class DatabaseManager {
        /**
         * The database info
         */
        public databaseInfo: DatabaseInfo;
        /**
         * The java instance
         * @private
         */
        private readonly impl: any;

        /**
         * Create the database manager
         *
         * @param impl the java instance
         * @private
         */
        private constructor(impl: any) {
            this.impl = impl;
            this.databaseInfo = null;

            this.setDatabaseInfo().then();
        }

        /**
         * Create the database manager from an {@link EntityManager}
         *
         * @param entityManager the entity manager
         * @return the database manager
         */
        public static async create(entityManager: EntityManager): Promise<DatabaseManager> {
            const impl = await java_newInstance(
                "io.github.markusjx.database.DatabaseManager",
                entityManager.impl);

            return new DatabaseManager(impl);
        }

        /**
         * Create a document
         *
         * @param filename the file name
         * @param _path the document path
         * @param properties the document properties
         * @param creationDate the document creation date
         * @param tagNames the tag names
         */
        public async createDocument(filename: string, _path: string, properties: PropertyMap, creationDate: Date, ...tagNames: string[]): Promise<void> {
            await java_callMethod(this.impl, "createDocument", filename, _path,
                (await properties.toJavaChainedHashMap()).impl,
                await dateToJavaLocalDate(creationDate),
                stringToJavaArray(tagNames));
        }

        /**
         * Get documents by a filter
         *
         * @param filter the document filter
         * @param offset the offset in the search
         * @return the documents filtered by the filter
         */
        public async getDocumentsBy(filter: DocumentFilter, offset: number): Promise<Document[]> {
            const docList: any = await java_callMethod(this.impl, "getDocumentsBy", filter.impl, offset);

            const documents: Document[] = [];
            for (let i: number = 0; i < await getListSize(docList); i++) {
                const listEl: any = await getListElementAt(docList, i);
                documents.push(await Document.fromJavaDocument(listEl, this.databaseInfo.sourcePath, this));
            }

            return documents;
        }

        /**
         * Get the number of rows in a filter query
         *
         * @param filter the filter to use
         * @return the number of rows
         */
        public async getNumDocumentsBy(filter: DocumentFilter): Promise<number> {
            return await java_callMethod(this.impl, "getNumDocumentsBy", filter.impl);
        }

        /**
         * Persist a directory
         *
         * @param directory the directory to persist
         * @param sourcePath the source path
         * @return whether the operation was successful
         */
        public async persistDirectory(directory: DirectoryProxy, sourcePath: string): Promise<boolean> {
            return await java_callMethod(this.impl, "persistDirectory", directory.impl, sourcePath) &&
                await this.setDatabaseInfo();
        }

        /**
         * Get a directory by its path
         *
         * @param _path the path to the directory
         * @return the directory or null if not found
         */
        public async getDirectory(_path: string): Promise<Directory> {
            const impl: any = await java_callMethod(this.impl, "getDirectory", _path);

            if (impl != null) {
                return Directory.fromJavaDirectory(impl, (await this.getDatabaseInfo()).sourcePath, this);
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
            return this.getDirectory("");
        }

        /**
         * Check if a tag exists
         *
         * @param name the tag name
         * @return true if the tag exists
         */
        public tagExists(name: string): boolean {
            return this.impl.tagExistsSync(name);
        }

        /**
         * Get all tags with a name like name
         *
         * @param name the name to search for
         * @return the list of tags
         */
        public getTagsLike(name: string): Tag[] {
            const tagList: any = this.impl.getTagsLikeSync(name);

            const result: Tag[] = [];
            for (let i: number = 0; i < tagList.sizeSync(); i++) {
                result.push(new Tag(tagList.getSync(i).name));
            }

            return result;
        }

        /**
         * Get all properties with a name like name
         *
         * @param name the name to search for
         * @return the properties with a name like name
         */
        public getPropertiesLike(name: string): Property[] {
            const propertyList: any = this.impl.getPropertiesLikeSync(name);

            const result: Property[] = [];
            for (let i: number = 0; i < propertyList.sizeSync(); i++) {
                const impl: any = propertyList.getSync(i);
                result.push(new Property(impl.name, impl));
            }

            return result;
        }

        /**
         * Get all property values with a value like value
         *
         * @param value the value to search for
         * @return the property values
         */
        public getPropertyValuesLike(value: string): PropertyValue[] {
            const valueList: any = this.impl.getPropertyValuesLikeSync(value);

            const result: PropertyValue[] = [];
            for (let i: number = 0; i < valueList.sizeSync(); i++) {
                const impl: any = valueList.getSync(i);
                result.push(new PropertyValue(impl.value, impl));
            }

            return result;
        }

        /**
         * Persist a list of {@link Tag}s
         *
         * @param tags the tags to persist
         */
        public async persistTags(tags: Tag[]): Promise<void> {
            const javaTags: any[] = tags.map(t => t.toJavaValue());
            const tagList = await promisify(Arrays.asList.bind(Arrays))(...javaTags);

            await java_callMethod(this.impl, "persistTags", tagList);
        }

        /**
         * Persist a list of {@link PropertyValueSet}s
         *
         * @param propertyValues the sets to persist
         */
        public async persistPropertyValueSets(propertyValues: PropertyValueSet[]): Promise<void> {
            const javaValues: any[] = propertyValues.map(p => p.toJavaValue());
            const valueList = await promisify(Arrays.asList.bind(Arrays))(...javaValues);

            await java_callMethod(this.impl, "persistPropertyValueSets", valueList);
        }

        /**
         * Persist a document
         *
         * @param document the document to persist
         */
        public async persistDocument(document: Document): Promise<void> {
            const javaDocument = document.toJavaValue();
            await java_callMethod(this.impl, "persistDocument", javaDocument);
        }

        /**
         * Close the database connection
         */
        public async close(): Promise<void> {
            await java_callMethod(this.impl, "close");
        }

        /**
         * Set the database info
         *
         * @return whether the operation was successful
         * @private
         */
        private async setDatabaseInfo(): Promise<boolean> {
            const info: DatabaseInfo = await this.getDatabaseInfo();
            if (info != null) {
                this.databaseInfo = info;
                return true;
            } else {
                return false;
            }
        }

        /**
         * Get the database info
         *
         * @return the retrieved database info
         */
        public async getDatabaseInfo(): Promise<DatabaseInfo> {
            const impl: any = await java_callMethod(this.impl, "getDatabaseInfo");

            if (impl != null) {
                return new DatabaseInfo(impl);
            } else {
                return null;
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
        const provider = await SQLiteProvider.create(databaseFile, action, showSQL);
        const em = await CustomPersistence.createEntityManager("documents", provider);
        return await database.DatabaseManager.create(em);
    }
}