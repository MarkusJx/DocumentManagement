package io.github.markusjx.database.persistence;

import io.github.markusjx.datatypes.ChainedHashMap;
import org.hibernate.dialect.SQLiteDialect;
import org.hibernate.tool.schema.Action;

import javax.persistence.spi.PersistenceUnitInfo;
import java.util.HashMap;
import java.util.Map;
import java.util.Objects;

import static org.hibernate.cfg.AvailableSettings.*;

/**
 * An SQLite persistence provider
 */
public final class SQLiteProvider extends PersistenceProvider {
    /**
     * The property map
     */
    private final Map<String, Object> properties;

    /**
     * All by this provider managed classes
     */
    private final ChainedHashMap<String, String> managedClassNames;

    /**
     * Create a new {@link SQLiteProvider} instance.
     * Creates a database file with the name "database.db"
     * and the {@link Action} drop-and-create.
     */
    public SQLiteProvider() {
        this("database.db", Action.CREATE, true);
    }

    /**
     * Create a new SQLite provider instance
     *
     * @param databaseFile      the name of database file
     * @param action            the database creation {@link Action}
     * @param showSQL           whether to show the SQL commands
     * @param managedClassNames the names of the managed classes
     */
    public SQLiteProvider(String databaseFile, Action action, Boolean showSQL, String... managedClassNames) {
        Objects.requireNonNull(databaseFile);
        Objects.requireNonNull(showSQL);

        // Create a new property map
        this.properties = new HashMap<>();
        this.properties.put(JPA_JDBC_DRIVER, "org.sqlite.JDBC");
        this.properties.put(JPA_JDBC_URL, "jdbc:sqlite:" + databaseFile);
        this.properties.put(DIALECT, SQLiteDialect.class);
        this.properties.put(HBM2DDL_AUTO, action);
        this.properties.put(SHOW_SQL, showSQL);

        // Set all managed classes
        this.managedClassNames = PersistenceProvider.loadManagedClasses(managedClassNames);
    }

    @Override
    protected PersistenceUnitInfo getPersistenceUnitInfo(String unitName) {
        // return a new persistence unit info
        return new DefaultPersistenceUnitInfo(managedClassNames, unitName);
    }

    @Override
    protected Map<String, Object> getProperties() {
        return properties;
    }
}
