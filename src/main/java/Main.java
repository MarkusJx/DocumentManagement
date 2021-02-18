import database.DatabaseManager;
import database.databaseTypes.Document;
import database.filter.DocumentFilter;
import database.filter.filters.FilenameFilter;
import database.filter.filters.PropertyFilter;
import database.filter.filters.TagFilter;
import database.filter.filters.dates.DateFilter;
import database.persistence.CustomPersistence;
import database.persistence.SQLiteProvider;
import org.hibernate.tool.schema.Action;

import javax.persistence.EntityManager;
import javax.persistence.EntityManagerFactory;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class Main {
    public static void main(String[] args) {
        SQLiteProvider provider = new SQLiteProvider("", Action.CREATE);
        EntityManagerFactory factory = CustomPersistence.createEntityManagerFactory("documents", provider);
        EntityManager entityManager = factory.createEntityManager();
        DatabaseManager manager = new DatabaseManager(entityManager);
        manager.createTag("abc");
        manager.createTag("def");

        manager.createProperty("prop1");
        manager.createProperty("prop2");

        Map<String, String> m = new HashMap<>();
        m.put("prop1", "val1");
        m.put("prop2", "val1");

        manager.createDocument("n1", "C/n1",
                m, LocalDate.now(), "abc", "def");

        List<Document> docs = manager.getDocumentsBy(DocumentFilter.createFilter(
                new TagFilter("abc", "def"),
                new FilenameFilter("1", false),
                new PropertyFilter("prop1", "val2", "prop2", "val1"),
                //new SingleDateFilter(LocalDate.of(2000, 10, 10))
                //DateFilter.today()
                DateFilter.getByDate(2021, 2)
        ));
        System.out.println(docs);
        System.out.println(docs.size());

        entityManager.close();
    }
}
