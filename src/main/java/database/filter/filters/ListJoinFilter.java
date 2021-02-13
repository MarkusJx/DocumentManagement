package database.filter.filters;

import database.databaseTypes.Document;
import database.filter.DocumentFilterOperations;

import javax.persistence.criteria.*;
import java.util.List;

class ListJoinFilter <T> implements DocumentFilterOperations {
    private final Join<Document, List<T>> join;
    private final CriteriaBuilder cb;
    private final List<T> values;

    ListJoinFilter(Join<Document, List<T>> join, CriteriaBuilder cb, List<T> values) {
        this.join = join;
        this.cb = cb;
        this.values = values;
    }

    @Override
    public Predicate where() {
        return join.in(values);
    }

    @Override
    public Expression<?> groupBy() {
        return null;
    }

    @Override
    public Predicate having() {
        return cb.equal(cb.count(join), (long) values.size());
    }
}
