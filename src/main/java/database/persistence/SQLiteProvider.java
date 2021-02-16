package database.persistence;

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

import static org.hibernate.cfg.AvailableSettings.*;

public final class SQLiteProvider extends PersistenceProvider {
    private final Map<String, Object> properties;
    private final List<String> managedClassNames;

    public SQLiteProvider() {
        this("database.db", Action.CREATE);
    }

    public SQLiteProvider(String databaseFile, Action action, String... managedClassNames) {
        Objects.requireNonNull(databaseFile);
        if (databaseFile.length() == 0) {
            throw new IllegalArgumentException("The database file name was empty");
        }

        this.properties = new HashMap<>();
        this.properties.put(JPA_JDBC_DRIVER, "org.sqlite.JDBC");
        this.properties.put(JPA_JDBC_URL, "jdbc:sqlite:" + databaseFile);
        this.properties.put(DIALECT, SQLiteDialect.class);
        this.properties.put(HBM2DDL_AUTO, action);
        this.properties.put(SHOW_SQL, true);

        if (managedClassNames == null || managedClassNames.length == 0) {
            this.managedClassNames = null;
        } else {
            this.managedClassNames = Arrays.asList(managedClassNames);
        }
    }

    @Override
    protected PersistenceUnitInfo getPersistenceUnitInfo(String unitName) {
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
                if (managedClassNames == null) {
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
                if (managedClassNames == null) {
                    return Collections.emptyList();
                } else {
                    return managedClassNames;
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
