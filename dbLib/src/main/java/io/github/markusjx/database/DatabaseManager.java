package io.github.markusjx.database;

import io.github.markusjx.database.databaseTypes.*;
import io.github.markusjx.database.filter.DocumentFilter;
import io.github.markusjx.datatypes.ChainedHashMap;
import io.github.markusjx.datatypes.DocumentSearchResult;
import io.github.markusjx.util.DatabaseUtils;
import io.github.markusjx.util.ListUtils;

import javax.persistence.EntityManager;
import javax.persistence.FlushModeType;
import javax.persistence.criteria.CriteriaBuilder;
import javax.persistence.criteria.CriteriaQuery;
import java.sql.PreparedStatement;
import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

/**
 * A class for managing the database
 */
public class DatabaseManager {
    /**
     * The entity manager instance
     */
    private final EntityManager manager;

    /**
     * The maximum amount of search results for fuzzy searches
     */
    private final int FUZZY_SEARCH_MAX_RESULTS = 25;

    /**
     * Create a new DocumentManager instance
     *
     * @param manager the entity manager to use
     */
    public DatabaseManager(EntityManager manager) {
        Objects.requireNonNull(manager);
        this.manager = manager;
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
    public void createDocument(String filename, String path, ChainedHashMap<String, String> properties, LocalDate creationDate, String... tagNames) {
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
    public List<Tag> getAllTagsIn(final List<Tag> tags) {
        try {
            return manager.createQuery("select t from Tag as t where t in :tags", Tag.class)
                    .setParameter("tags", tags)
                    .getResultList();
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }

    /**
     * Persist a list of {@link Tag}s
     *
     * @param tags the {@link Tag}s to persist
     * @return true, if the operation was successful
     */
    public boolean persistTags(final List<Tag> tags) {
        // Get all tags already in the database
        List<Tag> toRemove = getAllTagsIn(tags);
        if (toRemove == null) return false;

        // Remove all tags already in the database
        final List<Tag> ts = ListUtils.removeAll(tags, toRemove, true, true);
        if (ts.isEmpty()) return true;

        // Insert the tags manually into the database
        return DatabaseUtils.doSessionWork(manager, connection -> {
            PreparedStatement statement = connection.prepareStatement("INSERT INTO Tag(name) values (?)");
            for (Tag t : ts) {
                statement.setString(1, t.name);
                statement.addBatch();
            }

            statement.executeBatch();
        });
    }

    /**
     * Get all properties both in a list and the database
     *
     * @param properties the properties to search for
     * @return the overlapping properties
     */
    public List<Property> getAllPropertiesIn(final List<Property> properties) {
        try {
            return manager.createQuery("select p from Property as p where p in :props", Property.class)
                    .setParameter("props", properties)
                    .getResultList();
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }

    /**
     * Persist a list of properties
     *
     * @param properties the properties to persist
     * @return true, if the operation was successful
     */
    public boolean persistProperties(final List<Property> properties) {
        // Get all already inserted properties
        List<Property> toRemove = getAllPropertiesIn(properties);
        if (toRemove == null) return false;

        // Remove all already persisted properties
        final List<Property> ps = ListUtils.removeAll(properties, toRemove, true, true);
        if (ps.isEmpty()) return true;

        // Persist all properties
        manager.getTransaction().begin();
        for (Property p : ps) manager.persist(p);
        manager.getTransaction().commit();

        return true;
    }

    /**
     * Get all {@link PropertyValue}s both in a list and the database
     *
     * @param propertyValues the values to search for
     * @return the overlapping values
     */
    public List<PropertyValue> getAllPropertyValuesIn(final List<PropertyValue> propertyValues) {
        try {
            return manager.createQuery("select pv from PropertyValue as pv where pv in :values", PropertyValue.class)
                    .setParameter("values", propertyValues)
                    .getResultList();
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }

    /**
     * Persist multiple {@link PropertyValue}s
     *
     * @param propertyValues the {@link PropertyValue}s to persist
     * @return whether the operation was successful
     */
    public boolean persistPropertyValues(final List<PropertyValue> propertyValues) {
        // Get all already existing property values
        List<PropertyValue> toRemove = getAllPropertyValuesIn(propertyValues);
        if (toRemove == null) return false;

        // Remove all already existing property values
        final List<PropertyValue> ps = ListUtils.removeAll(propertyValues, toRemove, true, true);
        if (ps.isEmpty()) return true;

        // Insert the values manually
        return DatabaseUtils.doSessionWork(manager, connection -> {
            PreparedStatement statement = connection.prepareStatement("INSERT INTO PropertyValue(value) values (?)");
            for (PropertyValue p : ps) {
                statement.setString(1, p.value);
                statement.addBatch();
            }

            statement.executeBatch();
        });
    }

    /**
     * Persist property value sets
     *
     * @param sets the property value sets to persist
     * @return whether the operation was successful
     */
    @SuppressWarnings("unused")
    public boolean persistPropertyValueSets(final List<PropertyValueSet> sets) {
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

        return persistPropertyValues(propertyValues) && persistProperties(properties);
    }

    /**
     * Get all documents that are both in a list and the database
     *
     * @param documents the documents to search for
     * @return the overlapping documents
     */
    public List<Document> getAllDocumentsIn(final List<Document> documents) {
        try {
            Collection<List<Document>> lists = ListUtils.partition(documents, 999);
            List<Document> result = new ArrayList<>();

            for (final List<Document> list : lists) {
                result.addAll(manager.createQuery("select d from Document as d where d in :docs", Document.class)
                        .setParameter("docs", list)
                        .getResultList());
            }

            return result;
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }

    /**
     * Persist a list of documents
     *
     * @param documents the documents to persist
     * @return true, if the operation was successful
     */
    public boolean persistDocuments(List<Document> documents) {
        List<Tag> tags = new ArrayList<>();
        List<Property> properties = new ArrayList<>();
        List<PropertyValue> propertyValues = new ArrayList<>();

        // Get all tags, properties and property values from the documents
        for (Document d : documents) {
            if (d.properties != null) {
                for (PropertyValueSet pvs : d.properties) {
                    properties.add(pvs.property);
                    propertyValues.add(pvs.propertyValue);
                }
            }

            if (d.tags != null) {
                tags.addAll(d.tags);
            }
        }

        // Persist the tags, properties and property values
        if (!persistTags(tags)) return false;
        if (!persistProperties(properties)) return false;
        if (!persistPropertyValues(propertyValues)) return false;

        // Get all documents already existing in the database
        // and also existing in the list of documents to persist
        List<Document> toRemove = getAllDocumentsIn(documents);
        if (toRemove == null) return false;

        // Remove all documents already existing in the database
        documents = ListUtils.removeAll(documents, toRemove, true, true);
        if (documents.isEmpty()) return true;

        // Start a transaction and persist all documents
        try {
            manager.setFlushMode(FlushModeType.COMMIT);
            manager.getTransaction().begin();
            for (Document d : documents) manager.persist(d);
            manager.getTransaction().commit();
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }

        return true;
    }

    /**
     * Persist a document
     *
     * @param document the document to persist
     */
    @SuppressWarnings("unused")
    public void persistDocument(Document document) {
        manager.getTransaction().begin();
        manager.persist(document);
        manager.getTransaction().commit();
    }

    /**
     * Get all directories in the database matching those in the given list
     *
     * @param directories the directories to search for
     * @return the overlapping directories
     */
    public List<Directory> getAllDirectoriesIn(final List<Directory> directories) {
        try {
            return manager.createQuery("select d from Directory as d where d in :dirs", Directory.class)
                    .setParameter("dirs", directories)
                    .getResultList();
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }

    /**
     * Persist a list of Directories
     *
     * @param directories the directories to persist
     * @return true, if the operation was successful
     */
    public boolean persistDirectories(List<Directory> directories) {
        List<Directory> toRemove = getAllDirectoriesIn(directories);
        if (toRemove == null) return false;

        // Remove all already existing directories
        directories = ListUtils.removeAll(directories, toRemove, true, true);

        // Begin a transaction and persist the directories
        try {
            manager.setFlushMode(FlushModeType.COMMIT);
            manager.getTransaction().begin();
            for (Directory d : directories) {
                manager.persist(d);
            }
            manager.getTransaction().commit();
        } catch (Exception e) {
            e.printStackTrace();
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
    public DatabaseInfo getDatabaseInfo() {
        try {
            return manager.find(DatabaseInfo.class, 0);
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }

    /**
     * Persist a {@link DatabaseInfo} instance
     *
     * @param info the {@link DatabaseInfo} to persist
     * @return true, if the operation was successful
     */
    public boolean persistDatabaseInfo(DatabaseInfo info) {
        try {
            manager.getTransaction().begin();
            manager.persist(info);
            manager.getTransaction().commit();
            return true;
        } catch (Exception e) {
            e.printStackTrace();
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
    public boolean persistDirectory(Directory directory, String sourcePath) {
        return persistDatabaseInfo(new DatabaseInfo(sourcePath)) &&
                persistDocuments(directory.getAllDocuments()) &&
                persistDirectories(directory.getAllDirectories());
    }

    /**
     * Get a directory element by a path
     *
     * @param path the path of the directory
     * @return the retrieved directory
     */
    public Directory getDirectory(String path) {
        try {
            return manager.find(Directory.class, path);
        } catch (Exception ignored) {
            return null;
        }
    }

    /**
     * Create a new Tag and persist it
     *
     * @param name the tag name
     * @return the created tag instance
     */
    public Tag createTag(String name) {
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
    public Tag createTag(String name, boolean singleTransaction) {
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
    public void createProperty(String name) {
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
    public PropertyValueSet createPropertyValueSet(String property, String value) {
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
    public Tag getTagByName(String name) {
        try {
            return manager.find(Tag.class, name);
        } catch (Exception ignored) {
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
    public boolean tagExists(String name) {
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
    public List<Tag> getTagsLike(String name) {
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
    public Property getPropertyByName(String name) {
        try {
            return manager.find(Property.class, name);
        } catch (Exception ignored) {
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
    public List<Property> getPropertiesLike(String name) {
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
    public List<PropertyValue> getPropertyValuesLike(String value) {
        return manager.createQuery("select p from PropertyValue as p where p.value like :value", PropertyValue.class)
                .setParameter("value", value + '%')
                .setMaxResults(FUZZY_SEARCH_MAX_RESULTS)
                .getResultList();
    }

    /**
     * Get all documents by a {@link DocumentFilter},
     * Returns a list of documents sorted by the
     * calculated filter accuracy.
     *
     * @param filter the filters
     * @return the retrieved documents
     */
    public List<Document> getDocumentsBy(DocumentFilter filter) {
        CriteriaBuilder cb = manager.getCriteriaBuilder();
        CriteriaQuery<Document> query = filter.getFilterRequest(cb);

        // Create the query and use streams to convert and sort the results
        return manager.createQuery(query)
                .setMaxResults(100)
                .getResultList()
                .stream()
                .map(d -> new DocumentSearchResult(d, filter.getFilters()))
                .sorted(Comparator.reverseOrder())
                .map(d -> d.document)
                .collect(Collectors.toList());
    }

    /**
     * Close the database connection
     */
    @SuppressWarnings("unused")
    public void close() {
        this.manager.flush();
        this.manager.clear();
        this.manager.close();
    }
}
