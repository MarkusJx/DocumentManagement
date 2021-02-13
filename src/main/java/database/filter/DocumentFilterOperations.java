package database.filter;

import javax.persistence.criteria.Expression;
import javax.persistence.criteria.Predicate;

public interface DocumentFilterOperations {
    Predicate where();

    Expression<?> groupBy();

    Predicate having();
}
