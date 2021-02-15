package database.databaseTypes;

import cApi.interfaces.CConvertible;
import cApi.structs.DocumentPointer;

import javax.persistence.*;
import java.io.Serializable;
import java.time.LocalDate;
import java.util.Arrays;
import java.util.List;

@Entity
public class Document implements Serializable, CConvertible<DocumentPointer> {
    @Column(nullable = false)
    public final String filename;

    @Id
    @Column(nullable = false)
    public final String path;

    @ManyToMany
    @JoinColumn
    public final List<Tag> tags;

    @ManyToMany
    @JoinColumn
    public final List<PropertyValue> properties;

    @Column(columnDefinition = "DATE")
    public final LocalDate creationDate;

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

    @Override
    public String toString() {
        return "database.databaseTypes.Document{filename='" + filename + "', path='" + path + "', properties=" +
                properties + ", creation date=" + creationDate + ", tag=" + tags + "}";
    }

    /*public void writeToPointer(DocumentPointer ptr) {
        NativeImported.copyStringToPointer(ptr.filename(), Constants.DATABASE_LONG_STRING, filename);
        NativeImported.copyStringToPointer(ptr.path(), Constants.DATABASE_LONG_STRING, path);
        NativeImported.copyStringToPointer(ptr.date(), Constants.DATABASE_SHORT_STRING, creationDate.toString());

        ptr.tags(TypeConverter.convertTagList(tags));
        ptr.properties(TypeConverter.convertPropertyValueList(properties));

        ptr.tags().numElements(tags.size());
        ptr.properties().numElements(properties.size());
    }*/

    /*public void freePointer(DocumentPointer toFree) {
        TypeConverter.freeTagArray(toFree.tags());
        TypeConverter.freePropertyValueArray(toFree.properties());
    }*/
}
