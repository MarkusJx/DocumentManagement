// This file contains proxy classes for java types.
// Proxy classes are just class definitions for
// classes to be generated by @markusjx/java.
// Any class in here must not be instantiated, as
// this call will fail since these classes have no
// real definition until imported from java.

import {JavaClass} from "@markusjx/java";
import {Action, database, EntityManager,} from "./databaseWrapper";
import javaTypes from "./javaTypes";

/**
 * A local date proxy
 */
export declare class LocalDateProxy extends JavaClass {
    /**
     * Parse a date string
     *
     * @param date the date string to parse
     * @return the parsed local date
     */
    public static parse(date: string): Promise<LocalDateProxy>;

    /**
     * Parse a date string.
     * Sync call.
     *
     * @param date the date string to parse
     * @return the parsed local date
     */
    public static parseSync(date: string): LocalDateProxy;

    /**
     * Convert a this local date to a date string
     *
     * @return the date string
     */
    public toString(): Promise<string>;

    /**
     * Convert a this local date to a date string.
     * Sync call.
     *
     * @return the date string
     */
    public toStringSync(): string;
}

/**
 * The java logger
 */
export declare class LoggerProxy extends JavaClass {
    /**
     * Configure the logger
     *
     * @param logToConsole whether to log to the console
     * @param logToFile whether to log to a file
     */
    public static configureLogger(logToConsole: boolean, logToFile: boolean): Promise<void>;
}

/**
 * The hibernate creation action.
 * The following information is from the
 * org.hibernate.tool.schema.Action.java file.
 */
export declare class ActionProxy extends JavaClass {
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

/**
 * A persistence provider
 */
export declare abstract class PersistenceProvider extends JavaClass {
}

/**
 * A SQLite persistence provider
 */
export declare class SQLiteProviderClass extends PersistenceProvider {
    /**
     * Create a {@link SQLiteProviderClass}
     *
     * @param databaseFile the database file
     * @param action the database creation action
     * @param showSQL whether to show the generated sql commands
     * @param classNames the names of the classes. Should be empty.
     */
    public static newInstance(databaseFile: string, action: Action, showSQL: boolean, classNames: string[]): Promise<SQLiteProviderClass>;
}

/**
 * A MySQL persistence provider
 */
export declare class MySQLProviderProxy extends PersistenceProvider {
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
    public static newInstance(url: string, user: string, password: string, action: Action, showSQL: boolean, classNames: string[]): Promise<MySQLProviderProxy>;
}

/**
 * A MariaDB persistence provider
 */
export declare class MariaDBProviderProxy extends PersistenceProvider {
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
    public static newInstance(url: string, user: string, password: string, action: Action, showSQL: boolean, classNames: string[]): Promise<MySQLProviderProxy>;
}

/**
 * A wrapper around io.github.markusjx.datatypes.ChainedHashMap
 */
export declare class JavaChainedHashMapProxy extends JavaClass {
    /**
     * Create a {@link JavaChainedHashMapProxy} from a string array
     *
     * @param array the string array
     * @return the resulting map
     */
    public static fromStringArray(array: string[]): Promise<JavaChainedHashMapProxy>;
}

export declare class FileScannerProxy extends JavaClass {
    /**
     * Create a new {@link FileScannerProxy}
     *
     * @param source the source directory
     */
    public constructor(source: string);

    /**
     * Scan through the directory tree
     *
     * @return the source directory
     */
    public scan(): Promise<DirectoryProxy>;
}

/**
 * A property value set proxy
 */
export declare class PropertyValueSetProxy extends JavaClass {
    /**
     * Create a property value set from a property and property value.
     * Either both values must be set or neither may be passed.
     *
     * @param property the property to store
     * @param propertyValue the property value to store
     */
    public constructor(property?: database.Property, propertyValue?: database.PropertyValue);

    /**
     * Get the stored property
     */
    public get property(): database.Property;

    /**
     * Get the stored property value
     */
    public get propertyValue(): database.PropertyValue;

    /**
     * Equals check
     *
     * @param other the other class to check if it matches this
     */
    public equals(other: JavaClass): Promise<boolean>;

    /**
     * Equals check. Sync call.
     *
     * @param other the other class to check if it matches this
     */
    public equalsSync(other: JavaClass): boolean;
}

/**
 * A property proxy
 */
export declare class PropertyProxy extends JavaClass {
    /**
     * Create a property.
     * May have a name or it maybe doesn't have one.
     * If no name is passed, this property is seen as invalid.
     *
     * @param name the property name
     */
    public constructor(name?: string);

    /**
     * Get the property name
     */
    public get name(): string;

