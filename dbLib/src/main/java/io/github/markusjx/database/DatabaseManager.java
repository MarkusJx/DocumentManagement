package io.github.markusjx.database;

import io.github.markusjx.database.filter.DocumentFilter;
import io.github.markusjx.database.types.*;
import io.github.markusjx.datatypes.ChainedHashMap;
import io.github.markusjx.datatypes.DocumentSearchResult;
import io.github.markusjx.util.DatabaseUtils;
import io.github.markusjx.util.ListUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.persistence.EntityManager;
import javax.persistence.EntityNotFoundException;
import javax.persistence.criteria.CriteriaBuilder;
import javax.persistence.criteria.CriteriaQuery;
import java.sql.PreparedStatement;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;

/**
 * A class for managing the database
 */
public class DatabaseManager {
    private static final Logger logger = LoggerFactory.getLogger(DatabaseManager.class);

    /**
     * The maximum amount of search results for fuzzy searches
     */
    private static final int FUZZY_SEARCH_MAX_RESULTS = 25;

    /**
     * The maximum input array length for sql operation.
     * This is required as SQLite only allows 1000 up to
     * parameters in one operation
     */
    private static final int MAX_INPUT_ARRAY_LENGTH = 1000;

    /**
     * The entity manager instance
     */
    private final EntityManager manager;

    /**
     * Create a new DocumentManager instance
     *
     * @param manager the entity manager to use
     */
    public DatabaseManager(EntityManager manager) {
        Objects.requireNonNull(manager);
        this.manager = manager;
        logger.info("Creating the database manager");
    }

    @SuppressWarnings("unused")
    public DatabaseManager(DatabaseManager other) {
        this.manager = other.manager;
    }

    /**
     * Convert an array of tag names into an array of tags
     *
     * @param tagNames the tag names array
     * @return the tag array
     */
    private Tag[] convertTagName(String[] tagNames) {
        // Create the output array
        Tag[] tags = new Tag[tagNames.length];
        for (int i = 0; i < tagNames.length; i++) {
            // If the tag does not exist, create it
            tags[i] = getTagByName(tagNames[i]);
            if (tags[i] == null) {
                tags[i] = createTag(tagNames[i], false);
            }
        }

        return tags;
    }

    /**
     * Create a new document and persist it
     *
     * @param filename     the name of the document file
     * @param path         the path of the document
     * @param properties   the document properties. Will be created if not existing
     * @param creationDate the document creation date
     * @param tagNames     the tag names. Will be created if not existing
     */
    public synchronized void createDocument(String filename, String path, ChainedHashMap<String, String> properties, LocalDate creationDate, String... tagNames) {
        manager.getTransaction().begin();
        // Create a PropertyValueSet list
        List<PropertyValueSet> propList = new ArrayList<>();
        for (Map.Entry<String, List<String>> e : properties.entrySet()) {
            for (String v : e.getValue()) {
                // The property value
                PropertyValueSet pvs = createPropertyValueSet(e.getKey(), v);

                // Add the property value set to the list
                propList.add(pvs);
            }
        }

        // Convert the tag names to an tag array
        Tag[] tags = convertTagName(tagNames);

        // Create a new document
        Document doc = new Document(filename, path, propList, creationDate, tags);

        // Persist the document
        manager.persist(doc);
        manager.getTransaction().commit();
    }

    /**
     * Get all {@link Tag}s both in a list and the database
     *
     * @param tags the {@link Tag}s to search for
     * @return the overlapping tags
     */
    public synchronized List<Tag> getAllTagsIn(final List<Tag> tags) {
        List<Tag> result = new ArrayList<>();
        for (List<Tag> limited : ListUtils.partition(tags, MAX_INPUT_ARRAY_LENGTH)) {
            result.addAll(manager.createQuery("select t from Tag as t where t in :tags", Tag.class)
                    .setParameter("tags", limited)
                    .getResultList());
        }

        return result;
    }

    /**
     * Persist a list of {@link Tag}s
     *
     * @param tags the {@link Tag}s to persist
     * @return true, if the operation was successful
     */
    public synchronized boolean persistTags(final List<Tag> tags) {
        // Get all tags already in the database
        List<Tag> toRemove;
        try {
            toRemove = getAllTagsIn(tags);
        } catch (Exception e) {
            logger.error("Could not get all tags in both in the database and a list", e);
            return false;
        }

        // Remove all tags already in the database
        final List<Tag> ts = ListUtils.removeAll(tags, toRemove, true, true);
        if (ts.isEmpty()) return true;

        // Insert the tags manually into the database
        return DatabaseUtils.doSessionWork(manager, connection -> {
            for (List<Tag> limited : ListUtils.partition(ts, MAX_INPUT_ARRAY_LENGTH)) {
                PreparedStatement statement = connection.prepareStatement("INSERT INTO Tag(name) values (?)");
                for (Tag t : limited) {
                    statement.setString(1, t.name);
                    statement.addBatch();
                }

                statement.executeBatch();
            }
        });
    }

