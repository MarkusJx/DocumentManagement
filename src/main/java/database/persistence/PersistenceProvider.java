package database.persistence;

import datatypes.ChainedHashMap;
import org.reflections.Reflections;

import javax.persistence.spi.PersistenceUnitInfo;
import java.util.Arrays;
import java.util.Map;
import java.util.Set;

public abstract class PersistenceProvider {
    protected static ChainedHashMap<String, String> loadManagedClasses(String[] managedClasses) {
        ChainedHashMap<String, String> map = new ChainedHashMap<>();
        if (managedClasses != null && managedClasses.length > 0) {
            map.set(null, Arrays.asList(managedClasses));
        }

        Reflections reflections = new Reflections("");
        Set<Class<?>> annotated = reflections.getTypesAnnotatedWith(CustomPersistenceUnit.class);

        annotated.forEach(c -> map.putValue(c.getAnnotation(CustomPersistenceUnit.class).unitName(), c.getName()));
        System.out.println(map);
        return map;
    }

    protected abstract PersistenceUnitInfo getPersistenceUnitInfo(String unitName);

    protected abstract Map<String, Object> getProperties();
}