    /**
     * Get the property values associated with this property
     */
    public get values(): javaTypes.List<PropertyValueProxy>;
}

/**
 * A property value proxy
 */
export declare class PropertyValueProxy extends JavaClass {
    /**
     * Create a property value.
     * If no name is passed, this property is seen as invalid.
     *
     * @param name the property name
     */
    public constructor(name?: string);

    /**
     * Get the property value
     */
    public get value(): string;
}

/**
 * A tag proxy
 */
export declare class TagProxy extends JavaClass {
    /**
     * Create a tag proxy.
     * Either a name for the tag, a tag to copy or nothing
     * may be passed as an argument.
     *
     * @param name the tag name or tag instance to copy
     */
    public constructor(name?: string | TagProxy);

    /**
     * Get the tag name
     */
    public get name(): string;

    /**
     * Equals check
     *
     * @param other the other class to check against
     */
    public equals(other: JavaClass): Promise<boolean>;
}

/**
 * A document proxy
 */
export declare class DocumentProxy extends JavaClass {
    /**
     * Create a document proxy
     *
     * @param toCopy the document to copy
     */
    public constructor(toCopy?: DocumentProxy);

    /**
     * Get the file name
     */
    public get filename(): string;

    /**
     * Get the absolute path
     */
    public get absolutePath(): string;

    /**
     * Get the parent path
     */
    public get parentPath(): string;

    /**
     * Get the document's tags
     */
    public get tags(): javaTypes.List<database.Tag>;

    /**
     * Get the document's properties
     */
    public get properties(): javaTypes.List<database.PropertyValueSet>;

    /**
     * Get the document's creation date
     */
    public get creationDate(): LocalDateProxy;

    /**
     * Set the document's creation date
     *
     * @param date the new creation date
     */
    public set creationDate(date: LocalDateProxy);
}

/**
 * The directory proxy
 */
export declare class DirectoryProxy extends JavaClass {
    /**
     * Create a new directory proxy
     *
     * @param toCopy the directory proxy to copy
     * @param name the directory name
     */
    public constructor(toCopy?: DirectoryProxy | string, name?: string);

    /**
     * Get the directory's path
     */
    public get path(): string;

    /**
     * Get the directory's name
     */
    public get name(): string;

    /**
     * Get the documents in the directory
     */
    public get documents(): javaTypes.List<DocumentProxy>;

    /**
     * Get the directories in the directory
     */
    public get directories(): javaTypes.List<DirectoryProxy>;
}

/**
 * The file name filter proxy
 */
export declare class FilenameFilterProxy extends JavaClass {
    /**
     * Create a new file name filter proxy
     *
     * @param filter the filter to copy
     */
    public constructor(filter: FilenameFilterProxy);

    /**
     * Create a new file name filter proxy
     *
     * @param filename the file name to match
     * @param exactMatch whether this should be an exact match
     */
    public static newInstance(filename: string, exactMatch: boolean): Promise<FilenameFilterProxy>;
}

/**
 * A tag filter proxy
 */
export declare class TagFilterProxy extends JavaClass {
    /**
     * Create a new tag filter proxy
     *
     * @param other the tag filter proxy to copy
     */
    public constructor(other: TagFilterProxy);

    /**
     * Create a new tag filter proxy
     *
     * @param tags the tags to search for
     */
    public static newInstance(tags: string[]): Promise<TagFilterProxy>;
}

/**
 * A property filter proxy
 */
export declare class PropertyFilterProxy extends JavaClass {
    /**
     * Create a new property filter proxy
     *
     * @param other the property filter proxy to copy
     */
    public constructor(other: PropertyFilterProxy);

    /**
     * Create a new property filter
     *
     * @param map the properties to match
     */
    public static newInstance(map: JavaChainedHashMapProxy): Promise<PropertyFilterProxy>;
}

/**
 * A date filter proxy
 */
export declare class DateFilterProxy extends JavaClass {
    /**
     * Create a new date filter proxy
     *
     * @param d1 the start date to search for
     * @param d2 the end date to search for
     * @return the created date filter proxy
     */
    public static getByDate(d1: LocalDateProxy, d2: LocalDateProxy): Promise<DateFilterProxy>;
}

/**
 * A document filter proxy
 */
export declare class DocumentFilterProxy extends JavaClass {
    /**
     * Create a new document filter proxy
     *
     * @param other the document filter proxy to copy
     */
    public constructor(other: DocumentFilterProxy);

    /**
     * Create a document filter
     *
     * @param filterList the list of filters to use
     */
    public static createFilter(filterList: database.filters.DocumentFilter[]): Promise<DocumentFilterProxy>;
}

/**
 * A database info proxy
 */
export declare class DatabaseInfoProxy extends JavaClass {
    /**
     * Create a new database info proxy
     *
     * @param source the source directory
     */
    public constructor(source?: string);