    /**
     * Get all properties both in a list and the database
     *
     * @param properties the properties to search for
     * @return the overlapping properties
     */
    public synchronized List<Property> getAllPropertiesIn(final List<Property> properties) {
        List<Property> result = new ArrayList<>();
        for (List<Property> limited : ListUtils.partition(properties, MAX_INPUT_ARRAY_LENGTH)) {
            result.addAll(manager.createQuery("select p from Property p where p in :props", Property.class)
                    .setParameter("props", limited)
                    .getResultList());
        }

        return result;
    }

    /**
     * Persist a list of properties
     *
     * @param properties the properties to persist
     * @param merge      whether to merge rather than persist
     * @return true, if the operation was successful
     */
    public synchronized boolean persistProperties(final List<Property> properties, boolean merge) {
        // Get all already inserted properties
        List<Property> toRemove;
        try {
            toRemove = getAllPropertiesIn(properties);
        } catch (Exception e) {
            logger.error("Could not get all properties both in a list and the database", e);
            return false;
        }

        // Remove all already persisted properties
        final List<Property> ps = ListUtils.removeAll(properties, toRemove, true, true);
        if (ps.isEmpty()) return true;

        // Persist all properties
        manager.getTransaction().begin();
        for (Property p : ps) {
            if (merge) {
                manager.merge(p);
            } else {
                manager.persist(p);
            }
        }
        manager.getTransaction().commit();

        return true;
    }

    /**
     * Get all {@link PropertyValue}s both in a list and the database
     *
     * @param propertyValues the values to search for
     * @return the overlapping values
     */
    public synchronized List<PropertyValue> getAllPropertyValuesIn(final List<PropertyValue> propertyValues) {
        List<PropertyValue> result = new ArrayList<>();
        for (List<PropertyValue> limited : ListUtils.partition(propertyValues, MAX_INPUT_ARRAY_LENGTH)) {
            result.addAll(manager.createQuery("select pv from PropertyValue as pv where pv in :values", PropertyValue.class)
                    .setParameter("values", limited)
                    .getResultList());
        }

        return result;
    }

    /**
     * Persist multiple {@link PropertyValue}s
     *
     * @param propertyValues the {@link PropertyValue}s to persist
     * @return whether the operation was successful
     */
    public synchronized boolean persistPropertyValues(final List<PropertyValue> propertyValues) {
        // Get all already existing property values
        List<PropertyValue> toRemove;
        try {
            toRemove = getAllPropertyValuesIn(propertyValues);
        } catch (Exception e) {
            logger.error("Could not get all property values both in a list and the database", e);
            return false;
        }

        // Remove all already existing property values
        final List<PropertyValue> ps = ListUtils.removeAll(propertyValues, toRemove, true, true);
        if (ps.isEmpty()) return true;

        // Insert the values manually
        return DatabaseUtils.doSessionWork(manager, connection -> {
            for (List<PropertyValue> limited : ListUtils.partition(ps, MAX_INPUT_ARRAY_LENGTH)) {
                PreparedStatement statement = connection.prepareStatement("INSERT INTO PropertyValue(value) values (?)");
                for (PropertyValue p : limited) {
                    statement.setString(1, p.value);
                    statement.addBatch();
                }

                statement.executeBatch();
            }
        });
    }

    /**
     * Persist property value sets
     *
     * @param sets the property value sets to persist
     * @return whether the operation was successful
     */
    @SuppressWarnings("unused")
    public synchronized boolean persistPropertyValueSets(final List<PropertyValueSet> sets) {
        ChainedHashMap<Property, PropertyValue> map = new ChainedHashMap<>();
        List<PropertyValue> propertyValues = new ArrayList<>(sets.size());

        for (PropertyValueSet set : sets) {
            if (set.property != null && set.property.name != null && !set.property.name.isEmpty() &&
                    set.propertyValue != null && set.propertyValue.value != null &&
                    !set.propertyValue.value.isEmpty()) {
                map.putValue(set.property, set.propertyValue);
                propertyValues.add(set.propertyValue);
            }
        }

        List<Property> properties = new ArrayList<>();
        for (Map.Entry<Property, List<PropertyValue>> e : map.entrySet()) {
            properties.add(new Property(e.getKey(), e.getValue()));
        }

        return persistPropertyValues(propertyValues) && persistProperties(properties, false);
    }

