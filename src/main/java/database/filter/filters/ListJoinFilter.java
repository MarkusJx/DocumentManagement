package database.filter.filters;

import database.databaseTypes.Document;
import database.filter.DocumentFilterOperations;

import javax.persistence.criteria.*;
import java.util.List;

class ListJoinFilter <T> implements DocumentFilterOperations {
    private final Join<Document, List<T>> join;
    private final CriteriaBuilder cb;
    private final List<T> values;
    private final Root<Document> root;

    ListJoinFilter(Join<Document, List<T>> join, CriteriaBuilder cb, List<T> values, Root<Document> root) {
        this.join = join;
        this.cb = cb;
        this.values = values;
        this.root = root;
    }

    @Override
    public Predicate where() {
        return join.in(values);
    }

    @Override
    public Expression<?> groupBy() {
        return root;
    }

    @Override
    public int havingCountGe() {
        return values.size();
    }
}