    /**
     * Get the source path
     */
    public get sourcePath(): string;

    /**
     * Set the source path
     */
    public set sourcePath(path: string);
}

/**
 * The database manager proxy class
 */
export declare class DatabaseManagerProxy extends JavaClass {
    /**
     * Create a new database manager instance
     *
     * @param other the database manager to copy (only gets its reference)
     */
    public constructor(other: DatabaseManagerProxy);

    /**
     * Create a new database manager instance
     *
     * @param manager the entity manager to use
     */
    public static newInstance(manager: EntityManager): Promise<DatabaseManagerProxy>;

    /**
     * Get the number of rows in a filter query
     *
     * @param filter the filter to use
     * @return the number of rows
     */
    public getNumDocumentsBy(filter: database.DocumentFilter): Promise<BigInt>

    /**
     * Get the number of documents in a directory but not in the database
     *
     * @param directory the directory to match
     * @return the number of matching documents
     */
    public getDocumentsNotIn(directory: DirectoryProxy): Promise<number>;

    /**
     * Get the number of directories in another directory but not in the database
     *
     * @param directory the directory to match
     * @return the number of matching directories
     */
    public getDirectoriesNotIn(directory: DirectoryProxy): Promise<number>;

    /**
     * Synchronize a directory
     *
     * @param directory the directory to sync with
     * @param sourcePath the path to the source directory
     * @return true if the operation was successful
     */
    public synchronizeDirectory(directory: DirectoryProxy, sourcePath: string): Promise<boolean>;

    /**
     * Get all properties with a name like name
     *
     * @param name the name to search for
     * @return the properties with a name like name
     */
    public getPropertiesLikeSync(name: string): javaTypes.List<database.Property>;

    /**
     * Check if a tag exists
     *
     * @param name the tag name
     * @return true if the tag exists
     */
    public tagExistsSync(name: string): boolean;

    /**
     * Get all tags with a name like name
     *
     * @param name the name to search for
     * @return the list of tags
     */
    public getTagsLikeSync(name: string): javaTypes.List<database.Tag>;

    /**
     * Get all property values with a value like value
     *
     * @param value the value to search for
     * @return the property values
     */
    public getPropertyValuesLikeSync(value: string): javaTypes.List<database.PropertyValue>;

    /**
     * Check if a property exists
     *
     * @param value the property to check
     * @return true if the property exists
     */
    public propertyExists(value: string): Promise<boolean>;

    /**
     * Check if a property value exists
     *
     * @param value the property value to check
     * @return true if the property value exists
     */
    public propertyValueExists(value: string): Promise<boolean>;

    /**
     * Get the database info
     *
     * @return the retrieved database info
     */
    public getDatabaseInfo(): Promise<database.DatabaseInfo>;

    /**
     * Close the database connection
     */
    public close(): Promise<void>;

    /**
     * Persist a document
     *
     * @param document the document to persist
     */
    public persistDocument(document: DocumentProxy): Promise<void>;

    /**
     * Copy the database of this database manager to another database
     *
     * @param toCopyTo the database manager managing the database to copy to
     * @return true if the operation was successful
     */
    public copyDatabaseTo(toCopyTo: database.DatabaseManager): Promise<boolean>;

    /**
     * Clear the entity manager
     */
    public clear(): Promise<void>;

    /**
     * Persist a list of {@link Tag}s
     *
     * @param tags the tags to persist
     */
    public persistTags(tags: javaTypes.List<database.Tag>): Promise<void>;

    /**
     * Persist a list of {@link PropertyValueSet}s
     *
     * @param propertyValues the sets to persist
     */
    public persistPropertyValueSets(propertyValues: javaTypes.List<database.PropertyValueSet>): Promise<void>;

    /**
     * Persist a directory
     *
     * @param directory the directory to persist
     * @param sourcePath the source path of the directory
     * @return true of the operation was successful
     * @protected
     */
    protected persistDirectory(directory: DirectoryProxy, sourcePath: string): Promise<boolean>;

    /**
     * Get all documents by a {@link DocumentFilter},
     * Returns a list of documents sorted by the
     * calculated filter accuracy.
     *
     * @param filter the filters
     * @param offset the elements in the result list to skip
     * @return the retrieved documents
     */
    protected getDocumentsBy(filter: database.DocumentFilter, offset: number): Promise<javaTypes.List<DocumentProxy>>;

    /**
     * Get a directory element by a path
     *
     * @param path the path of the directory
     * @return the retrieved directory
     */
    protected getDirectory(path: string): Promise<DirectoryProxy>;
}