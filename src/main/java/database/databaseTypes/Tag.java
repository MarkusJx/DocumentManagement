package database.databaseTypes;

import database.persistence.CustomPersistenceUnit;

import javax.persistence.Entity;
import javax.persistence.Id;
import java.io.Serializable;
import java.util.Objects;

/**
 * A tag entity
 */
@Entity
@CustomPersistenceUnit(unitName = "documents")
public class Tag implements Serializable {
    /**
     * The tag name
     */
    @Id
    public final String name;

    /**
     * Create an empty tag instance
     */
    public Tag() {
        this.name = null;
    }

    /**
     * Create a new tag instance
     *
     * @param name the name of the tag
     */
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
