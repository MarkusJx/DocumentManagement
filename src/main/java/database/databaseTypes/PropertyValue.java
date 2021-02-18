package database.databaseTypes;

import database.persistence.CustomPersistenceUnit;

import javax.persistence.Entity;
import javax.persistence.Id;
import java.io.Serializable;
import java.util.Objects;

/**
 * A property value
 */
@Entity
@CustomPersistenceUnit(unitName = "documents")
public class PropertyValue implements Serializable {
    /**
     * The actual value
     */
    @Id
    public final String value;

    /**
     * Create an empty property value
     */
    public PropertyValue() {
        this.value = null;
    }

    /**
     * Create a property value
     *
     * @param value the property value
     */
    public PropertyValue(String value) {
        this.value = value;
    }

    @Override
    public String toString() {
        return "PropertyValue{" +
                "value='" + value + '\'' +
                '}';
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        PropertyValue that = (PropertyValue) o;
        return Objects.equals(value, that.value);
    }

    @Override
    public int hashCode() {
        return Objects.hash(value);
    }
}
