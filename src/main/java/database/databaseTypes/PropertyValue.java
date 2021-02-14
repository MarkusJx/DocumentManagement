package database.databaseTypes;

import cApi.NativeImported;
import cApi.interfaces.CConvertible;
import cApi.structs.PropertyValuePointer;

import javax.persistence.Entity;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import java.io.Serializable;
import java.util.Objects;

@Entity
public class PropertyValue implements Serializable, CConvertible<PropertyValuePointer> {
    @Id
    public final String value;

    @ManyToOne
    @JoinColumn
    public final Property property;

    public PropertyValue() {
        this.value = null;
        this.property = null;
    }

    public PropertyValue(String value, Property property) {
        this.value = value;
        this.property = property;
    }

    @Override
    public String toString() {
        return "PropertyValue{" +
                "value='" + value + '\'' +
                ", property=" + property +
                '}';
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        PropertyValue that = (PropertyValue) o;
        return Objects.equals(value, that.value) && Objects.equals(property, that.property);
    }

    @Override
    public int hashCode() {
        return Objects.hash(value, property);
    }

    @Override
    public void writeToPointer(PropertyValuePointer ptr) {
        if (value == null || property == null) return;
        NativeImported.copyStringToPointer(ptr.value(), PropertyValuePointer.value_size, value);
        property.writeToPointer(ptr.property());
    }
}
