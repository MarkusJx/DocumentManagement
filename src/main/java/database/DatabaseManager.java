package database;

import database.databaseTypes.Document;
import database.databaseTypes.Property;
import database.databaseTypes.PropertyValue;
import database.databaseTypes.Tag;
import database.filter.DocumentFilter;
import datatypes.DocumentSearchResult;

import javax.enterprise.context.ApplicationScoped;
import javax.inject.Inject;
import javax.persistence.EntityManager;
import javax.persistence.PersistenceContext;
import javax.persistence.TypedQuery;
import javax.persistence.criteria.CriteriaBuilder;
import javax.persistence.criteria.CriteriaQuery;
import javax.transaction.Transactional;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Collection;
import java.util.List;
import java.util.Map;

@ApplicationScoped
public class DatabaseManager {
    @Inject
    @PersistenceContext
    EntityManager entityManager;

    @Transactional
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

        //EntityManager man = entityManager;
        //man.getTransaction().begin();
        entityManager.persist(doc);
        //man.getTransaction().commit();
    }

    @Transactional
    public void createTag(String name) {
        Tag t = new Tag(name);

        //entityManager.getTransaction().begin();
        entityManager.persist(t);
        //entityManager.getTransaction().commit();
    }

    @Transactional
    public void createProperty(String name) {
        Property t = new Property(name);

        //EntityManager man = entityManager;
        //man.getTransaction().begin();
        entityManager.persist(t);
        //man.getTransaction().commit();
    }

    @Transactional
    public synchronized void createPropertyValue(String property, String name) {
        if (!propertyExists(property)) {
            throw new IllegalArgumentException("A property with the name " + property + " does not exist");
        }

        PropertyValue pv = new PropertyValue(name, new Property(property));

        //EntityManager man = entityManager;
        //man.getTransaction().begin();
        entityManager.persist(pv);
        //man.getTransaction().commit();
    }

    @Transactional
    public boolean tagExists(String tagName) {
        TypedQuery<Long> res = entityManager.createQuery("select count(*) from Tag t where t.name = :tName", Long.class);
        res.setParameter("tName", tagName);

        return res.getSingleResult() > 0;
    }

    @Transactional
    public boolean propertyExists(String name) {
        //EntityManager man = entityManager;
        TypedQuery<Long> res = entityManager.createQuery("select count(*) from Property p where p.name = :name", Long.class);
        res.setParameter("name", name);

        return res.getSingleResult() > 0;
    }

    @Transactional
    public boolean propertyValueExists(String value) {
        EntityManager man = entityManager;
        return man.createQuery("select count(*) from PropertyValue pv where pv.value = :value", Long.class)
                .setParameter("value", value)
                .getSingleResult() > 0;
    }

    @Transactional
    public synchronized List<Document> getDocumentsWithName(String name) {
        //EntityManager man = entityManager;
        TypedQuery<Document> res = entityManager.createQuery("select d from Document d where d.filename = :name", Document.class);
        res.setParameter("name", name);

        return res.getResultList();
    }

    @Transactional
    public DocumentSearchResult getDocumentBy(DocumentFilter filter) {
        //EntityManager man = entityManager;
        CriteriaBuilder cb = entityManager.getCriteriaBuilder();
        CriteriaQuery<Document> query = filter.getFilterRequest(cb);

        List<Document> documents = entityManager.createQuery(query).getResultList();
        return new DocumentSearchResult(documents, filter.getFilters());
    }

    @Transactional
    public synchronized List<Document> getDocumentsByTags(String... tagNames) {
        Collection<Tag> tags = new ArrayList<>();
        for (String t : tagNames) {
            tags.add(new Tag(t));
        }

        //EntityManager man = entityManager;
        return entityManager.createQuery("select distinct d from Document d left join d.tags ts " +
                "where ts in :tags group by d having count(ts) = :tagsSize", Document.class)
                .setParameter("tags", tags)
                .setParameter("tagsSize", (long) tags.size())
                .getResultList();
    }

    /*public synchronized void close() {
        entityManager.close();
    }*/
}
