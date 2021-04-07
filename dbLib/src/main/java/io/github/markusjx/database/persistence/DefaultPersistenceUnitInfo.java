package io.github.markusjx.database.persistence;

import io.github.markusjx.datatypes.ChainedHashMap;

import javax.persistence.SharedCacheMode;
import javax.persistence.ValidationMode;
import javax.persistence.spi.ClassTransformer;
import javax.persistence.spi.PersistenceUnitInfo;
import javax.persistence.spi.PersistenceUnitTransactionType;
import javax.sql.DataSource;
import java.io.IOException;
import java.io.UncheckedIOException;
import java.net.URL;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Properties;
import java.util.stream.Collectors;

public class DefaultPersistenceUnitInfo implements PersistenceUnitInfo {
    /**
     * All by this provider managed classes
     */
    private final ChainedHashMap<String, String> managedClassNames;

    private final String unitName;

    public DefaultPersistenceUnitInfo(ChainedHashMap<String, String> managedClassNames, String unitName) {
        this.managedClassNames = managedClassNames;
        this.unitName = unitName;
    }

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
        // We don't need this
    }

    @Override
    public ClassLoader getNewTempClassLoader() {
        return null;
    }
}
