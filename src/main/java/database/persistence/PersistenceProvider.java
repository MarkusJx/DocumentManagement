package database.persistence;

import javax.persistence.spi.PersistenceUnitInfo;
import java.util.Map;

public abstract class PersistenceProvider {
    protected abstract PersistenceUnitInfo getPersistenceUnitInfo(String unitName);

    protected abstract Map<String, Object> getProperties();
}
