package io.github.markusjx.database.filter.filters;

import io.github.markusjx.database.databaseTypes.Document;
import io.github.markusjx.database.filter.DocumentFilterBase;
import io.github.markusjx.database.filter.DocumentFilterOperations;

import javax.persistence.criteria.CriteriaBuilder;
import javax.persistence.criteria.Predicate;
import javax.persistence.criteria.Root;

public class DirectoryFilter implements DocumentFilterBase {
    private final String path;

    public DirectoryFilter(String path) {
        this.path = path;
    }

    @Override
    public DocumentFilterOperations getFilter(CriteriaBuilder cb, Root<Document> root) {
        return new DocumentFilterOperations() {
            @Override
            public Predicate where() {
                return cb.equal(root.get("parentPath"), path);
            }
        };
    }

    @Override
    public int getAccuracy(Document document) {
        return 0;
    }
}
