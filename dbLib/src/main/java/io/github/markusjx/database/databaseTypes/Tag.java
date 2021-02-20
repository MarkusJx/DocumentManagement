package io.github.markusjx.database.databaseTypes;

import io.github.markusjx.database.persistence.CustomPersistenceUnit;

import javax.persistence.Entity;
import javax.persistence.Id;
import java.io.Serializable;
import java.util.Objects;

/**
 * A tag entity
 */
@Entity
@CustomPersistenceUnit(unitName = "documents")
public class Tag implements Serializable, Comparable<Tag> {
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
        return "io.github.markusjx.database.databaseTypes.Tag{" +
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

    @Override
    public int compareTo(Tag o) {
        if (this.name == null || o.name == null) {
            if (this.name == null && o.name != null) {
                return -1;
            } else if (this.name != null) {
                return 1;
            } else {
                return 0;
            }
        } else {
            return this.name.compareTo(o.name);
        }
    }
}
