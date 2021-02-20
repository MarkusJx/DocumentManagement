package io.github.markusjx.database;

import io.github.markusjx.database.databaseTypes.*;
import io.github.markusjx.database.filter.DocumentFilter;
import io.github.markusjx.datatypes.ChainedHashMap;
import io.github.markusjx.datatypes.DocumentSearchResult;
import io.github.markusjx.util.ListUtils;
import org.hibernate.Session;
import org.hibernate.Transaction;

import javax.persistence.EntityManager;
import javax.persistence.criteria.CriteriaBuilder;
import javax.persistence.criteria.CriteriaQuery;
import java.sql.PreparedStatement;
import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

/**
 * A class for managing the io.github.markusjx.database
 */
public class DatabaseManager {
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

    public void persistDocuments(List<Document> documents) {
        for (Document d : documents) {
            for (PropertyValueSet pvs : d.properties) {
                createPropertyValueSet(pvs.property.name, pvs.propertyValue.value);
            }

            String[] tags = new String[d.tags.size()];
            for (int i = 0; i < tags.length; i++) {
                tags[i] = d.tags.get(i).name;
            }

            convertTagName(tags);

            manager.getTransaction().begin();
            manager.persist(d);
            manager.getTransaction().commit();
        }
    }

    public List<Tag> getAllTagsIn(final List<Tag> tags) {
        return manager.createQuery("select t from Tag as t where t in :tags", Tag.class)
                .setParameter("tags", tags)
                .getResultList();
    }

    public boolean persistTags(final List<Tag> tags) {
        Session session = manager.unwrap(Session.class);
        Transaction transaction = session.beginTransaction();
        try {
            List<Tag> ts = ListUtils.removeAll(tags, getAllTagsIn(tags), true);
            System.out.println(ts.size() + ", " + ts.get(0) + ", " + ts.get(ts.size() - 1));

            session.doWork(connection -> {
                PreparedStatement statement = connection.prepareStatement("INSERT INTO Tag(name) values (?)");
                for (Tag t : ts) {
                    statement.setString(1, t.name);
                    statement.addBatch();
                }

                statement.executeBatch();
            });

            transaction.commit();
            return true;
        } catch (Exception e) {
            e.printStackTrace();
            transaction.rollback();
            return false;
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
     * @return the just created property
     */
    public Property createProperty(String name) {
        Property p = new Property(name);

        // Persist the property
        manager.getTransaction().begin();
        manager.persist(p);
        manager.getTransaction().commit();

        return p;
    }

    /**
     * Get a {@link PropertyValue} by its value string. Returns {@code null} if the value cannot be found
     *
     * @param value the value name to search for
     * @return the property value in the io.github.markusjx.database
     */
    public PropertyValue getPropertyValue(String value) {
        try {
            // Create a query to get the value
            return manager.find(PropertyValue.class, value);
        } catch (Exception ignored) {
            return null;
        }
    }

    /**
     * Check if a property value is in the list of values for a property
     *
     * @param propertyName  the name of the property to search for
     * @param propertyValue the property value
     * @return true, if the {@link Property} has a {@link PropertyValue} in its {@link Property#values} list
     */
    public boolean propertyValueIsInProperty(String propertyName, String propertyValue) {
        Property p = getPropertyByName(propertyName);
        if (p == null || p.values == null) return false;

        return p.values.contains(new PropertyValue(propertyValue));
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

    public Tag getTagByName(String name) {
        try {
            return manager.find(Tag.class, name);
        } catch (Exception ignored) {
            return null;
        }
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
                .getResultList()
                .stream()
                .map(d -> new DocumentSearchResult(d, filter.getFilters()))
                .sorted(Comparator.reverseOrder())
                .map(d -> d.document)
                .collect(Collectors.toList());
    }
}
