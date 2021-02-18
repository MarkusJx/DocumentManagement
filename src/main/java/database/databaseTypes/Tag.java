package database.databaseTypes;

import database.persistence.CustomPersistenceUnit;

import javax.persistence.Entity;
import javax.persistence.Id;
import java.io.Serializable;
import java.util.Objects;

@Entity
@CustomPersistenceUnit(unitName = "documents")
public class Tag implements Serializable {
    @Id
    public final String name;

    public Tag() {
        this.name = null;
    }

    public Tag(String name) {
        this.name = name;
    }

    @Override
    public String toString() {
        return "database.databaseTypes.Tag{" +
                "name='" + name + '\'' +
                '}';
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Tag tag = (Tag) o;
        return Objects.equals(name, tag.name);
    }

    @Override
    public int hashCode() {
        return Objects.hash(name);
    }
}
