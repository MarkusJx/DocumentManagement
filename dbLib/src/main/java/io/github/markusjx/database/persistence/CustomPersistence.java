package io.github.markusjx.database.persistence;

import org.hibernate.jpa.HibernatePersistenceProvider;

import javax.persistence.EntityManagerFactory;
import javax.persistence.spi.PersistenceUnitInfo;
import java.util.Map;
import java.util.Objects;

/**
 * A class for creating custom entity manager factories.
 * Source: https://stackoverflow.com/a/42372648
 */
public final class CustomPersistence {
    private CustomPersistence() {
    }

    /**
     * Create a custom entity manager factory
     *
     * @param persistenceUnitName the name of the persistence unit
     * @param provider            the persistence provider
     * @return the EntityManagerFactory instance
     */
    public static EntityManagerFactory createEntityManagerFactory(String persistenceUnitName, PersistenceProvider provider) {
        return createEntityManagerFactory(persistenceUnitName, null, provider);
    }

    /**
     * Create a custom entity manager factory
     *
     * @param persistenceUnitName the name of the persistence unit
     * @param properties          the persistence unit properties
     * @param prov                the persistence provider
     * @return the EntityManagerFactory instance
     */
    public static EntityManagerFactory createEntityManagerFactory(String persistenceUnitName, Map<String, Object> properties, PersistenceProvider prov) {
        Objects.requireNonNull(prov);
        Objects.requireNonNull(persistenceUnitName);
        if (properties == null) {
            properties = prov.getProperties();
        }

        // Create a new HibernatePersistenceProvider instance
        final HibernatePersistenceProvider provider = new HibernatePersistenceProvider();

        // Get the persistence unit info
        final PersistenceUnitInfo unitInfo = prov.getPersistenceUnitInfo(persistenceUnitName);

        // Create the entity manager factory
        return provider.createContainerEntityManagerFactory(unitInfo, properties);
    }
}
