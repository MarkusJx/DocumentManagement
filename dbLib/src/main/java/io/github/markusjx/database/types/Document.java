package io.github.markusjx.database.types;

import io.github.markusjx.database.persistence.CustomPersistenceUnit;

import javax.persistence.*;
import java.io.Serializable;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Objects;

/**
 * A document entity
 */
@Entity
@CustomPersistenceUnit(unitName = "documents")
public class Document implements Serializable, Comparable<Document> {
    /**
     * The file name. Must not be null.
     */
    @Column(nullable = false)
    public final String filename;

    /**
     * The file path
     */
    @Id
    @Column
    public final String absolutePath;

    /**
     * The path of the directory this document is in
     */
    @Column
    public final String parentPath;

    /**
     * The tags of this documents
     */
    @JoinColumn
    @ManyToMany(cascade = CascadeType.REFRESH)
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
    public LocalDate creationDate;

    /**
     * Create a null documents
     */
    public Document() {
        this.filename = null;
        this.absolutePath = null;
        this.properties = null;
        this.creationDate = null;
        this.tags = null;
        this.parentPath = null;
    }

    /**
     * Copy constructor
     *
     * @param toCopy the document to copy the data from
     */
    public Document(Document toCopy) {
        this.filename = toCopy.filename;
        this.absolutePath = toCopy.absolutePath;
        this.properties = new ArrayList<>(toCopy.properties.size());
        this.creationDate = toCopy.creationDate;
        this.tags = new ArrayList<>(toCopy.tags.size());
        this.parentPath = toCopy.parentPath;

        for (PropertyValueSet set : toCopy.properties) {
            this.properties.add(new PropertyValueSet(set));
        }

        for (Tag tag : toCopy.tags) {
            this.tags.add(new Tag(tag));
        }
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
        this.absolutePath = path;
        this.properties = properties;
        this.creationDate = creationDate;
        this.parentPath = getParentPath();

        if (tags != null) {
            this.tags = new ArrayList<>(Arrays.asList(tags));
        } else {
            this.tags = new ArrayList<>();
        }
    }

    /**
     * Get the parent path from the absolute path
     *
     * @return the parent directory path
     */
    private String getParentPath() {
        try {
            return this.absolutePath.substring(0, this.absolutePath.length() - (this.filename.length() + 1));
        } catch (Exception e) {
            return "";
        }
    }

    @Override
    public String toString() {
        return "Document{filename='" + filename + "', path='" + absolutePath + "', properties=" +
                properties + ", creation date=" + creationDate + ", tag=" + tags + "}";
    }

    @Override
    public int compareTo(Document o) {
        return this.absolutePath.compareTo(o.absolutePath);
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Document document = (Document) o;
        return Objects.equals(absolutePath, document.absolutePath);
    }

    @Override
    public int hashCode() {
        return Objects.hash(absolutePath);
    }
}