    /**
     * Get all documents that are both in a list and the database
     *
     * @param documents the documents to search for
     * @return the overlapping documents
     */
    public synchronized List<Document> getAllDocumentsIn(final List<Document> documents) {
        List<Document> result = new ArrayList<>();

        for (final List<Document> list : ListUtils.partition(documents, MAX_INPUT_ARRAY_LENGTH)) {
            result.addAll(manager.createQuery("select d from Document as d where d in :docs", Document.class)
                    .setParameter("docs", list)
                    .getResultList());
        }

        return result;
    }

    /**
     * Persist a list of documents
     *
     * @param documents the documents to persist
     * @return true, if the operation was successful
     */
    public synchronized boolean persistDocuments(List<Document> documents) {
        return persistDocuments(documents, false);
    }

    /**
     * Persist a list of documents
     *
     * @param documents the documents to persist
     * @param merge     whether to merge rather than persist
     * @return true, if the operation was successful
     */
    public synchronized boolean persistDocuments(List<Document> documents, boolean merge) {
        List<Tag> tags = new ArrayList<>();
        List<Property> properties = new ArrayList<>();
        List<PropertyValue> propertyValues = new ArrayList<>();

        // Get all tags, properties and property values from the documents
        DatabaseUtils.copyPropsAndTags(documents, tags, properties, propertyValues);

        // Persist the tags, properties and property values
        if (!persistTags(tags)) return false;
        if (!persistProperties(properties, merge)) return false;
        if (!persistPropertyValues(propertyValues)) return false;

        // Get all documents already existing in the database
        // and also existing in the list of documents to persist
        List<Document> toRemove;
        try {
            toRemove = getAllDocumentsIn(documents);
        } catch (Exception e) {
            logger.error("Could not get all documents both in a list and the database", e);
            return false;
        }

        // Remove all documents already existing in the database
        documents = ListUtils.removeAll(documents, toRemove, true, true);
        if (documents.isEmpty()) {
            logger.debug("The document list was empty after removing all documents already in the database");
            return true;
        }

        // Start a transaction and persist all documents
        try {
            manager.getTransaction().begin();
            for (Document d : documents) {
                if (merge) {
                    manager.merge(d);
                } else {
                    manager.persist(d);
                }
            }
            manager.flush();
            manager.getTransaction().commit();
        } catch (Exception e) {
            logger.error("Could not persist the documents", e);
            return false;
        }

        logger.info("Successfully persisted {} documents", documents.size());
        return true;
    }

    /**
     * Persist a document
     *
     * @param document the document to persist
     */
    @SuppressWarnings("unused")
    public synchronized void persistDocument(Document document) {
        manager.getTransaction().begin();
        manager.merge(document);
        manager.getTransaction().commit();
    }

    /**
     * Get all directories in the database matching those in the given list
     *
     * @param directories the directories to search for
     * @return the overlapping directories
     */
    public synchronized List<Directory> getAllDirectoriesIn(final List<Directory> directories) {
        List<Directory> result = new ArrayList<>();
        for (List<Directory> limited : ListUtils.partition(directories, MAX_INPUT_ARRAY_LENGTH)) {
            result.addAll(manager.createQuery("select d from Directory as d where d in :dirs", Directory.class)
                    .setParameter("dirs", limited)
                    .getResultList());
        }

        return result;
    }

    /**
     * Persist a list of Directories
     *
     * @param directories the directories to persist
     * @return true, if the operation was successful
     */
    public synchronized boolean persistDirectories(List<Directory> directories) {
        return this.persistDirectories(directories, false);
    }

    /**
     * Persist a list of Directories
     *
     * @param directories the directories to persist
     * @param copy        whether to copy the directories before persisting
     * @return true, if the operation was successful
     */
    public synchronized boolean persistDirectories(List<Directory> directories, boolean copy) {
        List<Directory> toRemove;
        try {
            toRemove = getAllDirectoriesIn(directories);
        } catch (Exception e) {
            logger.error("Could not get all directories both in a list and the database:", e);
            return false;
        }

        // Remove all already existing directories
        directories = ListUtils.removeAll(directories, toRemove, true, true);

        // Begin a transaction and persist the directories
        try {
            manager.getTransaction().begin();
            for (Directory d : directories) {
                if (copy) {
                    manager.persist(new Directory(d));
                } else {
                    manager.persist(d);
                }
            }
            manager.flush();
            manager.getTransaction().commit();
        } catch (Exception e) {
            logger.error("Could not persist the directories", e);
            return false;
        }

        return true;
    }

