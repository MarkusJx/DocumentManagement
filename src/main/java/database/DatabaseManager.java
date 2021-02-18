package database;

import database.databaseTypes.*;
import database.filter.DocumentFilter;
import datatypes.DocumentSearchResult;

import javax.persistence.EntityManager;
import javax.persistence.TypedQuery;
import javax.persistence.criteria.CriteriaBuilder;
import javax.persistence.criteria.CriteriaQuery;
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
            if (!tagExists(tagNames[i])) {
                tags[i] = createTag(tagNames[i]);
            } else {
                // Just put a tag with the same name into the list
                tags[i] = new Tag(tagNames[i]);
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
    public void createDocument(String filename, String path, Map<String, String> properties, LocalDate creationDate, String... tagNames) {
        // Create a PropertyValueSet list
        List<PropertyValueSet> propList = new ArrayList<>();
        for (Map.Entry<String, String> e : properties.entrySet()) {
            // The property value
            PropertyValueSet pvs = createPropertyValueSet(e.getKey(), e.getValue());

            // Add the property value set to the list
            propList.add(pvs);
        }

        // Convert the tag names to an tag array
        Tag[] tags = convertTagName(tagNames);

        // Create a new document
        Document doc = new Document(filename, path, propList, creationDate, tags);

        // Persist the document
        manager.getTransaction().begin();
        manager.persist(doc);
        manager.getTransaction().commit();
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
     * Create a new Property and persist it
     *
     * @param name the name of the property
     * @return the just created property
     */
    public Property createProperty(String name) {
        Property t = new Property(name);

        // Persist the property
        manager.getTransaction().begin();
        manager.persist(t);
        manager.getTransaction().commit();

        return t;
    }

    /**
     * Get a {@link PropertyValue} by its value string. Returns {@code null} if the value cannot be found
     *
     * @param value the value name to search for
     * @return the property value in the database
     */
    public PropertyValue getPropertyValue(String value) {
        try {
            // Create a query to get the value
            return manager.createQuery("select p from PropertyValue as p where p.value = :propertyValue", PropertyValue.class)
                    .setParameter("propertyValue", value)
                    .getSingleResult();
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
        return getPropertyByName(propertyName).values.contains(new PropertyValue(propertyValue));
    }

    /**
     * Create a property value set.
     * Creates a new {@link Property} and/or {@link PropertyValue} if not existing.
     * Adds the {@link PropertyValue} to the {@link Property} if not already done.
     * If all requested values exist, the {@link PropertyValueSet} is just retrieved from the database.
     *
     * @param property the property name
     * @param value    the property value
     * @return the created {@link PropertyValueSet}
     */
    public PropertyValueSet createPropertyValueSet(String property, String value) {
        Property p;
        if (!propertyExists(property)) {
            // If the property does not exist, create the property
            p = createProperty(property);
        } else {
            // Get the property
            p = getPropertyByName(property);
        }

        PropertyValue pv = getPropertyValue(value);
        if (pv == null || !propertyValueIsInProperty(property, value)) {
            PropertyValue nPv = null;
            if (pv == null) {
                nPv = p.addValue(value);
                pv = nPv;
            } else {
                p.addValue(value);
            }

            // Persist the property value
            manager.getTransaction().begin();
            manager.persist(p);
            if (nPv != null)
                manager.persist(nPv);
            manager.getTransaction().commit();
        }

        // Return the property value set
        return new PropertyValueSet(p, pv);
    }

    /**
     * Check if a {@link Tag} with a name is already in the database
     *
     * @param tagName the tag name to search for
     * @return true, if the {@link Tag} with the name {@code tagName} is in the database
     */
    public boolean tagExists(String tagName) {
        TypedQuery<Long> res = manager.createQuery("select count(*) from Tag t where t.name = :tName", Long.class);
        res.setParameter("tName", tagName);

        return res.getSingleResult() > 0;
    }

    /**
     * Check if a {@link Property} with a name is already in the database
     *
     * @param name the name of the {@link Property}
     * @return true, if the {@link Property} is persisted
     */
    public boolean propertyExists(String name) {
        return manager.createQuery("select count(*) from Property p where p.name = :name", Long.class)
                .setParameter("name", name)
                .getSingleResult() > 0;
    }

    /**
     * Get a {@link Property} by a name
     *
     * @param name the name of the property to search for
     * @return the property
     */
    public Property getPropertyByName(String name) {
        return manager.createQuery("select p from Property as p where p.name = :name", Property.class)
                .setParameter("name", name)
                .getSingleResult();
    }

    /**
     * Check if a {@link PropertyValue} exists in the database
     *
     * @param value the value of the {@link PropertyValue}
     * @return true, if the value exists
     */
    public boolean propertyValueExists(String value) {
        return manager.createQuery("select count(*) from PropertyValue pv where pv.value = :value", Long.class)
                .setParameter("value", value)
                .getSingleResult() > 0;
    }

    /**
     * Get all documents by a {@link DocumentFilter}
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
                .sorted()
                .map(d -> d.document)
                .collect(Collectors.toList());
    }
}
