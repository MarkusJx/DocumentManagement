import database.DatabaseManager;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

public class TestDBManager {
    @BeforeAll
    static void fillDB() {
        DatabaseManager.createTag("tag1");
        DatabaseManager.createTag("tag2");
        DatabaseManager.createTag("tag3");
        DatabaseManager.createTag("tag4");

        DatabaseManager.createProperty("prop1");
        DatabaseManager.createProperty("prop2");
        DatabaseManager.createProperty("prop3");
        DatabaseManager.createProperty("prop4");

        /*database.DatabaseManager.createDocument("n1", "C/n1", Map.of("prop1", "val1", "prop2", "val1"), LocalDate.now(), "tag1");
        database.DatabaseManager.createDocument("n2", "C/n2", Map.of("prop2", "val2", "prop3", "val1"), LocalDate.now(), "tag1", "tag2");
        database.DatabaseManager.createDocument("n3", "C/n3", Map.of("prop3", "val1", "prop4", "val1"), LocalDate.now(), "tag1", "tag2", "tag3");
        database.DatabaseManager.createDocument("n4", "C/n4", Map.of("prop2", "val2", "prop3", "val1"), LocalDate.now(), "tag3", "tag4");
        database.DatabaseManager.createDocument("n5", "C/n5", Map.of("prop1", "val2", "prop4", "val1"), LocalDate.now(), "tag3");
        database.DatabaseManager.createDocument("n6", "C/n6", Map.of("prop2", "val1", "prop4", "val1"), LocalDate.now(), "tag4");*/
    }

    @AfterAll
    static void cleanUp() {
        DatabaseManager.close();
    }

    @Test
    public void testTagExists() {
        Assertions.assertTrue(DatabaseManager.tagExists("tag1"));
        Assertions.assertFalse(DatabaseManager.tagExists("tag5"));
    }

    @Test
    public void testServiceProviderExists() {
        Assertions.assertTrue(DatabaseManager.propertyExists("prop1"));
        Assertions.assertFalse(DatabaseManager.propertyExists("prop5"));
    }

    /*@Test
    void testTagSearch() {
        List<Document> documents = DatabaseManager.getDocumentsByTags("tag1");
        System.out.println(documents);
        Assertions.assertEquals(3, documents.size());

        documents = DatabaseManager.getDocumentsByTags("tag1", "tag2");
        System.out.println(documents);
        Assertions.assertEquals(2, documents.size());

        documents = DatabaseManager.getDocumentsByTags("tag1", "tag2", "tag3");
        System.out.println(documents);
        Assertions.assertEquals(1, documents.size());

        documents = DatabaseManager.getDocumentsByTags("tag3");
        System.out.println(documents);
        Assertions.assertEquals(3, documents.size());

        documents = DatabaseManager.getDocumentsByTags("tag3", "tag4");
        System.out.println(documents);
        Assertions.assertEquals(1, documents.size());
    }*/
}