    /**
     * Get the {@link DatabaseInfo} for this database
     *
     * @return the retrieved {@link DatabaseInfo}
     */
    @SuppressWarnings("unused")
    public synchronized DatabaseInfo getDatabaseInfo() {
        try {
            return manager.find(DatabaseInfo.class, 0);
        } catch (Exception e) {
            logger.error("Could not get the database info:", e);
            return null;
        }
    }

    /**
     * Persist a {@link DatabaseInfo} instance
     *
     * @param info the {@link DatabaseInfo} to persist
     * @return true, if the operation was successful
     */
    public synchronized boolean persistDatabaseInfo(DatabaseInfo info) {
        try {
            manager.getTransaction().begin();
            manager.persist(info);
            manager.getTransaction().commit();
            return true;
        } catch (Exception e) {
            logger.error("Could not persist the database info", e);
            return false;
        }
    }

    /**
     * Persist a directory, its subdirectory and all stored files
     *
     * @param directory  the directory to persist
     * @param sourcePath the source path of the directory
     * @return whether all objects could be persisted
     */
    public synchronized boolean persistDirectory(Directory directory, String sourcePath) {
        return persistDatabaseInfo(new DatabaseInfo(sourcePath)) &&
                persistDocuments(directory.getAllDocuments()) &&
                persistDirectories(directory.getAllDirectories());
    }

    /**
     * Get the number of documents in a directory but not in the database
     *
     * @param directory the directory to match
     * @return the number of matching documents
     */
    @SuppressWarnings("unused")
    public synchronized long getDocumentsNotIn(Directory directory) {
        try {
            final List<Document> documents = directory.getAllDocuments();
            long res = 0;

            for (List<Document> docs : ListUtils.partition(documents, 1000)) {
                res += manager.createQuery("select count(d) from Document d where d in :docs", Long.class)
                        .setParameter("docs", docs)
                        .getSingleResult();
            }

            return manager.createQuery("select count(d) from Document d", Long.class)
                    .getSingleResult() - res;
        } catch (Exception e) {
            logger.error("Could not get the documents not in a directory:", e);
            return -1;
        }
    }

    /**
     * Get the number of directories in another directory but not in the database
     *
     * @param directory the directory to match
     * @return the number of matching directories
     */
    @SuppressWarnings("unused")
    public synchronized long getDirectoriesNotIn(Directory directory) {
        try {
            final List<Directory> directories = directory.getAllDirectories();
            long res = 0;

            for (List<Directory> dirs : ListUtils.partition(directories, 1000)) {
                res += manager.createQuery("select count(d) from Directory d where d in :dirs", Long.class)
                        .setParameter("dirs", dirs)
                        .getSingleResult();
            }

            return manager.createQuery("select count(d) from Directory d", Long.class)
                    .getSingleResult() - res;
        } catch (Exception e) {
            logger.error("Could not get the directories not in a directory:", e);
            return -1;
        }
    }

    /**
     * Copy all properties and tags from the documents in the database into {@code documents}
     *
     * @param documents the list of documents to copy to
     * @return {@code documents}
     */
    private synchronized List<Document> copyPropertiesAndTags(List<Document> documents) {
        for (Document document : documents) {
            Document toCopy = manager.getReference(Document.class, document.absolutePath);

            try {
                if (toCopy.properties != null) {
                    for (PropertyValueSet pvs : toCopy.properties) {
                        document.properties.add(new PropertyValueSet(pvs));
                    }
                }

                if (toCopy.tags != null) {
                    for (Tag tag : toCopy.tags) {
                        document.tags.add(new Tag(tag));
                    }
                }
            } catch (EntityNotFoundException ignored) {
                // The entity is not in the database,
                // continue without updating the current document
            }
        }

        return documents;
    }

