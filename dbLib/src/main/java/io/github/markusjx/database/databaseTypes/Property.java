package io.github.markusjx.database.databaseTypes;

import io.github.markusjx.database.persistence.CustomPersistenceUnit;
import io.github.markusjx.util.CompareHelper;

import javax.persistence.*;
import java.io.Serializable;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Objects;

/**
 * A property entity
 */
@Entity
@CustomPersistenceUnit(unitName = "documents")
public class Property implements Serializable, Comparable<Property> {
    /**
     * The property name
     */
    @Id
    @Column
    public final String name;

    /**
     * All possible values for this property
     */
    @JoinColumn
    @ManyToMany(cascade = CascadeType.REFRESH)
    public final List<PropertyValue> values;

    /**
     * Create an empty property instance
     */
    public Property() {
        this.name = null;
        this.values = null;
    }

    /**
     * Create a property with just a name
     *
     * @param name the name of the property
     */
    public Property(String name) {
        this.name = name;
        this.values = new ArrayList<>();
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
     * Create a new property instance
     *
     * @param name       the property name
     * @param properties the property values
     */
    public Property(String name, PropertyValue... properties) {
        this.name = name;
        this.values = new ArrayList<>(Arrays.asList(properties));
    }

    /**
     * Create a property from a property and a list of property values
     *
     * @param property       the property to copy
     * @param propertyValues the property values
     */
    public Property(Property property, List<PropertyValue> propertyValues) {
        this.name = property.name;
        this.values = propertyValues;
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

    /**
     * Add a property value to this property.
     * Only adds the value if it hasn't already been added.
     *
     * @param propertyValue the {@link PropertyValue} to add
     */
    public void addValue(PropertyValue propertyValue) {
        if (!values.contains(propertyValue)) {
            values.add(propertyValue);
        }
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

    @Override
    public int compareTo(Property o) {
        return CompareHelper.compareTo(this.name, o.name);
    }
}
