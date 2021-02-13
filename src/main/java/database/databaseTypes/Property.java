package database.databaseTypes;

import javax.persistence.Entity;
import javax.persistence.Id;
import java.io.Serializable;
import java.util.Objects;

@Entity
public class Property implements Serializable {
    @Id
    public final String name;

    public Property() {
        this.name = null;
    }

    public Property(String name) {
        this.name = name;
    }

    @Override
    public String toString() {
        return "Property{" +
                "name='" + name + '\'' +
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
