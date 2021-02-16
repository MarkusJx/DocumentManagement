package database;

import database.persistence.CustomPersistence;
import database.persistence.PersistenceProvider;
import database.persistence.SQLiteProvider;
import org.hibernate.tool.schema.Action;

import javax.persistence.EntityManager;
import javax.persistence.EntityManagerFactory;

public final class EntityManagerFactoryManager {
    private static final EntityManagerFactory emf;
    private static EntityManager manager = null;

    static {
        PersistenceProvider provider = new SQLiteProvider("database.db", Action.CREATE,
                "database.databaseTypes.Document",
                "database.databaseTypes.Property",
                "database.databaseTypes.PropertyValue",
                "database.databaseTypes.Tag");
        emf = CustomPersistence.createEntityManagerFactory("Database", provider);
    }

    static EntityManager getEntityManager() {
        if (manager == null) {
            manager = emf.createEntityManager();
        }
        return manager;
    }

    static void closeEntityManager() {
        manager.close();
        manager = null;
    }
}
