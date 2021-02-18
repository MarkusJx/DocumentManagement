package database.filter.filters;

import database.databaseTypes.Document;
import database.databaseTypes.PropertyValue;
import database.filter.DocumentFilterBase;
import database.filter.DocumentFilterOperations;
import datatypes.ChainedHashMap;

import javax.persistence.criteria.*;
import java.util.ArrayList;
import java.util.List;

public class PropertyFilter implements DocumentFilterBase {
    private final ChainedHashMap<String, String> properties;

    public PropertyFilter(ChainedHashMap<String, String> props) {
        this.properties = props;
    }

    public PropertyFilter(String... props) {
        if (props.length % 2 != 0) {
            throw new IllegalArgumentException("The number of arguments must be even");
        }

        this.properties = new ChainedHashMap<>();
        for (int i = 0; i < props.length; i += 2) {
            properties.putValue(props[i], props[i + 1]);
        }
    }

    @Override
    public DocumentFilterOperations getFilter(CriteriaBuilder cb, Root<Document> root) {
        Join<Document, List<PropertyValue>> join = root.join("properties", JoinType.INNER);
        return new DocumentFilterOperations() {
            @Override
            public Predicate where() {
                Path<String> propertyValue = join.get("value");
                Path<String> propertyName = join.get("property").get("name");

                List<Predicate> predicates = new ArrayList<>(properties.size());
                properties.forEach((pn, pv) ->
                        predicates.add(cb.and(cb.equal(propertyName, pn), cb.equal(propertyValue, pv))));

                if (predicates.isEmpty()) {
                    return null;
                } else {
                    return cb.or(predicates.toArray(new Predicate[0]));
                }
            }

            @Override
            public Expression<?> groupBy() {
                return root;
            }

            @Override
            public int havingCountGe() {
                // This increases the match count by one
                return 1;
            }
        };
    }

    @Override
    public int getMatches(Document document) {
        int res = 0;
        for (PropertyValue p : document.properties) {
            //if (propertiesContains(p)) res++;
        }
        return res;
    }

    /*private boolean propertiesContains(PropertyValue property) {
        for (PropertyValue p : properties) {
            if (p.equals(property)) return true;
        }
        return false;
    }*/
}
