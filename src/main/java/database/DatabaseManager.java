package database;

import database.databaseTypes.Document;
import database.databaseTypes.Property;
import database.databaseTypes.PropertyValue;
import database.databaseTypes.Tag;
import database.filter.DocumentFilter;
import datatypes.DocumentSearchResult;
import io.quarkus.hibernate.orm.PersistenceUnit;

import javax.inject.Inject;
import javax.persistence.EntityManager;
import javax.persistence.EntityManagerFactory;
import javax.persistence.Persistence;
import javax.persistence.TypedQuery;
import javax.persistence.criteria.CriteriaBuilder;
import javax.persistence.criteria.CriteriaQuery;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Collection;
import java.util.List;
import java.util.Map;

public class DatabaseManager {
    private static EntityManagerContainer managerContainer = null;

    public static synchronized EntityManager getEntityManager() {
        if (managerContainer == null) {
            managerContainer = new EntityManagerContainer();
        }
        return managerContainer.entityManager;
    }

    public static synchronized void createDocument(String filename, String path, Map<String, String> properties, LocalDate creationDate, String... tagNames) {
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

        EntityManager man = getEntityManager();
        man.getTransaction().begin();
        man.persist(doc);
        man.getTransaction().commit();
    }

    public static synchronized void createTag(String name) {
        Tag t = new Tag(name);

        EntityManager man = getEntityManager();
        man.getTransaction().begin();
        man.persist(t);
        man.getTransaction().commit();
    }

    public static synchronized void createProperty(String name) {
        Property t = new Property(name);

        EntityManager man = getEntityManager();
        man.getTransaction().begin();
        man.persist(t);
        man.getTransaction().commit();
    }

    public static synchronized void createPropertyValue(String property, String name) {
        if (!propertyExists(property)) {
            throw new IllegalArgumentException("A property with the name " + property + " does not exist");
        }

        PropertyValue pv = new PropertyValue(name, new Property(property));

        EntityManager man = getEntityManager();
        man.getTransaction().begin();
        man.persist(pv);
        man.getTransaction().commit();
    }

    public static synchronized boolean tagExists(String tagName) {
        EntityManager man = getEntityManager();
        TypedQuery<Long> res = man.createQuery("select count(*) from Tag t where t.name = :tName", Long.class);
        res.setParameter("tName", tagName);

        return res.getSingleResult() > 0;
    }

    public static synchronized boolean propertyExists(String name) {
        EntityManager man = getEntityManager();
        TypedQuery<Long> res = man.createQuery("select count(*) from Property p where p.name = :name", Long.class);
        res.setParameter("name", name);

        return res.getSingleResult() > 0;
    }

    public static synchronized boolean propertyValueExists(String value) {
        EntityManager man = getEntityManager();
        return man.createQuery("select count(*) from PropertyValue pv where pv.value = :value", Long.class)
                .setParameter("value", value)
                .getSingleResult() > 0;
    }

    public static synchronized List<Document> getDocumentsWithName(String name) {
        EntityManager man = getEntityManager();
        TypedQuery<Document> res = man.createQuery("select d from Document d where d.filename = :name", Document.class);
        res.setParameter("name", name);

        return res.getResultList();
    }

    public static DocumentSearchResult getDocumentBy(DocumentFilter filter) {
        EntityManager man = getEntityManager();
        CriteriaBuilder cb = man.getCriteriaBuilder();
        CriteriaQuery<Document> query = filter.getFilterRequest(cb);

        List<Document> documents = man.createQuery(query).getResultList();
        return new DocumentSearchResult(documents, filter.getFilters());
    }

    public static synchronized List<Document> getDocumentsByTags(String... tagNames) {
        Collection<Tag> tags = new ArrayList<>();
        for (String t : tagNames) {
            tags.add(new Tag(t));
        }

        EntityManager man = getEntityManager();
        return man.createQuery("select distinct d from Document d left join d.tags ts " +
                "where ts in :tags group by d having count(ts) = :tagsSize", Document.class)
                .setParameter("tags", tags)
                .setParameter("tagsSize", (long) tags.size())
                .getResultList();
    }

    public static synchronized void close() {
        if (managerContainer != null) {
            managerContainer.entityManager.close();
            managerContainer = null;
        }
    }

    private static class EntityManagerContainer {
        @Inject
        @PersistenceUnit("documents")
        EntityManager entityManager;

        @Inject
        @PersistenceUnit("documents")
        EntityManagerFactory entityManagerFactory;

        EntityManagerContainer() {
            entityManagerFactory = Persistence.createEntityManagerFactory("documents");
            entityManager = entityManagerFactory.createEntityManager();
        }
    }
}
