package database.persistence;

import org.hibernate.jpa.HibernatePersistenceProvider;

import javax.persistence.EntityManagerFactory;
import javax.persistence.spi.PersistenceUnitInfo;
import java.util.Map;
import java.util.Objects;

// Source: https://stackoverflow.com/a/42372648
public final class CustomPersistence {
    public static EntityManagerFactory createEntityManagerFactory(String persistenceUnitName, PersistenceProvider provider) {
        return createEntityManagerFactory(persistenceUnitName, null, provider);
    }

    public static EntityManagerFactory createEntityManagerFactory(String persistenceUnitName, Map<String, Object> properties, PersistenceProvider prov) {
        Objects.requireNonNull(prov);
        Objects.requireNonNull(persistenceUnitName);
        if (properties == null) {
            properties = prov.getProperties();
        }

        final HibernatePersistenceProvider provider = new HibernatePersistenceProvider();
        final PersistenceUnitInfo unitInfo = prov.getPersistenceUnitInfo(persistenceUnitName);
        return provider.createContainerEntityManagerFactory(unitInfo, properties);
    }
}
