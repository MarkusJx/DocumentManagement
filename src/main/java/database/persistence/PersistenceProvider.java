package database.persistence;

import datatypes.ChainedHashMap;
import org.reflections.Reflections;

import javax.persistence.spi.PersistenceUnitInfo;
import java.util.Arrays;
import java.util.Map;
import java.util.Set;

/**
 * A custom persistence provider
 */
public abstract class PersistenceProvider {
    /**
     * Load all managed classes.
     * Gets all with {@link CustomPersistenceUnit} annotated classes.
     *
     * @param managedClasses a list of managed classes
     * @return all managed classes by their name
     */
    protected static ChainedHashMap<String, String> loadManagedClasses(String[] managedClasses) {
        ChainedHashMap<String, String> map = new ChainedHashMap<>();
        // If managedClasses is not null nor empty, add these values to the result map
        if (managedClasses != null && managedClasses.length > 0) {
            map.put(null, Arrays.asList(managedClasses));
        }

        // Initiate reflections and get all annotated classes
        Reflections reflections = new Reflections("");
        Set<Class<?>> annotated = reflections.getTypesAnnotatedWith(CustomPersistenceUnit.class);

        // Put all annotated classes into the result map
        annotated.forEach(c -> map.putValue(c.getAnnotation(CustomPersistenceUnit.class).unitName(), c.getName()));
        return map;
    }

    /**
     * Get the persistence unit info
     *
     * @param unitName the name of the persistence unit
     * @return the persistence unit info
     */
    protected abstract PersistenceUnitInfo getPersistenceUnitInfo(String unitName);

    /**
     * Get the properties of this persistence unit
     *
     * @return the property map
     */
    protected abstract Map<String, Object> getProperties();
}
