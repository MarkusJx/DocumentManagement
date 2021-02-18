package database.databaseTypes;

import database.persistence.CustomPersistenceUnit;

import javax.persistence.*;
import java.io.Serializable;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

/**
 * A property entity
 */
@Entity
@CustomPersistenceUnit(unitName = "documents")
public class Property implements Serializable {
    /**
     * The property name
     */
    @Id
    @Column
    public final String name;

    /**
     * All possible values for this property
     */
    @ManyToMany
    @JoinColumn
    public final List<PropertyValue> values;

    /**
     * Create an empty property instance
     */
    public Property() {
        this.name = null;
        this.values = null;
    }

    /**
     * Create a property instance
     *
     * @param name   the property name
     * @param values the property values
     */
    public Property(String name, String... values) {
        this.name = name;
        this.values = new ArrayList<>(values.length);
        for (String v : values) {
            this.values.add(new PropertyValue(v));
        }
    }

    /**
     * Add a property value to this property
     *
     * @param value the value to add
     * @return the just added PropertyValue
     */
    public PropertyValue addValue(String value) {
        PropertyValue pv = new PropertyValue(value);
        if (!values.contains(pv))
            values.add(pv);

        return pv;
    }

    @Override
    public String toString() {
        return "Property{" +
                "name='" + name + '\'' +
                ", values=" + values +
                '}';
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Property property = (Property) o;
        return Objects.equals(name, property.name);
    }

    @Override
    public int hashCode() {
        return Objects.hash(name);
    }
}
