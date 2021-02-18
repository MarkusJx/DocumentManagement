package database.databaseTypes;

import database.persistence.CustomPersistenceUnit;

import javax.persistence.Embeddable;
import javax.persistence.ManyToOne;
import java.io.Serializable;
import java.util.Objects;

@Embeddable
@CustomPersistenceUnit(unitName = "documents")
public class PropertyValue implements Serializable {
    public final String value;

    @ManyToOne
    public final Property property;

    public PropertyValue() {
        this.value = null;
        this.property = null;
    }

    public PropertyValue(String value, Property property) {
        this.value = value;
        this.property = property;
    }

    @Override
    public String toString() {
        return "PropertyValue{" +
                "value='" + value + '\'' +
                ", property='" + (property == null ? "null" : property.name) +
                "'}";
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        PropertyValue that = (PropertyValue) o;
        return false;// Objects.equals(value, that.value) && Objects.equals(property, that.property);
    }

    @Override
    public int hashCode() {
        return Objects.hash(value);
    }
}
