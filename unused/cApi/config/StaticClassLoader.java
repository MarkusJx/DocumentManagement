package cApi.config;

import io.github.markusjx.database.persistence.CustomPersistence;
import io.github.markusjx.database.persistence.SQLiteProvider;
import org.hibernate.tool.schema.Action;

public final class StaticClassLoader {
    static {
        CustomPersistence.createEntityManagerFactory("Database", new SQLiteProvider("", Action.CREATE));
    }
}
