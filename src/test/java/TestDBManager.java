import io.github.markusjx.database.DatabaseManager;
import io.github.markusjx.database.databaseTypes.Document;
import io.github.markusjx.database.filter.DocumentFilter;
import io.github.markusjx.database.filter.filters.FilenameFilter;
import io.github.markusjx.database.filter.filters.PropertyFilter;
import io.github.markusjx.database.filter.filters.TagFilter;
import io.github.markusjx.database.filter.filters.dates.DateFilter;
import io.github.markusjx.database.persistence.CustomPersistence;
import io.github.markusjx.database.persistence.SQLiteProvider;
import io.github.markusjx.datatypes.ChainedHashMap;
import org.hibernate.tool.schema.Action;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

import javax.persistence.EntityManager;
import javax.persistence.EntityManagerFactory;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Random;

public class TestDBManager {
    private static DatabaseManager manager;
    private static EntityManager entityManager;
    private static final Random r = new Random();

    private static String[] generateRandomTags() {
        int numTags = r.nextInt(100);
        String[] tags = new String[numTags];
        for (int i = 0; i < numTags; i++) {
            tags[i] = "t" + r.nextInt(1000);
        }

        return tags;
    }

    private static ChainedHashMap<String, String> generateRandomProperties() {
        int numProps = r.nextInt(100);
        List<String> props = new ArrayList<>(numProps);
        for (int i = 0; i < numProps; i += 2) {
            props.add("prop" + r.nextInt(100));
            props.add("val" + r.nextInt(100));
        }

        return ChainedHashMap.of(props.toArray(new String[0]));
    }

    @BeforeAll
    static void fillDB() {
        SQLiteProvider provider = new SQLiteProvider("", Action.CREATE, false);
        EntityManagerFactory factory = CustomPersistence.createEntityManagerFactory("documents", provider);
        entityManager = factory.createEntityManager();
        manager = new DatabaseManager(entityManager);

        manager.createTag("tag1");
        manager.createTag("tag2");
        manager.createTag("tag3");
        manager.createTag("tag4");

        manager.createProperty("prop1");
        manager.createProperty("prop2");
        manager.createProperty("prop3");
        manager.createProperty("prop4");

        manager.createDocument("n1", "C/n1", ChainedHashMap.of("prop1", "val1", "prop2", "val1"), LocalDate.now(), "tag1");
        manager.createDocument("n2", "C/n2", ChainedHashMap.of("prop2", "val2", "prop3", "val1"), LocalDate.now(), "tag1", "tag2");
        manager.createDocument("n3", "C/n3", ChainedHashMap.of("prop3", "val1", "prop4", "val1"), LocalDate.now(), "tag1", "tag2", "tag3");
        manager.createDocument("n4", "C/n4", ChainedHashMap.of("prop2", "val2", "prop3", "val1"), LocalDate.now(), "tag3", "tag4");
        manager.createDocument("n5", "C/n5", ChainedHashMap.of("prop1", "val2", "prop4", "val1"), LocalDate.now(), "tag3");
        manager.createDocument("n6", "C/n6", ChainedHashMap.of("prop2", "val1", "prop4", "val1"), LocalDate.now(), "tag4");
    }

    @AfterAll
    static void cleanUp() {
        entityManager.close();
    }

    @Test
    void testTagExists() {
        Assertions.assertTrue(manager.tagExists("tag1"));
        Assertions.assertFalse(manager.tagExists("tag5"));
    }

    @Test
    void testServiceProviderExists() {
        Assertions.assertTrue(manager.propertyExists("prop1"));
        Assertions.assertFalse(manager.propertyExists("prop5"));
    }

    @Test
    void testTagSearch() {
        List<Document> documents = manager.getDocumentsBy(DocumentFilter.createFilter(new TagFilter("tag1")));
        System.out.println(documents);
        Assertions.assertEquals(3, documents.size());

        documents = manager.getDocumentsBy(DocumentFilter.createFilter(new TagFilter("tag1", "tag2")));
        System.out.println(documents);
        Assertions.assertEquals(2, documents.size());

        documents = manager.getDocumentsBy(DocumentFilter.createFilter(new TagFilter("tag1", "tag2", "tag3")));
        System.out.println(documents);
        Assertions.assertEquals(1, documents.size());

        documents = manager.getDocumentsBy(DocumentFilter.createFilter(new TagFilter("tag3")));
        System.out.println(documents);
        Assertions.assertEquals(3, documents.size());

        documents = manager.getDocumentsBy(DocumentFilter.createFilter(new TagFilter("tag3", "tag4")));
        System.out.println(documents);
        Assertions.assertEquals(1, documents.size());
    }

    @Test
    void generateDocuments() {
        for (int i = 0; i < 1000; i++) {
            manager.createDocument("n" + i, "p/n" + i,
                    generateRandomProperties(),
                    LocalDate.now(), generateRandomTags());
        }
    }

    @Test
    void testFilter() {
        List<Document> docs = manager.getDocumentsBy(DocumentFilter.createFilter(
                new TagFilter("tag1"),
                new FilenameFilter("n", false),
                new PropertyFilter("prop1", "val1", "prop2", "val1"),
                DateFilter.today()
        ));

        for (Document d : docs) {
            System.out.println(d);
        }
    }
}
