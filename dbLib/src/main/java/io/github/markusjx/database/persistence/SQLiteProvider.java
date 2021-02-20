package io.github.markusjx.database.persistence;

import io.github.markusjx.datatypes.ChainedHashMap;
import org.hibernate.dialect.SQLiteDialect;
import org.hibernate.tool.schema.Action;

import javax.persistence.SharedCacheMode;
import javax.persistence.ValidationMode;
import javax.persistence.spi.ClassTransformer;
import javax.persistence.spi.PersistenceUnitInfo;
import javax.persistence.spi.PersistenceUnitTransactionType;
import javax.sql.DataSource;
import java.io.IOException;
import java.io.UncheckedIOException;
import java.net.URL;
import java.util.*;
import java.util.stream.Collectors;

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
        return new PersistenceUnitInfo() {
            @Override
            public String getPersistenceUnitName() {
                return unitName;
            }

            @Override
            public String getPersistenceProviderClassName() {
                return "org.hibernate.jpa.HibernatePersistenceProvider";
            }

            @Override
            public PersistenceUnitTransactionType getTransactionType() {
                return PersistenceUnitTransactionType.RESOURCE_LOCAL;
            }

            @Override
            public DataSource getJtaDataSource() {
                return null;
            }

            @Override
            public DataSource getNonJtaDataSource() {
                return null;
            }

            @Override
            public List<String> getMappingFileNames() {
                return Collections.emptyList();
            }

            @Override
            public List<java.net.URL> getJarFileUrls() {
                // If managedClassNames is empty, return all resource urls
                if (managedClassNames.isEmpty()) {
                    try {
                        return Collections.list(this.getClass()
                                .getClassLoader()
                                .getResources(""));
                    } catch (IOException e) {
                        throw new UncheckedIOException(e);
                    }
                } else {
                    return Collections.emptyList();
                }
            }

            @Override
            public URL getPersistenceUnitRootUrl() {
                return null;
            }

            @Override
            public List<String> getManagedClassNames() {
                // If managedClassNames is empty, return an empty list
                if (managedClassNames.isEmpty()) {
                    return Collections.emptyList();
                } else {
                    // Get all class names managed by this persistence unit
                    List<String> classNames = new ArrayList<>();
                    managedClassNames.forEach((k, v) -> {
                        if (k == null || k.equals(unitName)) {
                            classNames.addAll(v);
                        }
                    });

                    return classNames.stream().distinct().collect(Collectors.toList());
                }
            }

            @Override
            public boolean excludeUnlistedClasses() {
                return false;
            }

            @Override
            public SharedCacheMode getSharedCacheMode() {
                return null;
            }

            @Override
            public ValidationMode getValidationMode() {
                return null;
            }

            @Override
            public Properties getProperties() {
                return new Properties();
            }

            @Override
            public String getPersistenceXMLSchemaVersion() {
                return null;
            }

            @Override
            public ClassLoader getClassLoader() {
                return null;
            }

            @Override
            public void addTransformer(ClassTransformer transformer) {

            }

            @Override
            public ClassLoader getNewTempClassLoader() {
                return null;
            }
        };
    }

    @Override
    protected Map<String, Object> getProperties() {
        return properties;
    }
}
