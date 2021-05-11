package io.github.markusjx.database.filter.filters;

import io.github.markusjx.database.filter.DocumentFilterBase;
import io.github.markusjx.database.filter.DocumentFilterOperations;
import io.github.markusjx.database.types.Document;
import io.github.markusjx.database.types.PropertyValueSet;
import io.github.markusjx.datatypes.ChainedHashMap;

import javax.persistence.criteria.*;
import java.util.ArrayList;
import java.util.List;

/**
 * A filter for filtering documents by their properties
 */
public class PropertyFilter implements DocumentFilterBase {
    /**
     * The property map
     */
    private final ChainedHashMap<String, String> properties;

    /**
     * Create a property filter from a {@link ChainedHashMap}
     *
     * @param properties the map containing the values
     */
    public PropertyFilter(ChainedHashMap<String, String> properties) {
        this.properties = properties;
    }

    /**
     * Get a property filter by properties.
     * props.length must be a multiple of 2.
     * The first value must always be the key,
     * the second value is the value, e.g.
     * <code>props[0]</code> would be the key,
     * <code>props[1]</code> would be the value,
     * <code>props[2]</code> would be the next key.
     *
     * @param props the properties array
     */
    public PropertyFilter(String... props) {
        // Check if the length matches
        if (props.length % 2 != 0) {
            throw new IllegalArgumentException("The number of arguments must be even");
        }

        // Convert the properties to a new ChainedHashMap
        this.properties = new ChainedHashMap<>();
        for (int i = 0; i < props.length; i += 2) {
            properties.putValue(props[i], props[i + 1]);
        }
    }

    @SuppressWarnings("unused")
    public PropertyFilter(PropertyFilter other) {
        this.properties = other.properties;
    }

    /**
     * Get the filters
     *
     * @param cb   the criteria builder object
     * @param root the root object
     * @return the filters
     */
    @Override
    public DocumentFilterOperations getFilter(CriteriaBuilder cb, Root<Document> root) {
        // Join document on properties
        Join<Document, List<PropertyValueSet>> join = root.join("properties", JoinType.INNER);

        // Return the filter operations
        return new DocumentFilterOperations() {
            @Override
            public Predicate where() {
                // Get the property value and name paths
                Path<String> propertyValue = join.get("propertyValue").get("value");
                Path<String> propertyName = join.get("property").get("name");

                // Get the predicates. Should create a query like this:
                // (d.pn = pn1 and d.pv = pv1) or (d.pn = pn2 and d.pv = pv2)...
                // With d being the document, pn the property name and
                // pv the property value.
                List<Predicate> predicates = new ArrayList<>(properties.size());
                properties.forEach((pn, pv) ->
                        predicates.add(cb.and(cb.equal(propertyName, pn), cb.equal(propertyValue, pv))));

                // If the predicate list is empty, return null
                if (predicates.isEmpty()) {
                    return null;
                } else {
                    // Or-match all predicates
                    return cb.or(predicates.toArray(new Predicate[0]));
                }
            }

            @Override
            public Expression<Document> groupBy() {
                // Group by root. Required for having count(root.path).
                return root;
            }

            @Override
            public int havingCountGe() {
                // This increases the match count by one
                return 1;
            }
        };
    }

    /**
     * Get the accuracy
     *
     * @param document the document object to match
     * @return the match accuracy
     */
    @Override
    public int getAccuracy(Document document) {
        // document.properties.size must be >= properties.size(),
        // subtract those two values
        return document.properties.size() - properties.size();
    }
}
