package database.filter;

import javax.persistence.criteria.Expression;
import javax.persistence.criteria.Predicate;

public interface DocumentFilterOperations {
    default Predicate where() {
        return null;
    }

    default Expression<?> groupBy() {
        return null;
    }

    default int havingCountGe() {
        return 0;
    }
}