    /**
     * Synchronize a directory
     *
     * @param directory  the directory to sync with
     * @param sourcePath the path od the source directory
     * @return true if the operation was successful
     */
    @SuppressWarnings("unused")
    public synchronized boolean synchronizeDirectory(Directory directory, String sourcePath) {
        try {
            final List<Directory> directories = directory.getAllDirectories();
            final List<Document> documents = copyPropertiesAndTags(directory.getAllDocuments());
            logger.info("Synchronizing {} documents and {} directories", documents.size(), directories.size());

            this.clear();

            manager.getTransaction().begin();
            logger.info("Removing all documents from the database");
            manager.createQuery("delete from Document").executeUpdate();

            logger.info("Removing all directories from the database");
            manager.createQuery("delete from Directory").executeUpdate();

            logger.info("Updating the database info");
            manager.merge(new DatabaseInfo(sourcePath));
            manager.getTransaction().commit();

            logger.info("Successfully removed all directories from the database");
            logger.info("Persisting all documents and directories");

            if (persistDocuments(documents) && persistDirectories(directories)) {
                logger.info("Done persisting all documents and directories");
                this.clear();
                logger.info("Done");
                return true;
            } else {
                logger.error("Could not persist the documents or the directories");
                return false;
            }
        } catch (Exception e) {
            logger.error("Could not synchronize the directory:", e);
            return false;
        }
    }

    /**
     * Copy the database of this database manager to another database
     *
     * @param toCopyTo the database manager managing the database to copy to
     * @return true if the operation was successful
     */
    @SuppressWarnings("unused")
    public synchronized boolean copyDatabaseTo(final DatabaseManager toCopyTo) {
        try {
            logger.info("Copying the database to another database");
            boolean ok = toCopyTo.persistDatabaseInfo(this.getDatabaseInfo());
            if (!ok) {
                logger.error("Could not persist the database info");
                return false;
            }

            ok = toCopyTo.persistDocuments(manager.createQuery("select d from Document as d", Document.class)
                    .getResultList(), true);
            if (!ok) {
                logger.error("Could not persist the documents");
                return false;
            }

            ok = toCopyTo.persistDirectories(manager.createQuery("select d from Directory as d", Directory.class)
                    .getResultList(), true);
            if (!ok) {
                logger.error("Could not persist the directories");
                return false;
            } else {
                logger.info("Successfully copied the database");
                return true;
            }
        } catch (Exception e) {
            logger.error("Could not copy the database:", e);
            return false;
        }
    }

    /**
     * Get a directory element by a path
     *
     * @param path the path of the directory
     * @return the retrieved directory
     */
    @SuppressWarnings("unused")
    public synchronized Directory getDirectory(String path) {
        try {
            return manager.find(Directory.class, path);
        } catch (Exception e) {
            logger.error("Could not get a directory by its path", e);
            return null;
        }
    }

    /**
     * Create a new Tag and persist it
     *
     * @param name the tag name
     * @return the created tag instance
     */
    public synchronized Tag createTag(String name) {
        Tag t = new Tag(name);

        // Persist the tag
        manager.getTransaction().begin();
        manager.persist(t);
        manager.getTransaction().commit();

        return t;
    }

    /**
     * Create a {@link Tag} and persist it
     *
     * @param name              the name of the tag
     * @param singleTransaction whether to begin and commit a new transaction
     * @return the newly created tag
     */
    public synchronized Tag createTag(String name, boolean singleTransaction) {
        if (singleTransaction) {
            return createTag(name);
        } else {
            Tag t = new Tag(name);
            manager.persist(t);

            return t;
        }
    }

    /**
     * Create a new Property and persist it
     *
     * @param name the name of the property
     */
    public synchronized void createProperty(String name) {
        Property p = new Property(name);

        // Persist the property
        manager.getTransaction().begin();
        manager.persist(p);
        manager.getTransaction().commit();
    }

    /**
     * Create a property value set.
     * Creates a new {@link Property} and/or {@link PropertyValue} if not existing.
     * Adds the {@link PropertyValue} to the {@link Property} if not already done.
     * If all requested values exist, the {@link PropertyValueSet} is just retrieved from the io.github.markusjx.database.
     *
     * @param property the property name
     * @param value    the property value
     * @return the created {@link PropertyValueSet}
     */
    public synchronized PropertyValueSet createPropertyValueSet(String property, String value) {
        Property p = manager.getReference(Property.class, property);
        PropertyValue pv;

        try {
            pv = manager.getReference(PropertyValue.class, value).get();
        } catch (Exception ignored) {
            pv = new PropertyValue(value);
        }

        try {
            p.addValue(pv);
        } catch (Exception ignored) {
            p = new Property(property, pv);
        }

        // Return the property value set
        return new PropertyValueSet(p, pv);
    }

