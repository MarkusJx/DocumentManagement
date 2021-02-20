import io.github.markusjx.database.DatabaseManager;
import io.github.markusjx.database.databaseTypes.Document;
import io.github.markusjx.database.filter.DocumentFilter;
import io.github.markusjx.database.filter.filters.FilenameFilter;
import io.github.markusjx.database.persistence.CustomPersistence;
import io.github.markusjx.database.persistence.SQLiteProvider;
import io.github.markusjx.scanning.FileScanner;
import org.hibernate.tool.schema.Action;
import org.junit.jupiter.api.Test;

import javax.persistence.EntityManager;
import javax.persistence.EntityManagerFactory;
import javax.persistence.FlushModeType;
import java.util.List;

public class TestFileScanner {
    @Test
    void testScanner() {
        SQLiteProvider provider = new SQLiteProvider("database.db", Action.CREATE_DROP, true);
        EntityManagerFactory factory = CustomPersistence.createEntityManagerFactory("documents", provider);
        EntityManager entityManager = factory.createEntityManager();

        FileScanner scanner = new FileScanner("C:\\Users\\marku\\CloudStation");
        List<Document> documents = scanner.scan();
        System.out.println(documents.size());

        entityManager.setFlushMode(FlushModeType.COMMIT);
        entityManager.getTransaction().begin();
        for (Document d : documents) {
            entityManager.persist(d);
        }
        entityManager.getTransaction().commit();

        DatabaseManager manager = new DatabaseManager(entityManager);
        //manager.persistDocuments(documents);
        System.out.println(manager.getDocumentsBy(DocumentFilter.createFilter(new FilenameFilter("a", false))));
    }
}
