package database.databaseTypes;

import database.persistence.CustomPersistenceUnit;

import javax.persistence.Column;
import javax.persistence.ElementCollection;
import javax.persistence.Entity;
import javax.persistence.Id;
import java.io.Serializable;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

@Entity
@CustomPersistenceUnit(unitName = "documents")
public class Property implements Serializable {
    @Id
    @Column
    public final String name;

    @ElementCollection
    List<PropertyValue> values;

    public Property() {
        this.name = null;
        this.values = null;
    }

    public Property(String name, String... values) {
        this.name = name;
        this.values = new ArrayList<>();
        for (String v : values) {
            this.values.add(new PropertyValue(v, this));
        }
    }

    public void addValue(String value) {
        values.add(new PropertyValue(value, this));
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
