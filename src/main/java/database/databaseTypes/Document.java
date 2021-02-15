package database.databaseTypes;

import javax.persistence.*;
import java.io.Serializable;
import java.time.LocalDate;
import java.util.Arrays;
import java.util.List;

@Entity
public class Document implements Serializable {
    @Column(nullable = false)
    private String filename;

    @Id
    @Column(nullable = false)
    private String path;

    @ManyToMany
    @JoinColumn
    private List<Tag> tags;

    @ManyToMany
    @JoinColumn
    private List<PropertyValue> properties;

    @Column(columnDefinition = "DATE")
    private LocalDate creationDate;

    public Document() {
        this.filename = null;
        this.path = null;
        this.properties = null;
        this.creationDate = null;
        this.tags = null;
    }

    public Document(String filename, String path, List<PropertyValue> properties, LocalDate creationDate, Tag... tags) {
        this.filename = filename;
        this.path = path;
        this.properties = properties;
        this.creationDate = creationDate;
        this.tags = Arrays.asList(tags);
    }

    public String getFilename() {
        return filename;
    }

    public String getPath() {
        return path;
    }

    public List<Tag> getTags() {
        return tags;
    }

    public List<PropertyValue> getProperties() {
        return properties;
    }

    public LocalDate getCreationDate() {
        return creationDate;
    }

    @Override
    public String toString() {
        return "database.databaseTypes.Document{filename='" + filename + "', path='" + path + "', properties=" +
                properties + ", creation date=" + creationDate + ", tag=" + tags + "}";
    }
}
