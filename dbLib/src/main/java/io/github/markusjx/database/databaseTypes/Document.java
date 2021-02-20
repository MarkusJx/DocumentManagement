package io.github.markusjx.database.databaseTypes;

import io.github.markusjx.database.persistence.CustomPersistenceUnit;

import javax.persistence.*;
import java.io.Serializable;
import java.time.LocalDate;
import java.util.Arrays;
import java.util.List;

/**
 * A document entity
 */
@Entity
@CustomPersistenceUnit(unitName = "documents")
public class Document implements Serializable {
    /**
     * The file name. Must not be null.
     */
    @Column(nullable = false)
    public final String filename;

    /**
     * The file path
     */
    @Id
    @Column(nullable = false)
    public final String path;

    /**
     * The tags of this documents
     */
    @ManyToMany
    @JoinColumn
    public final List<Tag> tags;

    /**
     * The property value sets of this documents
     */
    @JoinColumn
    @ElementCollection
    public final List<PropertyValueSet> properties;

    /**
     * The creation date
     */
    @Column(columnDefinition = "DATE")
    public final LocalDate creationDate;

    /**
     * Create a null documents
     */
    public Document() {
        this.filename = null;
        this.path = null;
        this.properties = null;
        this.creationDate = null;
        this.tags = null;
    }

    /**
     * Create a new document
     *
     * @param filename     the document file name
     * @param path         the document path
     * @param properties   the property value sets
     * @param creationDate the creation date
     * @param tags         the tag list
     */
    public Document(String filename, String path, List<PropertyValueSet> properties, LocalDate creationDate, Tag... tags) {
        this.filename = filename;
        this.path = path;
        this.properties = properties;
        this.creationDate = creationDate;

        if (tags != null) {
            this.tags = Arrays.asList(tags);
        } else {
            this.tags = null;
        }
    }

    @Override
    public String toString() {
        return "io.github.markusjx.database.databaseTypes.Document{filename='" + filename + "', path='" + path + "', properties=" +
                properties + ", creation date=" + creationDate + ", tag=" + tags + "}";
    }
}
