import io.github.markusjx.database.DatabaseManager;
import io.github.markusjx.database.databaseTypes.Directory;
import io.github.markusjx.database.databaseTypes.Document;
import io.github.markusjx.database.filter.DocumentFilter;
import io.github.markusjx.database.filter.filters.DirectoryFilter;
import io.github.markusjx.database.filter.filters.FilenameFilter;
import io.github.markusjx.database.persistence.CustomPersistence;
import io.github.markusjx.database.persistence.SQLiteProvider;
import io.github.markusjx.scanning.FileScanner;
import org.hibernate.tool.schema.Action;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;

import javax.persistence.EntityManager;
import javax.persistence.EntityManagerFactory;
import java.util.List;

public class TestFileScanner {
    static SQLiteProvider provider = new SQLiteProvider("database.db", Action.CREATE_DROP, false);
    static EntityManagerFactory factory = CustomPersistence.createEntityManagerFactory("documents", provider);
    static EntityManager entityManager = factory.createEntityManager();
    static DatabaseManager manager = new DatabaseManager(entityManager);

    @Test
    void testScanner() {
        FileScanner scanner = new FileScanner("C:\\Users\\marku\\CloudStation");
        Directory source = scanner.scan();
        List<Document> allDocuments = source.getAllDocuments();
        System.out.println(allDocuments.size());

        Assertions.assertTrue(manager.persistDirectory(source, "C:\\Users\\marku\\CloudStation"));
        System.out.println(manager.getDocumentsBy(DocumentFilter.createFilter(new DirectoryFilter("Code"))));

        System.out.println(manager.getDirectory("Bank"));
    }

    @Test
    void testSearch() {
        System.out.println(manager.getDocumentsBy(DocumentFilter.createFilter(new FilenameFilter("a", false))).size());
    }
}
