package io.github.markusjx.database.persistence;

import io.github.markusjx.datatypes.ChainedHashMap;
import org.hibernate.dialect.MariaDBDialect;
import org.hibernate.tool.schema.Action;

import javax.persistence.spi.PersistenceUnitInfo;
import java.util.HashMap;
import java.util.Map;

import static org.hibernate.cfg.AvailableSettings.*;

public class MariaDBProvider extends PersistenceProvider {
    /**
     * The property map
     */
    private final Map<String, Object> properties;

    /**
     * All by this provider managed classes
     */
    private final ChainedHashMap<String, String> managedClassNames;

    public MariaDBProvider(String url, String user, String password, Action action, Boolean showSQL, String... managedClassNames) {
        this.properties = new HashMap<>();
        this.properties.put(JPA_JDBC_DRIVER, "org.mariadb.jdbc.Driver");
        this.properties.put(JPA_JDBC_URL, "jdbc:mariadb://" + url);
        this.properties.put(JPA_JDBC_USER, user);
        this.properties.put(JPA_JDBC_PASSWORD, password);
        this.properties.put(DIALECT, MariaDBDialect.class);
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
