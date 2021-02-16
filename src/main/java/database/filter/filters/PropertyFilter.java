package database.filter.filters;

import database.databaseTypes.Document;
import database.databaseTypes.Property;
import database.databaseTypes.PropertyValue;
import database.filter.DocumentFilterBase;
import database.filter.DocumentFilterOperations;

import javax.persistence.criteria.CriteriaBuilder;
import javax.persistence.criteria.Join;
import javax.persistence.criteria.JoinType;
import javax.persistence.criteria.Root;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class PropertyFilter implements DocumentFilterBase {
    private final List<PropertyValue> properties;

    public PropertyFilter(Map<String, String> props) {
        this.properties = new ArrayList<>();
        convertPropertyMap(props);
    }

    public PropertyFilter(String... props) {
        if (props.length % 2 != 0) {
            throw new IllegalArgumentException("The number of arguments must be even");
        }

        Map<String, String> propertyMap = new HashMap<>();
        for (int i = 0; i < props.length; i += 2) {
            propertyMap.put(props[i], props[i + 1]);
        }

        this.properties = new ArrayList<>();
        convertPropertyMap(propertyMap);
    }

    private static Property getFromList(List<Property> list, String name) {
        for (Property e : list) {
            if (e.name.equals(name)) return e;
        }
        return null;
    }

    private void convertPropertyMap(Map<String, String> props) {
        List<Property> propertyObjects = new ArrayList<>();
        for (Map.Entry<String, String> e : props.entrySet()) {
            Property prop = getFromList(propertyObjects, e.getKey());
            if (prop == null) {
                prop = new Property(e.getKey());
                propertyObjects.add(prop);
            }

            this.properties.add(new PropertyValue(e.getValue(), prop));
        }
    }

    @Override
    public DocumentFilterOperations getFilter(CriteriaBuilder cb, Root<Document> root) {
        Join<Document, List<PropertyValue>> join = root.join("properties", JoinType.LEFT);
        return new ListJoinFilter<>(join, cb, properties);
    }

    @Override
    public int getMatches(Document document) {
        int res = 0;
        for (PropertyValue p : document.properties) {
            if (propertiesContains(p)) res++;
        }
        return res;
    }

    private boolean propertiesContains(PropertyValue property) {
        for (PropertyValue p : properties) {
            if (p.equals(property)) return true;
        }
        return false;
    }
}