    /**
     * Get a tag by its name
     *
     * @param name the name of the tag
     * @return the found tag or null if not found
     */
    public synchronized Tag getTagByName(String name) {
        try {
            return manager.find(Tag.class, name);
        } catch (Exception e) {
            logger.error("Could not get a tag by its name", e);
            return null;
        }
    }

    /**
     * Check if a tag exists
     *
     * @param name the name of the tag
     * @return whether the tag exists
     */
    @SuppressWarnings("unused")
    public synchronized boolean tagExists(String name) {
        return manager.createQuery("select distinct count(t) from Tag as t where t.name = :name", Long.class)
                .setParameter("name", name)
                .getSingleResult() > 0;
    }

    /**
     * Get all tags like
     *
     * @param name the name of the tag
     * @return the tags similar to the name
     */
    @SuppressWarnings("unused")
    public synchronized List<Tag> getTagsLike(String name) {
        return manager.createQuery("select t from Tag as t where t.name like :name", Tag.class)
                .setParameter("name", name + '%')
                .setMaxResults(FUZZY_SEARCH_MAX_RESULTS)
                .getResultList();
    }

    /**
     * Get a {@link Property} by a name
     *
     * @param name the name of the property to search for
     * @return the property
     */
    public synchronized Property getPropertyByName(String name) {
        try {
            return manager.find(Property.class, name);
        } catch (Exception e) {
            logger.error("Could not get a property by its name", e);
            return null;
        }
    }

    /**
     * Get all properties like a value
     *
     * @param name the name of the property to search for
     * @return the properties similar to name
     */
    @SuppressWarnings("unused")
    public synchronized List<Property> getPropertiesLike(String name) {
        return manager.createQuery("select p from Property as p where p.name like :name", Property.class)
                .setParameter("name", name + '%')
                .setMaxResults(FUZZY_SEARCH_MAX_RESULTS)
                .getResultList();
    }

    /**
     * Gat all property values like a value
     *
     * @param value the value of the property value to search for
     * @return the properties with a value similar to {@code value}
     */
    @SuppressWarnings("unused")
    public synchronized List<PropertyValue> getPropertyValuesLike(String value) {
        return manager.createQuery("select p from PropertyValue as p where p.value like :value", PropertyValue.class)
                .setParameter("value", value + '%')
                .setMaxResults(FUZZY_SEARCH_MAX_RESULTS)
                .getResultList();
    }

    /**
     * Check if a property exists
     *
     * @param value the property to check
     * @return true if the property exists
     */
    @SuppressWarnings("unused")
    public synchronized boolean propertyExists(String value) {
        return manager.find(Property.class, value) != null;
    }

    /**
     * Check if a property value exists
     *
     * @param value the property value to check
     * @return true if the property value exists
     */
    @SuppressWarnings("unused")
    public synchronized boolean propertyValueExists(String value) {
        return manager.find(PropertyValue.class, value) != null;
    }

    /**
     * Get all documents by a {@link DocumentFilter},
     * Returns a list of documents sorted by the
     * calculated filter accuracy.
     *
     * @param filter the filters
     * @param offset the elements in the result list to skip
     * @return the retrieved documents
     */
    public synchronized List<Document> getDocumentsBy(DocumentFilter filter, int offset) {
        CriteriaBuilder cb = manager.getCriteriaBuilder();
        CriteriaQuery<Document> query = filter.getFilterRequest(cb);

        // Create the query and use streams to convert and sort the results
        return manager.createQuery(query)
                .setFirstResult(offset)
                .setMaxResults(100)
                .getResultList()
                .stream()
                .map(d -> new DocumentSearchResult(d, filter.getFilters()))
                .map(d -> d.document)
                .collect(Collectors.toList());
    }

    /**
     * Get the number of rows in a filter query
     *
     * @param filter the filter
     * @return the number of rows
     */
    @SuppressWarnings("unused")
    public synchronized long getNumDocumentsBy(DocumentFilter filter) {
        try {
            var cb = manager.getCriteriaBuilder();
            CriteriaQuery<Long> query = filter.getFilterRequestCount(cb);

            return manager.createQuery(query).getSingleResult();
        } catch (Exception e) {
            logger.error("Could not get the number of documents by a filer", e);
            return 0;
        }
    }

    /**
     * Clear the entity manager
     */
    public synchronized void clear() {
        logger.info("Clearing the entity manager");
        this.manager.clear();
    }

    /**
     * Close the database connection
     */
    @SuppressWarnings("unused")
    public synchronized void close() {
        logger.info("Closing the database manager");
        this.manager.clear();
        this.manager.close();
    }
}
