package io.github.markusjx.database.types;

import io.github.markusjx.database.persistence.CustomPersistenceUnit;
import io.github.markusjx.util.CompareHelper;

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
     * Copy constructor
     *
     * @param toCopy the tag to copy from
     */
    public Tag(Tag toCopy) {
        this.name = toCopy.name;
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
        return CompareHelper.compareTo(this.name, o.name);
    }
}
