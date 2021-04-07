import io.github.markusjx.database.DatabaseManager;
import io.github.markusjx.database.persistence.CustomPersistence;
import io.github.markusjx.database.persistence.MariaDBProvider;
import io.github.markusjx.database.types.Directory;
import io.github.markusjx.database.types.Document;
import io.github.markusjx.scanning.FileScanner;
import org.hibernate.tool.schema.Action;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

import javax.persistence.EntityManager;
import javax.persistence.EntityManagerFactory;
import java.util.List;

class TestMariaDBProvider {
    private static DatabaseManager manager;

    @BeforeAll
    static void setUp() {
        MariaDBProvider provider = new MariaDBProvider("127.0.0.1:3306/documents", "root", "",
                Action.CREATE_DROP, true);
        EntityManagerFactory factory = CustomPersistence.createEntityManagerFactory("documents", provider);
        EntityManager entityManager = factory.createEntityManager();
        manager = new DatabaseManager(entityManager);
    }

    @Test
    void scanTest() {
        FileScanner scanner = new FileScanner(".");
        Directory source = scanner.scan();
        List<Document> allDocuments = source.getAllDocuments();

        manager.persistDirectory(source, ".");
        source = manager.getDirectory("");

        Assertions.assertNotNull(source);
        Assertions.assertEquals(allDocuments.size(), source.getAllDocuments().size());
    }
}
