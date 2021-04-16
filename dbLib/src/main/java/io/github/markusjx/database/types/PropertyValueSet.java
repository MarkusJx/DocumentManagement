package io.github.markusjx.database.types;

import javax.persistence.Embeddable;
import javax.persistence.ManyToOne;
import java.util.Objects;

/**
 * A property value set
 */
@Embeddable
public class PropertyValueSet {
    /**
     * The property in this set
     */
    @ManyToOne
    public final Property property;

    /**
     * The property value
     */
    @ManyToOne
    public final PropertyValue propertyValue;

    /**
     * Create an empty property value set
     */
    public PropertyValueSet() {
        this.property = null;
        this.propertyValue = null;
    }

    /**
     * Copy constructor
     *
     * @param toCopy the object to copy from
     */
    public PropertyValueSet(PropertyValueSet toCopy) {
        this.property = toCopy.property;
        this.propertyValue = toCopy.propertyValue;
    }

    /**
     * Create a property value set
     *
     * @param property      the property
     * @param propertyValue the property value
     */
    public PropertyValueSet(Property property, PropertyValue propertyValue) {
        this.property = property;
        this.propertyValue = propertyValue;
    }

    @Override
    public String toString() {
        return "PropertyWithValue{" +
                "property=" + property +
                ", propertyValue=" + propertyValue +
                '}';
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        PropertyValueSet that = (PropertyValueSet) o;
        return Objects.equals(property, that.property) && Objects.equals(propertyValue, that.propertyValue);
    }

    @Override
    public int hashCode() {
        return Objects.hash(property, propertyValue);
    }
}
