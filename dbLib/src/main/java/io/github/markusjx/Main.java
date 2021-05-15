package io.github.markusjx;

import io.github.markusjx.database.persistence.CustomPersistenceUnit;
import io.github.markusjx.datatypes.ChainedHashMap;
import org.reflections.Reflections;

import java.util.Set;

public class Main {
    public static void main(String[] args) {
        Reflections reflections = new Reflections("io.github.markusjx");

        Set<Class<?>> annotated = reflections.getTypesAnnotatedWith(CustomPersistenceUnit.class);

        ChainedHashMap<String, String> map = new ChainedHashMap<>();
        // Put all annotated classes into the result map
        annotated.forEach(c -> map.putValue(c.getAnnotation(CustomPersistenceUnit.class).unitName(), c.getName()));
        System.out.println(map);

        /*SQLiteProvider provider = new SQLiteProvider("", Action.CREATE, true);
        EntityManagerFactory factory = CustomPersistence.createEntityManagerFactory("documents", provider);
        EntityManager entityManager = factory.createEntityManager();
        DatabaseManager manager = new DatabaseManager(entityManager);
        manager.createTag("abc");
        manager.createTag("def");

        manager.createProperty("prop1");
        manager.createProperty("prop2");

        manager.createDocument("n1", "C/n1",
                ChainedHashMap.of("prop1", "val1", "prop2", "val1"),
                LocalDate.now(), "abc", "def");

        List<Document> docs = manager.getDocumentsBy(DocumentFilter.createFilter(
                new TagFilter("abc", "def"),
                new FilenameFilter("1", false),
                new PropertyFilter("prop1", "val1", "prop2", "val1"),
                //new SingleDateFilter(LocalDate.of(2000, 10, 10))
                //DateFilter.today()
                DateFilter.getByDate(2021, 2)
        ), 0);
        System.out.println(docs);
        System.out.println(docs.size());

        entityManager.close();*/
    }
}
