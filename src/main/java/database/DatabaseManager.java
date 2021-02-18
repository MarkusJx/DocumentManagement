package database;

import database.databaseTypes.Document;
import database.databaseTypes.Property;
import database.databaseTypes.PropertyValue;
import database.databaseTypes.Tag;
import database.filter.DocumentFilter;
import datatypes.DocumentSearchResult;

import javax.persistence.EntityManager;
import javax.persistence.TypedQuery;
import javax.persistence.criteria.CriteriaBuilder;
import javax.persistence.criteria.CriteriaQuery;
import java.time.LocalDate;
import java.util.*;

public class DatabaseManager {
    private final EntityManager manager;

    public DatabaseManager(EntityManager manager) {
        Objects.requireNonNull(manager);
        this.manager = manager;
    }

    public void createDocument(String filename, String path, Map<String, String> properties, LocalDate creationDate, String... tagNames) {
        List<PropertyValue> propList = new ArrayList<>();
        for (Map.Entry<String, String> e : properties.entrySet()) {
            if (!propertyValueExists(e.getValue())) {
                createPropertyValue(e.getKey(), e.getValue());
            }
            propList.add(new PropertyValue(e.getValue(), new Property(e.getKey())));
        }

        Tag[] tags = null;
        if (tagNames.length > 0) {
            tags = new Tag[tagNames.length];
            for (int i = 0; i < tagNames.length; i++) {
                if (!tagExists(tagNames[i])) {
                    throw new IllegalArgumentException("A tag with the name " + tagNames[i] + " does not exist");
                } else {
                    tags[i] = new Tag(tagNames[i]);
                }
            }
        }

        Document doc = new Document(filename, path, propList, creationDate, tags);

        manager.getTransaction().begin();
        manager.persist(doc);
        manager.getTransaction().commit();
    }

    public void createTag(String name) {
        Tag t = new Tag(name);

        manager.getTransaction().begin();
        manager.persist(t);
        manager.getTransaction().commit();
    }

    public void createProperty(String name) {
        Property t = new Property(name);

        manager.getTransaction().begin();
        manager.persist(t);
        manager.getTransaction().commit();
    }

    public void createPropertyValue(String property, String name) {
        if (!propertyExists(property)) {
            throw new IllegalArgumentException("A property with the name " + property + " does not exist");
        }

        Property p = manager.createQuery("select p from Property as p where p.name = :propertyName", Property.class)
                .setParameter("propertyName", property)
                .getSingleResult();

        p.addValue(name);

        manager.getTransaction().begin();
        manager.persist(p);
        manager.getTransaction().commit();
    }

    public boolean tagExists(String tagName) {
        TypedQuery<Long> res = manager.createQuery("select count(*) from Tag t where t.name = :tName", Long.class);
        res.setParameter("tName", tagName);

        return res.getSingleResult() > 0;
    }

    public boolean propertyExists(String name) {
        TypedQuery<Long> res = manager.createQuery("select count(*) from Property p where p.name = :name", Long.class);
        res.setParameter("name", name);

        return res.getSingleResult() > 0;
    }

    public boolean propertyValueExists(String value) {
        /*return manager.createQuery("select count(*) from PropertyValue pv where pv.value = :value", Long.class)
                .setParameter("value", value)
                .getSingleResult() > 0;*/
        return true;
    }

    public List<Document> getDocumentsWithName(String name) {
        TypedQuery<Document> res = manager.createQuery("select d from Document d where d.filename = :name", Document.class);
        res.setParameter("name", name);

        return res.getResultList();
    }

    public DocumentSearchResult getDocumentBy(DocumentFilter filter) {
        CriteriaBuilder cb = manager.getCriteriaBuilder();
        CriteriaQuery<Document> query = filter.getFilterRequest(cb);

        List<Document> documents = manager.createQuery(query).getResultList();
        return new DocumentSearchResult(documents, filter.getFilters());
    }

    public List<Document> getDocumentsByTags(String... tagNames) {
        Collection<Tag> tags = new ArrayList<>();
        for (String t : tagNames) {
            tags.add(new Tag(t));
        }

        return manager.createQuery("select distinct d from Document d left join d.tags ts " +
                "where ts in :tags group by d having count(ts) = :tagsSize", Document.class)
                .setParameter("tags", tags)
                .setParameter("tagsSize", (long) tags.size())
                .getResultList();
    }
}
