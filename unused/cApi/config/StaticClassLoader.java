package cApi.config;

import database.persistence.CustomPersistence;
import database.persistence.SQLiteProvider;
import org.hibernate.tool.schema.Action;

public final class StaticClassLoader {
    static {
        CustomPersistence.createEntityManagerFactory("Database", new SQLiteProvider("", Action.CREATE));
    }
}
